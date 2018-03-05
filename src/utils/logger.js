// @flow
/* eslint no-console: 0 */ 
const levels = {
    ERROR : 4,
    WARN : 3,
    INFO : 2,
    DEBUG : 1,
    TRACE : 0,
}
let level = 0

export default {

    /**
   * Set log level, this value should be a string
   * 	ERROR, WARN, INFO, DEBUG
   * @param  {[type]} val [description]
   * @return {[type]}     [description]
   */
    setLevel: (val: string) => {
        console.log('log level set to ', val)
        level = levels[val]
    },

    trace: (...args: any) => {
        if(level <= 0)
            console.log('TRACE:', ...args)
    },

    debug: (...args: any) => {
        if(level <= 1)
            console.log('DEBUG:', ...args)
    },

    info: (...args: any) => {
        if(level <= 2)
            console.log('INFO:', ...args)
    },

    warn: (...args: any) => {
        if(level <= 3)
            console.warn('WARN:', ...args)
    },

    error: (...args: any) => {
        if(level <= 4)
            console.error('ERROR:', ...args)
    },

}
