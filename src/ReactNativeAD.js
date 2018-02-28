// @flow
import  { AsyncStorage } from 'react-native'
import CONST from './const.js'
import Timer from 'react-timer-mixin'
import log from './logger'

const defaultTokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'

import { ADConfig, ADCredentials, GrantTokenResp, ReactNativeADCredential } from './types'

/**
 * Global static hash map which stores contexts of different ReactNativeAD context,
 * which hash key is  {ReactNativeAD.config#client_id}
 * @type {map<string, ReactNativeAD>}
 */
let _contexts = {}

export default class ReactNativeAD {

    config: ADConfig;
    tokenCache: ADCredentials;

    constructor(config: ADConfig) {
        if (config === null || config === void 0)
            throw new Error('ADConfig object is not defined or null.')
        if (typeof config.client_id !== 'string')
            throw new Error('client_id is not provided.')
        if (typeof config.scope !== 'string')
            throw new Error('scope is not provided.')
        if (config.tenant != null)
            config.token_uri = defaultTokenUrl.replace('common', config.tenant)
        this.config = config
        this.tokenCache = {}
        _contexts[config.client_id] = this
    }

    static getContext(client_id: string): ReactNativeAD {
        return _contexts[client_id]
    }

    static removeContext(client_id: string) {
        delete _contexts[client_id]
    }


    getConfig(): ADConfig {
        log.verbose('getConfig', this.config)
        return this.config
    }

    getCredentials(): ?ADCredentials {
        log.verbose('getCredentials', this.tokenCache)
        return this.tokenCache
    }

    /**
     * Save token data.
     * 
     * @param  {ADCredentials} credentials  Credentials key-value pair,
     *         this object uses resourece as its key and `ReactNativeADCredential`
     *         as its value.
     * @return {Promise} .
     */
    saveCredentials(credentials: ADCredentials): Promise {
        return new Promise((resolve: Function, reject: Function) => {

            let pairs = []
            log.verbose('saveCredentials', credentials)
            for (let resource in credentials) {

                if (resource && credentials[resource]) {
                    pairs.push([`${this.config.client_id}.${resource}`, JSON.stringify(credentials[resource])])
                }
                else
                    log.warn(`counld not save credential for ${resource}=${credentials[resource]} for its key/value is null/undefeind.`)
            }

            Object.assign(this.tokenCache, credentials)

            AsyncStorage.multiSet(pairs, (err: Error) => {
                log.verbose('saveCredentials', 'done', this.tokenCache)
                if (err)
                    reject(err)
                else
                    resolve()
            })
            log.info(this.tokenCache)
        })
    }

    /**
     * Assure that access_token for scope is valid, when access token
     * is expired, this method refresh access token automatically and returns
     * renewed access token in promise.
     * 
     * @param  {string} scope.
     * @return {Promise<string>} A promise with access_token string.
     */
    assureToken(scope: string): Promise<string> {
        let refinedScope = _refineScope(scope)

        let context = this
        return this._getCachedTokenData(refinedScope)
            .then((tokenData: ?ReactNativeADCredential): string => {
                if (!tokenData) {
                    Promise.reject(new Error('Can not get token for not existing consented scope'))
                } else {
                    // Credaentials found, check if token expired.
                    let expires_on = tokenData.expires_on * 1000
                    // Token not expired, resolve token
                    if (Date.now() - expires_on <= -60000)
                        return Promise.resolve(tokenData.access_token)
                    // Token expired, call refresh token
                    else {
                        log.debug('cached token expired, refresh token.')
                        return context._refreshToken(refinedScope, tokenData.refresh_token)
                    }
                }
            })
    }

    /**
     * Refresh token of the scope
     * 
     * @param  {string} scope. - refined scope
     * @return {Promise<string>} When success, promise resolves new `access_token`
     */
    _refreshToken(scope: string, refreshToken: string): Promise<string> {
        return new Promise((resolve: Function, reject: Function) => {
            let config = {
                refresh_token: refreshToken,
                client_id: this.config.client_id,
                redirect_uri: this.config.redirect_uri,
                scope: scope
            }

            let grantType = CONST.GRANT_TYPE.REFRESH_TOKEN
            log.debug('refresh token with config=', config, `grant_type=${grantType}`)
            this.grantAccessToken(grantType, config)
                .then((resp: GrantTokenResp) => {
                    resolve(resp.response.access_token)
                })
                .catch((err: Error) => {
                    log.warn(err)
                    reject(err)
                })
        })
    }

    /**
     * Check if token data for scope exist or not.
     * 
     * @param  {string} scope.
     * @return {Promise<ReactNativeADCredential | null>} When credential does not exist, resolve
     *                           `null`, otherwise resolve `ReactNativeADCredential`
     */
    _getCachedTokenData(resourceId: string): Promise<?ReactNativeADCredential> {
        let context = this
        return new Promise((resolve: Function, reject: Function) => {
            let resourceKey = _getTokenCacheKey(context.config, resourceId)
            let cachedCred = context.tokenCache[resourceId]
            log.verbose(`_getCachedTokenData:'${resourceId} cached at ${resourceKey}=${cachedCred}`)
            // When in memory context not found, check AsyncStorage.
            if (!cachedCred || cachedCred === void 0) {
                try {
                    AsyncStorage.getItem(resourceKey)
                        .then((credStr: string) => {
                            log.debug(`_getCachedTokenData from AsyncStorage data=${credStr}`)
                            // Do not have any access record about this resource, need manual login
                            let result: ?ReactNativeADCredential = null
                            if (credStr) {
                                result = JSON.parse(credStr)
                            }
                            resolve(result)
                        })
                } catch (err) {
                    log.debug('async storage err', err)
                    reject(err)
                }
            }
            else {
                resolve(cachedCred)
            }
        })
    }

    /**
     * Get access_token by `given grant_type` and params, when this process
     * success, it stores credentials in format of `ReactNativeADCredential`,
     * in both ReactNativeAD.tokenCache and AsyncStorage.
     * 
     * @param  {string {enum: authorization_code, refresh_token, password}} grantType
     * Responsed from ReactNativeAD#handleADToken.
     * @param  {object} params Urlencoded form data in hashmap format
     * @return {Promise<GrantTokenResp>}  .
     */
    grantAccessToken(grantType: string, params: ADConfig): Promise<GrantTokenResp> {
        return new Promise((resolve: Function, reject: Function) => {
            try {
                log.debug(`${grantType} access token for scope ${params.scope}`)
                var tm = Timer.setTimeout(() => {
                    reject('time out')
                }, CONST.AZURE_REQUEST_TIMEOUT)

                let body = `grant_type=${grantType}${_serialize(params)}`
                fetch(this.config.token_uri ? this.config.token_uri : defaultTokenUrl, {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body
                })
                    .then((response: Object): Promise<GrantTokenResp> => {
                        Timer.clearTimeout(tm)
                        let responseText = response.text()
                        let tokenResponse: GrantTokenResp = {
                            scope: _refineScope(params.scope),
                            response: JSON.parse(responseText)
                        }
                        // save to memory context
                        this.tokenCache[tokenResponse.scope] = tokenResponse.response

                        let cacheKey = _getTokenCacheKey(this.config, params.scope)
                        if (tokenResponse.response.access_token) {
                            // save to persistent context
                            log.debug(`save credential ${cacheKey} `, tokenResponse.response)
                            AsyncStorage.setItem(cacheKey, JSON.stringify(tokenResponse.response))

                            resolve(tokenResponse)
                        } else {
                            log.debug(`failed to grant token for "${cacheKey}"`, tokenResponse.response)
                            reject(tokenResponse)
                        }
                    })
                    .catch(reject)

            } catch (err) {
                reject(err)
            }
        })
    }
}

/**
 * Helper function to combine cache resource hash key.
 * @param  {ADConfig} config   Configuration of ReactNativeAD Object.
 * @param  {string} scope The resource id.
 * @return {string} Result of hash key.
 */
function _getTokenCacheKey(config: ADConfig, scope: string): string {
    return `${config.client_id}.${_refineScope(scope)}`
}

/**
 * Remove MS Graph URLs from scope, as it is default for any scope
 * 
 * @param {string} scope 
 */
function _refineScope(scope: string): string {
    return scope.replace('https://graph.microsoft.com/', '')
}

/**
 * Helper function to serialize object into urlencoded form data string, properties
 * which value is either `null` or `undefined` will be ignored.
 * @param  {Object} params Object which contains props.
 * @return {string} Result form data string.
 */
function _serialize(params: Object): string {
    let paramStr = ''
    for (let prop in params) {
        if (params[prop] !== null && params[prop] !== void 0 && prop !== 'grant_type')
            paramStr += `&${prop}=${encodeURIComponent(params[prop])}`
    }
    return paramStr
}
