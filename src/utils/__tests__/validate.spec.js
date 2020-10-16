import { validate, ParameterTypeError } from '../validate'
import faker from 'faker'

describe('validate', () => {

    const rules = {
        parameters: {
            state: {required: true},
            nonce: {required: false, type: 'string'},
            clientId: {required: false, toName: 'client_id'},
            realm: {}
        },
        aliases: {
            connection: 'realm',
            clientID: 'clientId'
        }
    }

    it('should keep declared values and use aliases', () => {
        const value = {
            state: faker.random.uuid(),
            nonce: faker.random.uuid(),
            clientID: faker.random.uuid(), // ID - in caps!
            connection: faker.random.word()
        }
        expect(validate(rules, value)).toMatchObject({
            state: value.state,
            nonce: value.nonce,
            client_id: value.clientID,
            realm: value.connection
        })
    })

    it('should fail if required key is not found', () => {
        const values = { nonce: faker.random.uuid() }
        expect(() => validate(rules, values)).toThrowErrorMatchingSnapshot()
    })

    it('should not fail if required boolean key equals "false"', () => {
        const values = { state: false }
        expect(() => validate(rules, values)).not.toThrow()
    })

    it('should handle multiple parameters', () => {
        const value = {
            state: faker.random.uuid(),
            nonce: faker.random.uuid()
        }
        expect(validate(rules, value)).toMatchObject(value)
    })

    it('should remove non declared keys by default', () => {
        const state = faker.random.uuid()
        const value = {
            state,
            initialState: faker.random.uuid()
        }
        expect(validate(rules, value)).toMatchObject({state})
    })

    it('should keep non declared keys', () => {
        const state = faker.random.uuid()
        const value = {
            state,
            initialState: faker.random.uuid()
        }
        const allowNonDeclared = { validate: false, ...rules}
        expect(validate(allowNonDeclared, value)).toMatchObject(value)
    })

    it('should consider parameters as optional by default', () => {
        const value = {
            state: faker.random.uuid()
        }
        expect(validate(rules, value)).toMatchObject({state: value.state})
    })

    it('should use mapped name if available', () => {
        const state = faker.random.uuid()
        const clientId = faker.random.uuid()
        const value = {
            state,
            clientId
        }
        expect(validate(rules, value)).toMatchObject({
            state,
            'client_id': clientId
        })
    })

    it('should fail on incorrect object type', () => {
        const state = faker.random.uuid()
        const values = {
            state,
            nonce: 333
        }        
        expect(() => validate(rules, values)).toThrow(ParameterTypeError)
    })
})