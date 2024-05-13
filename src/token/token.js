import {jwtDecode} from 'jwt-decode'

/**
 * Decode ID token from
 *
 * @param {string} encodedIdToken string
 * @returns {Object | null} - in case of error null is returned
 */
export function extractIdToken(encodedIdToken) {
    // id token will be decoded to get the username
    const decodedToken = jwtDecode(encodedIdToken)
    if (!decodedToken) {
        return null
    }

    return decodedToken
}

