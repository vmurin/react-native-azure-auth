import BaseError from '../utils/baseError'

export default class AuthError extends BaseError {
    constructor(response) {
        const { status, json = {}, text } = response
        const { error, error_description, message } = json
        super(error || 'aad.response.invalid', error_description || message || text || 'unknown error')
        this.json = json
        this.status = status
    }
}
