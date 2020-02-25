import { extractIdToken } from './token'
import { Base64 } from 'js-base64'
import Scope from './scope'

const TOKEN_CACHE_KEY_DELIMITER = '$'

function normalizeId(id) {
    if (!id) {
        throw new Error('Id is null or undefined: ', id)
    }
    if (typeof id === 'string' || id instanceof String) {
        return id.toLocaleLowerCase()
    }
    if (typeof id === 'number') {
        return id.toString()
    }
    throw new Error('Invalid id: ', id)
}

/**
 * Class represent basic token cache item
 *
 * Note: userId is handled in case insencitive way for token cache keys
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

        this.userId = decodedIdToken.preferred_username || decodedIdToken.unique_name || decodedIdToken.sub

        this.userName = decodedIdToken.name
        if (!this.userName && decodedIdToken.given_name && decodedIdToken.family_name) {
            this.userName = decodedIdToken.given_name + ' ' + decodedIdToken.family_name
        } else if (!this.userName) {
            this.userName = this.userId
        }

        if (decodedIdToken.tid) {
            this.tenantId = decodedIdToken.tid
        } else if (decodedIdToken.iss) {
            const iss = decodedIdToken.iss
            const b2cSuffixIndex = iss.indexOf('.b2clogin.com')
            // parse then tenant ID out of the issuer claim
            this.tenantId = iss.substring('https://'.length, b2cSuffixIndex > 0 ? b2cSuffixIndex : iss.length)
        }
        this.idTokenExpireOn = parseInt(decodedIdToken.exp)*1000
    }

    static createRefreshTokenKey(clientId, userId) {
        return Base64.encodeURI(clientId) +
            TOKEN_CACHE_KEY_DELIMITER +
            Base64.encodeURI(normalizeId(userId))
    }

    static createAccessTokenKey(clientId, userId, scope) {
        return Base64.encodeURI(clientId) +
            TOKEN_CACHE_KEY_DELIMITER +
            Base64.encodeURI(normalizeId(userId)) +
            TOKEN_CACHE_KEY_DELIMITER +
            Base64.encodeURI(scope.toString())
    }

    static createTokenKeyPrefix(clientId, userId) {
        let prefix = Base64.encodeURI(clientId) + TOKEN_CACHE_KEY_DELIMITER
        if (userId) {
            prefix = prefix + Base64.encodeURI(normalizeId(userId))
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

    static rawObjectFromJson(objStr) {
        if (typeof objStr !== 'string' && !(objStr instanceof String) || objStr.length < 5) {
            return null
        }
        try {
            return JSON.parse(objStr)
        } catch (e) {
            console.warn('Incorect JSON token string: ', objStr)
            return null
        }
    }
}