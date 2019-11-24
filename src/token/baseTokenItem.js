import { extractIdToken } from './token'
import { Base64 } from 'js-base64'
import Scope from './scope'

const TOKEN_CACHE_KEY_DELIMITER = '$'

/**
 * Class represent basic token cache item
 * 
 * @namespace TokenCache.BaseTokenItem
 * 
 * @param {Object} tokenResponse 
 * @param {String} clientId 
 * 
 * @class BaseTokenItem
 * @memberof TokenCache
 */

export default class BaseTokenItem {
    constructor(tokenResponse, clientId) {
        this.clientId = clientId
        this.rawIdToken = tokenResponse.idToken
        let decodedIdToken = extractIdToken(tokenResponse.idToken)

        this.userId = decodedIdToken.preferred_username
        this.userName = decodedIdToken.name
        this.tenantId = decodedIdToken.tid
        this.idTokenExpireOn = parseInt(decodedIdToken.exp)*1000
    }

    static createRefreshTokenKey(clientId, userId) {
      const lowerCaseUserId = userId ? userId.toLowerCase() : userId
        return Base64.encodeURI(clientId) +
            TOKEN_CACHE_KEY_DELIMITER +
            Base64.encodeURI(lowerCaseUserId)
    }

    static createAccessTokenKey(clientId, userId, scope) {
      const lowerCaseUserId = userId ? userId.toLowerCase() : userId
        return Base64.encodeURI(clientId) +
            TOKEN_CACHE_KEY_DELIMITER +
            Base64.encodeURI(lowerCaseUserId) +
            TOKEN_CACHE_KEY_DELIMITER +
            Base64.encodeURI(scope.toString())
    }

    static createTokenKeyPrefix(clientId, userId) {
        let prefix = Base64.encodeURI(clientId) + TOKEN_CACHE_KEY_DELIMITER
        if (userId) {
            const lowerCaseUserId = userId ? userId.toLowerCase() : userId
            prefix = prefix + Base64.encodeURI(lowerCaseUserId)
        }

        return prefix
    }

    static scopeFromKey(key) {
        const keyParts = key.split(TOKEN_CACHE_KEY_DELIMITER)
        if (keyParts[2]) {
            const scopeStr = Base64.decode(keyParts[2])
            return new Scope(scopeStr)
        }
        return null
    }

    toString() {
        return JSON.stringify(this)
    }
}