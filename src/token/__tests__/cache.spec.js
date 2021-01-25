jest.mock('react-native')
jest.mock('@react-native-async-storage/async-storage')
import TokenCache from '../cache'

const clientId = '123'
const userId = 'userId'

describe('token Cache', () => {
    const cacheInstance = new TokenCache({clientId: clientId, persistent: true})

    it('should be singletone', () => {
        expect((new TokenCache({clientId: '123222'})).clientId).toBe(clientId)
    })

    it('should throw error without client id', () => {
        expect(() => { new TokenCache({wrong: '123222'})} ).toThrow(/Missing/)
    })

    it('should return refresh token', () => {
        expect(cacheInstance.getRefreshToken(userId)).resolves.toMatchSnapshot()
    })

})