import Auth from './auth'
import WebAuth from './webauth'
import { validate } from './utils/validate'

/**
   * AzureAuth for React Native client
   *
   * @param {Object} options your AzureAuth client information
   * @param {String} options.clientId your AzureAuth client identifier. __ALL other params are optional!__
   * @param {boolean} options.persistentCache do you want to store token cache between the app starts. Defaults to true.
   * @param {String} options.authorityUrl optional Azure authority if you want to replace default v2 endpoint
   *    (`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/`)
   * @param {String} options.tenant - uses given tenant in the default authority URL. Default is `common`
   * @param {String} options.redirectUri - uses given redirect URI instead of default one:
   *    iOS: {YOUR_BUNDLE_IDENTIFIER}://${YOUR_BUNDLE_IDENTIFIER}/ios/callback
   *    Android: {YOUR_APP_PACKAGE_NAME}://{YOUR_APP_PACKAGE_NAME}/android/callback
   *
   * @class AzureAuth
   */
export default class AzureAuth {
    constructor(options = {}) {
        validate({
            parameters: {
                clientId: { required: true },
            },
            validate: false // not declared params are allowed
        }, options)
        
        const { tenant = 'common', authorityUrl, clientId, redirectUri, persistentCache, ...extras } = options
        
        this.auth = new Auth({authorityUrl: (authorityUrl ? authorityUrl : `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/`),
            clientId,
            redirectUri,
            persistentCache,
            ...extras})
            
        this.webAuth = new WebAuth(this.auth)
        this.options = options
    }
}
