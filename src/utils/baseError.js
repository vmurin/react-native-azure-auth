/**
 * Base error class needs `babel-plugin-transform-builtin-extend` for correct function
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
 * @param {String} name - error name
 * @param {String} message
 *
 * @class BaseError
 *
 */

export default class BaseError extends Error {
    constructor (name, message) {
        super()
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor)
        }
        this.name = name
        this.message = message
    }
}
