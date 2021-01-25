import BaseError from './baseError'

export default class ParameterError extends BaseError {
    constructor (expected, actual, missing) {
        super('Missing required parameters', `Missing required parameters: ${JSON.stringify(missing, null, 2)}`)
        this.expected = expected
        this.actual = actual
        this.missing = missing
    }
}

export class ParameterTypeError extends BaseError {
    constructor (expected, actual, mistyped) {
        super('Incorrectly typed parameters', `Parameters with wrong type: ${JSON.stringify(mistyped, null, 2)}`)
        this.expected = expected
        this.actual = actual
        this.mistyped = mistyped
    }
}

/**
 * Applies the validtion and transform rules to the given values
 *
 * Possible rules:
 
 *     rules = {
        parameters: {
            // define rules for needed keys from `values` input object
            realm: {} // just declared without rules, not required by default
            state: {required: true}, // required
            nonce: {required: false, type: 'string'}, // not required, but if given must have type `strng`
            clientId: {toName: 'client_id'}, // key name transform rule
        },
        validate: true | false // if true (default) - pass through only declared params
        aliases: {
            connection: 'realm',
            clientID: 'clientId'
        }
    }
 * Actions:
 * - removes not declared in rules values (can be disabled by 'validate: false' parameter)
 * - checks if all required values are exist in values ('required: true')
 * - cheks if all given typed parameters have a required type
 * - all values are optional by default (without "required" rule)
 *
 * @param { Object } rules
 * @param { Object } values
 */
export function validate(rules, values) {
    const { validate = true, parameters, aliases = {} } = rules
    let mapped = {}
    const requiredKeys = Object
        .keys(parameters)
        .filter((key) => parameters[key].required)
        .map((key) => parameters[key].toName || key)

    const typed = Object
        .keys(parameters)
        .filter((key) => {
            return parameters[key].type && typeof parameters[key].type === 'string'
        })
        .reduce((acc, cur) => { 
            acc[parameters[cur].toName || cur] = parameters[cur].type
            return acc
        }, {})

    for (let key of Object.keys(values)) {
        let value = values[key]
        let parameterKey = aliases[key] || key
        // this approach needed for defined boolean values with 'false'
        // it checks for both 'null' and 'undefined'
        let valueIsDefined = value != undefined && value != null 
        let parameter = parameters[parameterKey]
        if (parameter && valueIsDefined) {
            mapped[parameter.toName || parameterKey] = value
        } else if (valueIsDefined && !validate) {
            mapped[key] = value
        }
    }

    const incorrectlyTyped = Object
        .keys(typed)
        .filter((key) => {
            return mapped[key] && typeof mapped[key] !== typed[key].toLowerCase()
        })
    if (incorrectlyTyped.length > 0) {
        throw new ParameterTypeError(typed, values, incorrectlyTyped)
    }
    const missing = requiredKeys.filter((key) => mapped[key] == null)
    if (missing.length > 0) {
        throw new ParameterError(requiredKeys, values, missing)
    }
    return mapped
}
