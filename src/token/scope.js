/**
 * 1. Remove MS Graph URLs from scope, as it is default for any scope
 * 2. Remove eventual commas and double spaces
 * 
 * @param {string} scope 
 * 
 * @returns {string}
 */
export function refineScope(scope) {
    // remove standard scopes, that are added to every request
    let newScope = scope.replace(/openid|profile|offline_access/g, '')
    // remove MS Graph URL
    newScope = newScope.replace(new RegExp('https://graph.microsoft.com/', 'g'), '')
        // remove double spaces and commas
        .replace(/,+/g, '').replace(/\s+/g, ' ')

    return newScope
}

/**
 * Check if newScope is a subset of baseScope
 * 
 * @param {Array} newScope 
 * @param {Array} baseScope 
 * 
 * @returns {boolean}
 */
export function isSubsetOf(newScope, baseScope) {
    let difference = newScope.filter(x => !baseScope.includes(x))
    return difference.length == 0
}


export function getStandardScopes() {
    return ['openid', 'profile', 'offline_access']
}