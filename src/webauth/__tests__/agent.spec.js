jest.mock('react-native')
import Agent from '../agent'
import { NativeModules, Linking } from 'react-native'
const AzureAuth = NativeModules.AzureAuth

describe('Agent', () => {
    const agent = new Agent()

    describe('show', () => {

        beforeEach(() => {
            NativeModules.AzureAuth = AzureAuth
            AzureAuth.reset()
        })

        it('should fail if native module is not linked', async () => {
            NativeModules.AzureAuth = undefined
            expect.assertions(1)
            await expect(agent.openWeb('https://developer.microsoft.com/en-us/')).rejects.toMatchSnapshot()
        })

        describe('complete web flow', () => {
            beforeEach(() => {
                AzureAuth.onUrl = () => {
                    Linking.emitter.emit('url', {url: 'https://developer.microsoft.com/en-us/'})
                }
            })

            it('should resolve promise with url result', async () => {
                expect.assertions(1)
                await expect(agent.openWeb('https://developer.microsoft.com/en-us/')).resolves.toMatchSnapshot()
            })

            it('should show initial url', async () => {
                expect.assertions(1)
                const url = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
                await agent.openWeb(url)
                expect(AzureAuth.url).toEqual(url)
            })
        })

        describe('listeners', () => {

            it('should register url listeners', () => {
                AzureAuth.onUrl = () => {}
                const url = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
                agent.openWeb(url)
                expect(Linking.emitter.listenerCount('url')).toEqual(1)
            })

            it('should remove url listeners when done', async () => {
                AzureAuth.onUrl = () => {
                    Linking.emitter.emit('url', {url: 'https://developer.microsoft.com/en-us/'})
                }
                expect.assertions(1)
                const url = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
                await agent.openWeb(url)
                expect(Linking.emitter.listenerCount('url')).toEqual(0)
            })

            it('should remove url listeners when load fails', async () => {
                expect.assertions(1)
                AzureAuth.error = new Error('failed to load')
                const url = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
                await agent.openWeb(url).catch((err) => Promise.resolve(err))
                expect(Linking.emitter.listenerCount('url')).toEqual(0)
            })

            it('should remove url listeners on first load', async () => {
                expect.assertions(1)
                const url = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
                await agent.openWeb(url, false, true)
                expect(Linking.emitter.listenerCount('url')).toEqual(0)
            })

        })

        describe('failed flow', () => {

            it('should reject with error', async () => {
                expect.assertions(1)
                AzureAuth.error = new Error('failed to load')
                await expect(agent.openWeb('https://developer.microsoft.com/en-us/')).rejects.toMatchSnapshot()
            })

        })
    })

    describe('generateRequestParams', () => {

        it('should call native integration', async () => {
            const parameters = {state: 'state'}
            AzureAuth.parameters = parameters
            expect.assertions(1)
            await expect(agent.generateRequestParams()).resolves.toMatchSnapshot()
        })

        it('should fail if native module is not linked', async () => {
            NativeModules.AzureAuth = undefined
            expect.assertions(1)
            await expect(agent.generateRequestParams()).rejects.toMatchSnapshot()
        })

    })
})
