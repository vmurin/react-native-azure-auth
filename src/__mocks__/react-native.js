import Linking from './linking'
import AzureAuthNative from './azure-auth'
import AsyncStorage from './async-storage'

const mock = {}

mock.Linking = new Linking()
mock.NativeModules = { AzureAuth: new AzureAuthNative() }
mock.Platform = {OS: 'SomeMobile'}
mock.AsyncStorage = new AsyncStorage()

module.exports = mock