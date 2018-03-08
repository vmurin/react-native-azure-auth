import  { AsyncStorage } from 'react-native'

let _instance = null

export default class TokenCache {
    constructor() {
        if (!_instance) {
            _instance = this
        }

        return _instance
    }

    putTokenObj() {}
    getTokenObj() {}
    isTokenValid() {}
    removeTokenObj() {}
    getAllTokenEntries() {}
}