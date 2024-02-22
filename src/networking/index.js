import url from 'url'

/**
 * Helper function to serialize object into urlencoded form data string, properties
 * which value is either `null` or `undefined` will be ignored.
 * @param  {Object} params Object which contains props.
 * @return {string} Result form data string.
 */
function serializeParams(params) {
    let paramStr = ''
    for (let prop in params) {
        if (params[prop] !== null && params[prop] !== void 0)
            paramStr += `&${prop}=${encodeURIComponent(params[prop])}`
    }
    return paramStr
}

/**
 * Helper to perform HTTP requests
 * Blob (binary) content types are not supported
 *
 * Class variables:
 * - baseUrl | authorityUrl: base URL the request path is added to
 * - token: Auth token if the request needs authorization
 *
 * @export
 * @class Client
 */
export default class Client {
    constructor(options = {}) {
        const {authorityUrl, baseUrl, token} = options

        if (!(baseUrl || authorityUrl)) { throw new Error('Missing Azure authority base URL') }
        const parsed = url.parse(baseUrl || authorityUrl)
        this.baseUrl = parsed.protocol === 'https:' || parsed.protocol === 'http:' ? (baseUrl || authorityUrl) : `https://${(baseUrl || authorityUrl)}`
        if (token) {
            this.bearer = `Bearer ${token}`
        }
    }

    post(path, body) {
        let url = this.url(path)
        return this.request('POST', url, body)
    }

    patch(path, body) {
        return this.request('PATCH', this.url(path), body)
    }

    get(path, query) {
        return this.request('GET', this.url(path, query))
    }

    url(path, query, authorityUrl) {
        const baseAuthorityUrl = authorityUrl ? `https://${authorityUrl}`: this.baseUrl;
        let endpoint = url.resolve(baseAuthorityUrl, path)
        if (query && query.length !== 0) {
            const parsed = url.parse(endpoint)
            parsed.query = query || {}
            endpoint = url.format(parsed)
        }
        return endpoint
    }

    /**
     * Helper function to send HTTP requests
     *
     * @param {String} method
     * @param {String} url
     * @param {Object} [body] - request body
     */
    async request(method, url, body) {
        const options = {
            method: method,
            headers: {
                'Accept': 'application/json, image/*;q=0.1', // image is needed for user phote requests
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
        if (this.bearer) {
            options.headers['Authorization'] = this.bearer
        }
        if (body) {
            // POST
            options.body = serializeParams(body)
            options.headers['Content-Length'] = options.body.length
        }

        let response = await fetch(url, options)
        const payload = { status: response.status, ok: response.ok, headers: response.headers }

        if (response.headers.get('Content-Type') && response.headers.get('Content-Type').startsWith('image')) {
            try {
                const blob = await response.blob()
                return { ...payload, blob }
            } catch (err) {
                return { ...payload, text: response.statusText }
            }
        } else {
            try {
                const json = await response.json()
                return { ...payload, json }
            } catch (error) {
                try {
                    const text = await response.text()
                    return { ...payload, text }
                } catch (err) {
                    return { ...payload, text: response.statusText }
                }
    
            }
        }            

    }
}