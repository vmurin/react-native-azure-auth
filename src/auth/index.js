import Client from '../networking'
import { validate } from '../utils/validate'
import { toCamelCase } from '../utils/camel'
import AuthError from './authError'
import TokenCache from '../token/cache'
import log from '../utils/logger'

import { NativeModules, Platform } from 'react-native'
import Scope from '../token/scope'

const { AzureAuth } = NativeModules

function responseHandler (response, exceptions = {}) {
    if (response.ok && response.json) {
        return toCamelCase(response.json, exceptions)
    } else if(response.ok && response.blob) {
        return response.blob
    }
    throw new AuthError(response)
}

/**
 * Azure AD V2 Auth API
 *
 * @export Auth
 * @see https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-protocols
 *
 * @class Auth
 */
export default class Auth {
    constructor(options = {}) {
        const bundleIdentifier = AzureAuth.bundleIdentifier
        const defaultRedirectUri = `${bundleIdentifier.toLowerCase()}://${bundleIdentifier.toLowerCase()}/${Platform.OS}/callback`


        this.client = new Client(options)
        const { clientId, redirectUri, persistentCache } = options
        if (!clientId) {
            throw new Error('Missing clientId in parameters')
        }
        this.cache = new TokenCache( {clientId, persistent: persistentCache} )
        this.authorityUrl = this.client.baseUrl
        this.clientId = clientId
        this.redirectUri = redirectUri || defaultRedirectUri
    }

    /**
   * Builds the full authorize endpoint url in the Authorization Server (AS) with given parameters.
   *
   * @param {Object} parameters parameters to send to `/authorize`
   * @param {String} parameters.responseType type of the response to get from `/authorize`.
   * @param {String} parameters.redirectUri where the AS will redirect back after success or failure.
   * @param {String} parameters.state random string to prevent CSRF attacks.
   * @param {String} parameters.scope a space-separated list of scopes that you want the user to consent to.
   * @param {String} parameters.prompt (optional) indicates the type of user interaction that is required.
   *    The only valid values at this time are 'login', 'none', and 'consent'.
   * @param {String} parameters.authorityUrl (optional)the authorityUrl for signup or other flows directly
   * @returns {String} authorize url with specified parameters to redirect to for AuthZ/AuthN.
   *
   * @see https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-protocols-oauth-code
   *
   * @memberof Auth
   */
    loginUrl(parameters = {}) {
        const {authorityUrl, ...restParameters} = parameters;
        const query = validate({
            parameters: {
                responseType: { required: true, toName: 'response_type' },
                scope: { required: true },
                state: { required: true },
                prompt: {}
            },
            validate: false // not declared params are allowed:
        }, restParameters)
        return this.client.url('authorize',
            {...query,
                client_id: this.clientId,
                redirect_uri: this.redirectUri
            }, authorityUrl)
    }

    /**
   * Builds the full logout endpoint url in the Authorization Server (AS) with given parameters.
   * https://login.microsoftonline.com/common/oauth2/logout?post_logout_redirect_uri=[URI]&redirect_uri=[URI]
   *
   * @returns {String} logout url with default parameter
   *
   * @memberof Auth
   */
    logoutUrl() {
        return this.client.url('logout', {
            post_logout_redirect_uri: this.redirectUri,
            redirect_uri: this.redirectUri
        })
    }

    /**
   * Exchanges a code obtained via `/authorize` for the access tokens
   *
   * @param {Object} input input used to obtain tokens from a code
   * @param {String} input.code code returned by `/authorize`.
   * @param {String} input.redirectUri original redirectUri used when calling `/authorize`.
   * @param {String} input.scope A space-separated list of scopes.
   *    The scopes requested in this leg must be equivalent to or a subset of the scopes requested in the first leg
   * @returns {Promise}
   * @see https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-protocols-oauth-code#request-an-access-token
   *
   * @memberof Auth
   */
    exchange(input = {}) {
        const payload = validate({
            parameters: {
                code: { required: true },
                scope: { required: true },
                code_verifier: { required: true },
            }
        }, input)

        return this.client
            .post('token',
                {...payload,
                    client_id: this.clientId,
                    redirect_uri: this.redirectUri,
                    grant_type: 'authorization_code'})
            .then(responseHandler)
    }

    /**
   * Obtain new tokens (access and id) using the Refresh Token obtained during Auth (requesting `offline_access` scope)
   *
   * @param {Object} parameters refresh token parameters
   * @param {String} parameters.refreshToken user's issued refresh token
   * @param {String} parameters.scope scopes requested for the issued tokens.
   * @param {String} [parameters.redirectUri] the same redirect_uri value that was used to acquire the authorization_code.
   * @returns {Promise}
   * @see https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-protocols-oauth-code#refresh-the-access-token
   *
   * @memberof Auth
   */
    refreshTokens(parameters = {redirectUri: this.redirectUri}) {
        const payload = validate({
            parameters: {
                refreshToken: { required: true, toName: 'refresh_token' },
                scope: { required: true }
            }
        }, parameters)
        const scope = new Scope(payload.scope)
        return this.client
            .post('token', {
                ...payload,
                client_id: this.clientId,
                grant_type: 'refresh_token',
                redirect_uri: this.redirectUri,
                scope: scope.toString()
            })
            .then((response) => {
                if (response.ok && response.json) {
                    return toCamelCase(response.json)
                } else {
                    // on missing consent Azure also answers with HTTP 400 code
                    // Error: AADSTS65001, response.json.error_codes[0] == 65001
                    log.error('Could not refresh token: ', response)
                    return Promise.reject(null)
                }
            })
    }

    /**
     * Try to obtain token silently without user interaction
     *
     * @param {Object} parameters
     * @param {String} parameters.userId user login name (e.g. from Id token)
     * @param {String} parameters.scope scopes requested for the issued tokens.
     *
     * @memberof Auth
     */
    async acquireTokenSilent(parameters = {}) {
        const input = validate({
            parameters: {
                userId: { required: true},
                scope: { required: true }
            }
        }, parameters)
        const scope = new Scope(input.scope)

        try {
            let accessToken = await this.cache.getAccessToken(input.userId, scope)
            if (accessToken && !accessToken.isExpired()) {
                return accessToken
            }
            let refreshToken = await this.cache.getRefreshToken(input.userId)
            if (refreshToken) {
                const tokenResponse = await this.refreshTokens({refreshToken: refreshToken.refreshToken, scope: scope})
                if (tokenResponse && tokenResponse.refreshToken) {
                    this.cache.saveRefreshToken(tokenResponse)
                }
                if (tokenResponse && tokenResponse.accessToken) {
                    accessToken = await this.cache.saveAccessToken(tokenResponse)
                    return accessToken
                }
            }
        } catch (error) {
            console.error('Error in silent request: ', error)
            //return error
        }

        // Not possible silently acquire token - user interaction is needed
        // Resolve Promise with null - token is not found for given scope
        return null
    }

    /**
   * Return user information using an access token
   *
   * @param {Object} parameters user info parameters
   * @param {String} parameters.token user's access token
   * @param {String} parameters.path - MS Graph API Path
   * @returns {Promise}
   * @see https://developer.microsoft.com/en-us/graph/docs/concepts/overview
   * @see https://developer.microsoft.com/en-us/graph/docs/api-reference/v1.0/api/user_get
   *
   * @memberof Auth
   */
    msGraphRequest(parameters = {}) {
        const baseUrl = 'https://graph.microsoft.com/v1.0/'
        const payload = validate({
            parameters: {
                path: { required: true },
                token: { required: true }
            }
        }, parameters)
        const client = new Client({baseUrl, token: payload.token})
        // remove leading and trailing slashes
        const clearedPath = payload.path.replace(/^\//,'').replace(/\/$/,'')
        return client
            .get(clearedPath) // get info for currently authorized user
            .then(responseHandler)
    }

    /**
     * Clear persystent cache - AsyncStorage - for given client ID and user ID or ALL users
     *
     * @param {String} userId ID of user whose tokens will be cleared/deleted
     *      if ommited - tokens for ALL users and current client will be cleared
     *
     * @memberof Auth
     */
    async clearPersistenCache(userId = null) {
        const tokenKeys = await this.cache.getAllUserTokenKeys(userId)
        tokenKeys.forEach((uTokenKey) => {
            this.cache.removeToken(uTokenKey)
        })
    }

}
