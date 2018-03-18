import  { AsyncStorage } from 'react-native'
import { validate } from '../utils/validate'
import AccessTokenItem from './accessTokenItem'
import RefreshTokenItem from './refreshTokenItem'
import BaseTokenItem from './baseTokenItem'

let _instance = null

/**
 * Token persistent cache
 * 
 * @namespace TokenCache
 * 
 * @param {Object} input - init parameters
 * @param {String} input.clientId
 * @param {Boolean} input.persistent - if true - the RN `AsyncStorage` is used for persistent caching,
 *         otherwise only the class instance. (default: true)
 * 
 * @class TokenCache
 * @memberof TokenCache
 */
export default class TokenCache {
    constructor(input = {}) {
        if (!_instance) {
            _instance = this
        }

        const params = validate({
            parameters: {
                clientId: { required: true },
                persistent: { required: false },
            }
        }, input)

        this.cache = {}
        this.clientId = params.clientId
        this.persistent = params.persistent || true // by default enabled

        return _instance
    }

    async saveAccessToken(tokenResponse) {
        let accessToken = new AccessTokenItem(tokenResponse, this.clientId)
        const key = accessToken.tokenKey()
        // remove scope intersection  
        const userTokens = await this.getUserAccessTokenKeys(accessToken.userId)
        userTokens.forEach((uTokenKey) => {
            const scopeFormKey = BaseTokenItem.scopeFromKey(uTokenKey)
            if (scopeFormKey && !accessToken.scope.equals(scopeFormKey) &&
                    accessToken.scope.isIntersects(scopeFormKey)) {
                this.removeToken(uTokenKey)
            }
        })
        this.cache[key] = accessToken.toString()
        if (this.persistent) {
            AsyncStorage.setItem(key, accessToken.toString())
            //.catch(err => { return err /* log error?*/ })
        }
        return accessToken
    }

    saveRefreshToken(tokenResponse) {
        let refreshToken = new RefreshTokenItem(tokenResponse, this.clientId)
        const key = refreshToken.tokenKey()
        this.cache[key] = refreshToken.toString()
        if (this.persistent) {
            AsyncStorage.setItem(key, refreshToken.toString())
            //.catch(err => { return err /* log error?*/ })
        }
        return refreshToken
    }

    removeToken(tokenKey) {
        delete this.cache[tokenKey]
        if (this.persistent) {
            AsyncStorage.removeItem(tokenKey)
            //.catch(err => { return err /* log error?*/ })
        }
    }

    async getAccessToken(userId, scope) {
        const key = BaseTokenItem.createAccessTokenKey(this.clientId, userId, scope)
        if (this.cache[key]) {
            return this.cache[key]
        }
        const accessTokenKeyPrefix = BaseTokenItem.createTokenKeyPrefix(this.clientId, userId)
        for (const key of Object.getOwnPropertyNames(this.cache)) {
            const scopeFormKey = BaseTokenItem.scopeFromKey(key)
            if (scopeFormKey && key.startsWith(accessTokenKeyPrefix) && scope.isSubsetOf(scopeFormKey)) {
                return AccessTokenItem.fromJson(this.cache[key])
            }
        }
    
        if (this.persistent) {
            let keys = await AsyncStorage.getAllKeys()
            for (const key of keys) {
                const scopeFormKey = BaseTokenItem.scopeFromKey(key)
                if (scopeFormKey && key.startsWith(accessTokenKeyPrefix) && scope.isSubsetOf(scopeFormKey)) {
                    const token = await AsyncStorage.getItem(key)
                    this.cache[key] = token
                    return AccessTokenItem.fromJson(token)
                }
            }            
        }
        return null
    }

    async getRefreshToken(userId) {
        const key = BaseTokenItem.createRefreshTokenKey(this.clientId, userId)
        if (this.cache[key]) {
            return RefreshTokenItem.fromJson(this.cache[key])
        }
        if (this.persistent) {
            const token = await AsyncStorage.getItem(key)
            return RefreshTokenItem.fromJson(token)
        }
        return null
    }

    async getUserAccessTokenKeys(userId){
        const accessTokenKeyPrefix = BaseTokenItem.createTokenKeyPrefix(this.clientId, userId)
        console.info('getting tokens')
        let accessTokenKeys = []
        if (this.persistent) {
            let keys = await AsyncStorage.getAllKeys()
            for (const key of keys) {
                if (key.startsWith(accessTokenKeyPrefix)) accessTokenKeys.push(key)
            }
        } else {
            for (const key of Object.getOwnPropertyNames(this.cache)) {
                if (key.startsWith(accessTokenKeyPrefix)) accessTokenKeys.push(key)
            }
        }

        return accessTokenKeys
    }
}