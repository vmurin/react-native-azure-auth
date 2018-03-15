export default class AzureAuthNative {
    constructor() {
        this.bundleIdentifier = 'my_bundle_ID'
    }
    showUrl(url, closeOnLoad, callback) {
        this.url = url
        this.hidden = false
        if (this.error || closeOnLoad) {
            callback(this.error)
        } else {
            this.onUrl()
        }
    }

    hide() {
        this.hidden = true
    }

    reset() {
        this.url = null
        this.error = null
        this.hidden = true
        this.parameters = null
        this.onUrl = () => { }
    }

    oauthParameters(callback) {
        callback(this.parameters)
    }
}