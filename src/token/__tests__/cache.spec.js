jest.mock('react-native')
jest.mock('@react-native-async-storage/async-storage')
import TokenCache from '../cache'

const clientId = '123'
const userId = 'userId'

describe('token Cache', () => {
    afterEach(() => {
      // clear the instance to allow testing object construction
      TokenCache["_instance"] = null
    })

    it('should be a singleton', () => {
        const cacheInstance = new TokenCache({clientId: clientId, persistent: true})
        expect((new TokenCache({clientId: '123222'})).clientId).toBe(clientId)
    })

    it('should throw error without client id', () => {
        expect(() => { new TokenCache({wrong: '123222'})} ).toThrow(/Missing/)
    })

    it('should return refresh token', () => {
        const cacheInstance = new TokenCache({clientId: clientId, persistent: true})
        expect(cacheInstance.getRefreshToken(userId)).resolves.toMatchSnapshot()
    })

    it("should default to persistent", () => {
        expect(new TokenCache({ clientId: "123222" }).persistent).toBe(true)
        expect(new TokenCache({ clientId: "123222", persistent: null }).persistent).toBe(true)
        expect(new TokenCache({ clientId: "123222", persistent: undefined }).persistent).toBe(true)
    })

    it("should throw when input parameters are incorrect type", () => {                
        expect(() => new TokenCache({ clientId: "123222", persistent: "123" }))
            .toThrow(/Parameters with wrong type/)
    })

    it("should allow persistence to be disabled", () => {        
        expect(new TokenCache({ clientId: "123222", persistent: false }).persistent).toBe(false)
    })
})