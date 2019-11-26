const BASIC_SCOPE = 'offline_access openid profile'
/**
 * Azure AD Auth scope representation class
 *
 * 1. Remove MS Graph URLs from scope, as it is default for any scope
 * 2. Remove eventual commas and double spaces
 * 3. Sort
 * 4. BASIC SCOPE is always a part of auth requests
 *
 * @namespace TokenCache.Scope
 *
 * @param {string | Array<String> | ''} scope - without parameters represents
 * BASIC_SCOPE = 'offline_access openid profile'
 *
 * @memberof TokenCache
 * @class Scope
 */

export default class Scope {
    constructor(scope = '') {
        if(scope instanceof Scope) {
            this.scopeStr = scope.scopeStr
        } else if (typeof scope === 'string') {
            this.scopeStr = this._refine(scope)
        } else if (scope.constructor === Array) {
            this.scopeStr = this._refine(scope.join(' '))
        } else {
            throw new Error('Ivalid constructor parameter in Scope()')
        }

        if (this.scopeStr.length == 0) {
            this.basicScope = true
            this.scope = []
        } else {
            this.scope = this.scopeStr.split(' ')
        }

    }

    toString() {
        if (this.basicScope) {
            return BASIC_SCOPE
        }
        return BASIC_SCOPE + ' ' + this.scopeStr
    }

    _refine(scope) {
        // remove standard scopes, that are added to every request
        let newScope = scope.replace(/openid|profile|offline_access/g, '').toLowerCase()
        // remove MS Graph URL
        newScope = newScope.replace(new RegExp('https://graph.microsoft.com/', 'g'), '')
            // remove double spaces and commas
            .replace(/,+/g, '').replace(/\s+/g, ' ').trim()
        // Sort
        return newScope.split(' ').sort().join(' ')
    }
    
    /**
     * Check if newScope is a subset of baseScope
     *
     * @param {Array} newScope
     * @param {Array} otherScope
     *
     * @returns {boolean}
     */
    isSubsetOf(otherScope) {
        if (!(otherScope instanceof Scope)) {
            throw new Error('Parameter is not a Scope() instance')
        }
        if (otherScope.basicScope || this.basicScope) {
            // The condition order here is important!
            // With the second condition we should only return true if the first one is false
            return true
        }
        let difference = this.scope.filter(x => !otherScope.scope.includes(x))
        return difference.length == 0
    }
    
    /**
     * Copmare if the current instance scope intersects witt one from parameter
     * Only NON basic scopes are compared
     *
     * @param {Scope} otherScope
     */
    isIntersects(otherScope) {
        if (!(otherScope instanceof Scope)) {
            throw new Error('Parameter is not a Scope() instance')
        }

        for (const element of this.scope) {
            if (otherScope.scope.includes(element)) {
                return true
            }
        }
        
        return false
    }

    equals(other) {
        if (!(other instanceof Scope)) {
            throw new Error('Parameter is not a Scope() instance')
        }
        return this.toString() === other.toString()
    }

    static basicScope() {
        return new Scope()
    }
}