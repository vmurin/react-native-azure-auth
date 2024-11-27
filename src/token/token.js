import { jwtDecode } from 'jwt-decode'

/**
 * Decode ID token from
 *
 * @param {string} encodedIdToken string
 * @returns {Object | null} - in case of error null is returned
 */

import { decode } from 'base-64'

// overwrite global implementation
global.atob = decode

export function extractIdToken(encodedIdToken) {
    // id token will be decoded to get the username
    const decodedToken = jwtDecode(encodedIdToken)
    if (!decodedToken) {
        return null
    }

    return decodedToken
}

