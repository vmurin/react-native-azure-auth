import Linking from './linking';
import AzureAuth from './auth0';

const mock = {};

mock.Linking = new Linking();
mock.NativeModules = { AzureAuth: new AzureAuth() };

module.exports = mock;