import Scope from '../token/scope'
import BaseTokenItem from '../token/baseTokenItem'

const clientId = '123'
const userId = 'userId'
const scope = new Scope().toString()

export default class AsyncStorage {
    getAllKeys(){
        return [BaseTokenItem.createAccessTokenKey(clientId, userId, scope)]
    }

    // eslint-disable-next-line no-unused-vars
    getItem(key){
        return JSON.stringify({})
    }
}