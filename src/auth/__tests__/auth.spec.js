import Auth from '../'
import fetchMock from 'fetch-mock'
jest.mock('react-native')
jest.mock('@react-native-async-storage/async-storage')
import { NativeModules } from 'react-native'
const AzureAuth = NativeModules.AzureAuth
import Scope from '../../token/scope'

describe('auth', () => {

    const authorityUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/'
    const clientId = 'A_CLIENT_ID_OF_YOUR_ACCOUNT'
    const redirectUri = 'https://mysite.com/callback'
    const scope = new Scope() // base scope
    const state = 'a random state for auth'
    const verifier = 'some Azure verifier code'

    const tokens = {
        status: 200,
        body: {
            access_token: 'an access token',
            id_token: 'an id token',
            expires_in: 1234567890,
            state,
            scope: 'openid'
        },
        headers: { 'Content-Type': 'application/json' }
    }
    const imageResponse = {
        status: 200,
        blob: {},
        headers: { 'Content-Type': 'image/png'}
    }
    const oauthError = {
        status: 400,
        body: {
            error: 'invalid_request',
            error_description: 'Invalid grant'
        },
        headers: { 'Content-Type': 'application/json' }
    }
    const unexpectedError = {
        status: 500,
        body: 'Internal Server Error....',
        headers: { 'Content-Type': 'text/plain' }
    }
    const auth  = new Auth({authorityUrl, clientId})

    beforeEach(() => {
        NativeModules.AzureAuth = AzureAuth
        AzureAuth.reset()
        fetchMock.restore()
    })

    describe('constructor', () => {
        it('should build with authority and Client ID', () => {
            const auth = new Auth({authorityUrl, clientId})
            expect(auth.clientId).toEqual(clientId)
        })

        it('should fail without clientId', () => {
            expect(() => new Auth({authorityUrl})).toThrowErrorMatchingSnapshot()
        })

        it('should fail without authority', () => {
            expect(() => new Auth({clientId})).toThrowErrorMatchingSnapshot()
        })
    })


    describe('loginUrl', () => {
        it('should return default authorize url', () => {
            expect(auth.loginUrl({
                responseType: 'code',
                scope: scope.toString(),
                state: 'a_random_state'
            })).toMatchSnapshot()
        })

        it('should return default authorize url with extra parameters', () => {
            expect(auth.loginUrl({
                responseType: 'code',
                scope: scope.toString(),
                state: 'a_random_state',
                connection: 'facebook'
            })).toMatchSnapshot()
        })

        it('should use redirect url from Auth init params', () => {
            const ruri = new RegExp(`.*redirect_uri=${encodeURIComponent(auth.redirectUri)}.*`)
            expect(auth.loginUrl({
                responseType: 'code',
                redirectUri,
                scope: scope.toString(),
                state: 'a_random_state',
                connection: 'facebook'
            })).toMatch(ruri)
        })

    })

    describe('logoutUrl', () => {
        it('should return default logout url', () => {
            expect(auth.logoutUrl({})).toMatchSnapshot()
        })

        it('should return logout url with extra parameters', () => {
            expect(auth.logoutUrl({
                redirectUri:'https://bing.com'
            })).toMatchSnapshot()
        })

        it('should return logout url with skipping unknown parameters', () => {
            expect(auth.logoutUrl({
                redirectUri:'https://bing.com',
                shouldNotBeThere: 'really'
            })).toMatchSnapshot()
        })
    })

    describe('code exchange', () => {
        it('should send correct payload', async () => {
            fetchMock.postOnce('https://login.microsoftonline.com/common/oauth2/v2.0/token', tokens)
            expect.assertions(1)
            await auth.exchange({code: 'a code', code_verifier: verifier, scope: 'openid'})
            expect(fetchMock.lastCall()).toMatchSnapshot()
        })

        it('should return successful response', async () => {
            fetchMock.postOnce('https://login.microsoftonline.com/common/oauth2/v2.0/token', tokens)
            expect.assertions(1)
            const parameters = {code: 'a code', code_verifier: verifier, scope: 'openid'}
            await expect(auth.exchange(parameters)).resolves.toMatchSnapshot()
        })

        it('should handle oauth error', async () => {
            fetchMock.postOnce('https://login.microsoftonline.com/common/oauth2/v2.0/token', oauthError)
            expect.assertions(1)
            const parameters = {code: 'a code', code_verifier: verifier, scope: 'openid'}
            await expect(auth.exchange(parameters)).rejects.toMatchSnapshot()
        })

        it('should handle unexpected error', async () => {
            fetchMock.postOnce('https://login.microsoftonline.com/common/oauth2/v2.0/token', unexpectedError)
            expect.assertions(1)
            const parameters = {code: 'a code', code_verifier: verifier, scope: 'openid'}
            await expect(auth.exchange(parameters)).rejects.toMatchSnapshot()
        })
    })

    describe('refresh token', () => {
        const parameters = {refreshToken: 'a refresh token of a user', scope: 'openid'}
        it('should send correct payload', async () => {
            fetchMock.postOnce('https://login.microsoftonline.com/common/oauth2/v2.0/token', tokens)
            expect.assertions(1)
            await auth.refreshTokens(parameters)
            expect(fetchMock.lastCall()).toMatchSnapshot()
        })

        it('should return successful response', async () => {
            fetchMock.postOnce('https://login.microsoftonline.com/common/oauth2/v2.0/token', tokens)
            expect.assertions(1)
            await expect(auth.refreshTokens(parameters)).resolves.toMatchSnapshot()
        })

        it('should handle oauth error', async () => {
            fetchMock.postOnce('https://login.microsoftonline.com/common/oauth2/v2.0/token', oauthError)
            expect.assertions(1)
            await expect(auth.refreshTokens(parameters)).rejects.toMatchSnapshot()
        })

        it('should handle unexpected error', async () => {
            fetchMock.postOnce('https://login.microsoftonline.com/common/oauth2/v2.0/token', unexpectedError)
            expect.assertions(1)
            await expect(auth.refreshTokens(parameters)).rejects.toMatchSnapshot()
        })
    })

    describe('graph requests', () => {
        it('should return blob', async () => {
            fetchMock.getOnce('https://graph.microsoft.com/v1.0/me/photo/$value', imageResponse)
            expect.assertions(1)
            await expect(auth.msGraphRequest({token: 'fake_token', path: 'me/photo/$value'})).resolves.toMatchSnapshot()
        })
    })

})