/* eslint no-console: 0 */
const levels = {
    ERROR : 4,
    WARN : 3,
    INFO : 2,
    DEBUG : 1,
    TRACE : 0,
}
let level = 0 // default level

export default {

    /**
   * Set log level, this value should be a string
   * 	ERROR, WARN, INFO, DEBUG, TRACE
   * @param  {String} val
   *
   * @memberof Globals
   */
    setLevel: (val) => {
        console.log('log level set to ', val)
        level = levels[val.toUpperCase()]
    },

    trace: (...args) => {
        if(level <= 0)
            console.log('TRACE:', ...args)
    },

    debug: (...args) => {
        if(level <= 1)
            console.log('DEBUG:', ...args)
    },

    info: (...args) => {
        if(level <= 2)
            console.log('INFO:', ...args)
    },

    warn: (...args) => {
        if(level <= 3)
            console.warn('WARN:', ...args)
    },

    error: (...args) => {
        if(level <= 4)
            console.error('ERROR:', ...args)
    },

}
