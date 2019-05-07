/* eslint-disable no-unused-vars */
let cache = {}
export default {
    setItem: (key, value) => {
        return new Promise((resolve, reject) => {
            return (typeof key !== 'string' || typeof value !== 'string')
                ? reject(new Error('key and value must be string'))
                : resolve(cache[key] = value)
        })
    },
    getItem: (key, value) => {
        return new Promise((resolve) => {
            return cache.hasOwnProperty(key)
                ? resolve(cache[key])
                : resolve(null)
        })
    },
    removeItem: (key) => {
        return new Promise((resolve, reject) => {
            return cache.hasOwnProperty(key)
                ? resolve(delete cache[key])
                : reject('No such key!')
        })
    },
    clear: (key) => {
        return new Promise((resolve, reject) => resolve(cache = {}))
    },

    getAllKeys: (key) => {
        return new Promise((resolve, reject) => resolve(Object.keys(cache)))
    },
}
