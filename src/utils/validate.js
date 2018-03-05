import BaseError from './baseError'

export default class ParameterError extends BaseError {
    constructor (expected, actual, missing) {
        super('Missing required parameters', `Missing required parameters: ${JSON.stringify(missing, null, 2)}`)
        this.expected = expected
        this.actual = actual
        this.missing = missing
    }
}

/**
 * Applies the validtion and transform rules to the given values
 * 
 * Possible rules:
 * 
 *     const rules = {
        parameters: {
            realm: {} // just declared without rules, not required by default
            state: {required: true}, // required
            nonce: {required: false}, // not required
            clientId: {toName: 'client_id'}, // key name transform rule
        },
        validate: true | false
        aliases: {
            connection: 'realm',
            clientID: 'clientId'
        }
    }
 * Actions:
 * - removes not declared in rules values (can be disabled by 'validate: false' parameter)
 * - checks if all required values are exist in values ('required: true')
 * - all values are optional by default (without "required" rule)
 * 
 * @param { Object } rules 
 * @param { Object } values 
 */
export function validate(rules, values) {
    const { validate = true, parameters, aliases = {} } = rules
    let mapped = {}
    let requiredKeys = Object
        .keys(parameters)
        .filter((key) => parameters[key].required)
        .map((key) => parameters[key].toName || key)

    for (let key of Object.keys(values)) {
        let value = values[key]
        let parameterKey = aliases[key] || key
        let parameter = parameters[parameterKey]
        if (parameter && value) {
            mapped[parameter.toName || parameterKey] = value
        } else if (value && !validate) {
            mapped[key] = value
        }
    }

    let missing = requiredKeys.filter((key) => !mapped[key])
    if (missing.length > 0) {
        throw new ParameterError(requiredKeys, values, missing)
    }
    return mapped
}
