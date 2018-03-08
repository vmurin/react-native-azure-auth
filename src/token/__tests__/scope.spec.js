import { refineScope, isSubsetOf } from '../scope'

const msScope = ['https://graph.microsoft.com/mail.read', 'https://graph.microsoft.com/user.read', 'https://graph.microsoft.com/calendars.readwrite']
const fullScopeRefined = ['openid', 'profile', 'offline_access', 'mail.read', 'user.read', 'calendars.readwrite']
const rawScopeStr = 'openid, profile,   offline_access, https://graph.microsoft.com/mail.read , https://graph.microsoft.com/user.read,     https://graph.microsoft.com/calendars.readwrite'
const cleanScope = 'mail.read user.read calendars.readwrite'

describe('refineScope', () => {
    it('should not contain standard scopes', () => {
        const inputScope = fullScopeRefined.join(' ')
        expect(refineScope(inputScope)).not.toContain('openid')
        expect(refineScope(inputScope)).not.toContain('profile')
        expect(refineScope(inputScope)).not.toContain('offline_access')
    })

    it('should clean up MS Graph url', () => {
        const inputScope = msScope.join(' ')
        expect(refineScope(inputScope)).toMatch(cleanScope)
        // toMatchObject({        })
    })

    it('should clean all commas and spaces', () => {
        expect(refineScope(rawScopeStr)).toMatch(cleanScope)
    })
})

describe('Scope subset', () => {
    it('single scope element should be subset of full scope', () => {
        const inputScope = 'profile'.split(/\s/)
        expect(isSubsetOf(inputScope, fullScopeRefined)).toBe(true)
    })

    it('mixed subseted scope should be subset of full scope', () => {
        const inputScope = 'calendars.readwrite profile'.split(/\s/)
        expect(isSubsetOf(inputScope, fullScopeRefined)).toBe(true)
    })

    it('should shuffled scopes be equal to origin scope', () => {
        let shuffledScope = fullScopeRefined.sort()
        expect(isSubsetOf(shuffledScope, fullScopeRefined)).toBe(true)
    })
})

