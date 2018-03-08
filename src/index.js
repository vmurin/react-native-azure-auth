import Auth from './auth'
import WebAuth from './webauth'
import { validate } from './utils/validate'

/**
 * AzureAuth for React Native client
 *
 * @export
 * @class AzureAuth
 */
export default class AzureAuth {

    /**
   * Creates an instance of AzureAuth.
   * @param {Object} options your AzureAuth client information
   * @param {String} options.authorityUrl optional Azure authority if you want to replace default
   * @param {String} options.clientId your AzureAuth client identifier
   *
   * @memberof AzureAuth
   */
    constructor(options = {}) {
        validate({
            parameters: {
                clientId: { required: true },
            },
            validate: false // not declared params are allowed
        }, options)
        
        const { tenant = 'common', authorityUrl, clientId, redirectUri, ...extras } = options
        
        this.auth = new Auth({authorityUrl: (authorityUrl ? authorityUrl : `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/`), 
            clientId, 
            redirectUri,
            ...extras})
            
        this.webAuth = new WebAuth(this.auth)
        this.options = options
    }
}
