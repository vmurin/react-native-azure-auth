import Scope from '../scope'

const msScope = ['https://graph.microsoft.com/mail.read', 'https://graph.microsoft.com/user.read', 'https://graph.microsoft.com/calendars.readwrite']
const fullScope = ['openid', 'profile', 'offline_access', 'mail.read', 'user.read', 'calendars.readwrite']
const rawScopeStr = 'openid, profile,   offline_access, https://graph.microsoft.com/mail.read , https://graph.microsoft.com/user.read,     https://graph.microsoft.com/calendars.readwrite'
const cleanScope = new Scope('mail.read user.read calendars.readwrite')

describe('Scope class', () => {
    it('should throw Error on incorrect init', () => {
        expect(() => new Scope({scope: 'openid'})).toThrow()
    })

    it('should create basic scope on empty or basic params', () => {
        expect((new Scope()).toString()).toMatch('offline_access openid profile')
        expect((new Scope('')).toString()).toMatch('offline_access openid profile')
        expect((new Scope('openid')).toString()).toMatch('offline_access openid profile')
        expect((new Scope('openid profile')).toString()).toMatch('offline_access openid profile')
    })
    
    it('should be instantiable from other Scope obj', () => {
        expect((new Scope(cleanScope)).equals(cleanScope)).toBe(true)
    })

    it('should not contain standard scopes', () => {
        const testScope = new Scope(fullScope)
        expect(testScope.scope).not.toContain('openid')
        expect(testScope.scope).not.toContain('profile')
        expect(testScope.scope).not.toContain('offline_access')
    })

    it('should clean up MS Graph url', () => {
        const testScope = new Scope(msScope)
        expect(testScope).toMatchObject(cleanScope)
    })

    it('should clean all commas and spaces', () => {
        const rawScope = new Scope(rawScopeStr)
        expect(rawScope).toMatchObject(cleanScope)
    })
    const fullScopeRefined = new Scope(fullScope)

    it('should throw Error on incorrect subset compare', () => {
        function wrongCompare() {
            cleanScope.isSubsetOf(['mail.read'])
        }
        expect(wrongCompare).toThrow()
    })

    it('single scope element should be subset of full scope', () => {
        const inputScope = new Scope('user.read')
        expect(inputScope.isSubsetOf(fullScopeRefined)).toBe(true)
    })

    it('should intersect with single scope', () => {
        const inputScope = new Scope('user.read')
        expect(inputScope.isIntersects(fullScopeRefined)).toBe(true)
    })

    it('mixed subseted scope should be subset of full scope', () => {
        const inputScope = new Scope('https://graph.microsoft.com/mail.read calendars.readwrite profile')
        expect(inputScope.isSubsetOf(fullScopeRefined)).toBe(true)
    })

    it('compare two scopes', () => {
        const inputScope1 = new Scope('https://graph.microsoft.com/mail.read calendars.readwrite profile')
        const inputScope2 = new Scope('calendars.readwrite profile mail.read')
        expect(inputScope1.equals(inputScope2)).toBe(true)
    })
})

