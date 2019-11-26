import { Base64 } from 'js-base64'
import log from '../utils/logger'

function base64DecodeStringUrlSafe(base64IdToken) {
    return decodeURIComponent(Base64.decode(base64IdToken))
}

function isEmptyString(str) {
    return (typeof str === 'undefined' || !str || 0 === str.length)
}

/**
 * Decode ID token from
 *
 * @param {string} encoded IdToken string
 * @returns {Object | null} - in cas of error null is returned
 */
export function extractIdToken(encodedIdToken) {
    // id token will be decoded to get the username
    const decodedToken = _decodeJwt(encodedIdToken)
    if (!decodedToken) {
        return null
    }
    try {
        const base64IdToken = decodedToken.JWSPayload
        const base64Decoded = base64DecodeStringUrlSafe(base64IdToken)
        if (!base64Decoded) {
            log.info('The returned id_token could not be base64 url safe decoded.')
            return null
        }
        return JSON.parse(base64Decoded)
    } catch (err) {
        log.error('The returned id_token could not be decoded', err)
    }

    return null
}

function _decodeJwt(jwtToken) {
    if (isEmptyString(jwtToken)) {
        return null
    }
    const idTokenPartsRegex = /^([^.\s]*)\.([^.\s]+)\.([^.\s]*)$/
    const matches = idTokenPartsRegex.exec(jwtToken)
    if (!matches || matches.length < 4) {
        log.warn('The returned id_token is not parseable.')
        return null
    }
    const crackedToken = {
        header: matches[1],
        JWSPayload: matches[2],
        JWSSig: matches[3]
    }
    return crackedToken
}