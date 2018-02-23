const levels = {
  ERROR : 4,
  WARN : 3,
  INFO : 2,
  DEBUG : 1,
  VERBOSE : 0,
}
let level = 4

export default {

  /**
   * Set log level, this value should be a string
   * 	ERROR, WARN, INFO, DEBUG
   * @param  {[type]} val [description]
   * @return {[type]}     [description]
   */
  setLevel: (val:string) => {
    console.log('log level set to ', val)
    level = levels[val]
  },

  verbose: (...args) => {
    if(level <= 0)
    console.log('VERBOSE:', ...args)
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
