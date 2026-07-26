module.exports = {
    "parser": "@babel/eslint-parser",
    "plugins": [
    ],
    "env": {
        "es6": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:jest/recommended"
    ],
    "parserOptions": {
        "sourceType": "module",
        "requireConfigFile": false
    },
    // react is a peerDependency and not installed here, so it cannot be
    // detected automatically - pin the lowest version we support
    "settings": {
        "react": { "version": "16.11" }
    },
    "globals": { "fetch": false },
    "rules": {
        "react/jsx-uses-vars": ["error"],
        "react/prop-types": ["warn"],
        "indent": [
            "warn",
            4
        ],
        "no-console": 0,
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "never"
        ]
    }
};