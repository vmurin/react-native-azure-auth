import Client from '../networking'
import { validate } from '../utils/validate'
import { toCamelCase } from '../utils/camel'
import AuthError from './authError'

function responseHandler (response, exceptions = {}) {
    if (response.ok && response.json) {
        return toCamelCase(response.json, exceptions)
    }
    throw new AuthError(response)
}

/**
 * Azure AD V2 Auth API
 *
 * @export Auth
 * @see https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-protocols
 * @class Auth
 */
export default class Auth {
    constructor(options = {}) {
        this.client = new Client(options)
        const { clientId } = options
        if (!clientId) {
            throw new Error('Missing clientId in parameters')
        }
        this.authorityUrl = this.client.baseUrl
        this.clientId = clientId
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
   * @returns {String} authorize url with specified parameters to redirect to for AuthZ/AuthN.
   * 
   * @see https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-protocols-oauth-code
   *
   * @memberof Auth
   */
    loginUrl(parameters = {}) {
        const query = validate({
            parameters: {
                redirectUri: { required: true, toName: 'redirect_uri' },
                responseType: { required: true, toName: 'response_type' },
                scope: { required: true },
                state: { required: true },
                prompt: {} 
            },
            validate: false // not declared params are allowed: 
        }, parameters)
        return this.client.url('authorize', {...query, client_id: this.clientId})
    }

    /**
   * Builds the full logout endpoint url in the Authorization Server (AS) with given parameters.
   *
   * @param {Object} parameters parameters to send to `/v2/logout`
   * @param {Boolean} [parameters.federated] if the logout should include removing session for federated IdP.
   * @param {String} [parameters.clientId] client identifier of the one requesting the logout
   * @param {String} [parameters.returnTo] url where the user is redirected to after logout. It must be declared in you Auth0 Dashboard
   * @returns {String} logout url with specified parameters
   * @see https://auth0.com/docs/api/authentication#logout
   *
   * @memberof Auth
   */
    logoutUrl(parameters = {}) {
        const query = validate({
            parameters: {
                federated: { required: false },
                clientId: { required: false, toName: 'client_id' },
                returnTo: { required: false }
            }
        }, parameters)
        // https://login.microsoftonline.com/${this.props.context.getConfig().client_id}/oauth2/v2.0/logout
        return this.client.url('/v2/logout', {...query})
    }

    /**
   * Exchanges a code obtained via `/authorize` for the access tokens
   *
   * @param {Object} parameters parameters used to obtain tokens from a code
   * @param {String} parameters.code code returned by `/authorize`.
   * @param {String} parameters.redirectUri original redirectUri used when calling `/authorize`.
   * @param {String} parameters.scope A space-separated list of scopes. 
   *    The scopes requested in this leg must be equivalent to or a subset of the scopes requested in the first leg
   * @returns {Promise}
   * @see https://auth0.com/docs/api-auth/grant/authorization-code-pkce
   *
   * @memberof Auth
   */
    exchange(input = {}) {
        const payload = validate({
            parameters: {
                code: { required: true },
                redirectUri: { required: true, toName: 'redirect_uri' },
                scope: { required: true }
            }
        }, input)

        return this.client
            .post('token', 
                {...payload, 
                    client_id: this.clientId, 
                    grant_type: 'authorization_code'})
            .then(responseHandler)
    }


    /**
   * Obtain new tokens using the Refresh Token obtained during Auth (requesting `offline_access` scope)
   *
   * @param {Object} parameters refresh token parameters
   * @param {String} parameters.refreshToken user's issued refresh token
   * @param {String} parameters.scope scopes requested for the issued tokens.
   * @param {String} parameters.redirectUri the same redirect_uri value that was used to acquire the authorization_code.
   * @returns {Promise}
   * @see https://auth0.com/docs/tokens/refresh-token/current#use-a-refresh-token
   *
   * @memberof Auth
   */
    refreshToken(parameters = {}) {
        const payload = validate({
            parameters: {
                refreshToken: { required: true, toName: 'refresh_token' },
                scope: { required: true },
                redirectUri: { required: true, toName: 'redirect_uri' },
            }
        }, parameters)
        return this.client
            .post('token', {
                ...payload,
                client_id: this.clientId,
                grant_type: 'refresh_token'
            })
            .then(responseHandler)
    }


    /**
   * Return user information using an access token
   *
   * @param {Object} parameters user info parameters
   * @param {String} parameters.token user's access token
   * @returns {Promise}
   * @see https://developer.microsoft.com/en-us/graph/docs/api-reference/v1.0/api/user_get
   * @memberof Auth
   */
    msGraphUserInfo(parameters = {}) {
        const baseUrl = 'https://graph.microsoft.com/v1.0/'
        const payload = validate({
            parameters: {
                token: { required: true },
            }
        }, parameters)
        const client = new Client({baseUrl, token: payload.token})
        return client
            .get('me') // get info for currently authorized user
            .then(responseHandler)
    }

}