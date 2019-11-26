import BaseTokenItem from './baseTokenItem'

/**
 * Class represent refresh token cache item
 *
 * @namespace TokenCache.RefreshTokenItem
 *
 * @param {Object} tokenResponse
 * @param {String} clientId
 *
 * @class RefreshTokenItem
 * @extends BaseTokenItem
 * @memberof TokenCache
 */
export default class RefreshTokenItem extends BaseTokenItem{
    constructor(tokenResponse, clientId) {
        if (!tokenResponse.refreshToken) {
            throw new Error('Invalid token response. Can not create refresh token.')
        }
        
        super(tokenResponse, clientId)
        this.refreshToken = tokenResponse.refreshToken
    }

    tokenKey() {
        return BaseTokenItem.createRefreshTokenKey(this.clientId, this.userId)
    }

    static fromJson(objStr) {
        const rawObject = BaseTokenItem.rawObjectFromJson(objStr)
        if (!rawObject || !rawObject['refreshToken']) {
            return null
        }
        const obj = Object.create(RefreshTokenItem.prototype)
        return Object.assign(obj, rawObject)
    }
    
}