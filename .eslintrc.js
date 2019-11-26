module.exports = {
    "parser": "babel-eslint",
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
        "sourceType": "module"
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