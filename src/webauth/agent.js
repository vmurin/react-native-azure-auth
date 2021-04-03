import {
    NativeModules,
    Linking,
    Platform
} from 'react-native'

export default class Agent {

    openWeb(url, ephemeralSession = false, closeOnLoad = false) {
        if (!NativeModules.AzureAuth) {
            return Promise.reject(new Error('Missing NativeModule. Please make sure you run `react-native link react-native-azure-auth`'))
        }

        return new Promise((resolve, reject) => {
            const urlHandler = (event) => {
                NativeModules.AzureAuth.hide()
                Linking.removeEventListener('url', urlHandler)
                resolve(event.url)
            }
            const params = Platform.OS === 'ios' ? [ephemeralSession, closeOnLoad] : [closeOnLoad]
            Linking.addEventListener('url', urlHandler)
            NativeModules.AzureAuth.showUrl(url, ...params, (err, redirectURL) => {
                Linking.removeEventListener('url', urlHandler)
                if (err) {
                    reject(err)
                } else if(redirectURL) {
                    resolve(redirectURL)
                } else if (closeOnLoad) {
                    resolve()
                }
            })
        })
    }

    generateRequestParams() {
        if (!NativeModules.AzureAuth) {
            return Promise.reject(new Error('Missing NativeModule. Please make sure you run `react-native link react-native-azure-auth`'))
        }
        /* eslint no-unused-vars:0 */
        return new Promise((resolve, reject) => {
            NativeModules.AzureAuth.oauthParameters((parameters) => {
                resolve(parameters)
            })
        })
    }
}