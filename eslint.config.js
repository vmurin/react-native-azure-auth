const js = require('@eslint/js')
const globals = require('globals')
const react = require('eslint-plugin-react')
const jest = require('eslint-plugin-jest')
const babelParser = require('@babel/eslint-parser')

module.exports = [
    { ignores: ['docs/**', 'scripts/**', 'coverage/**', 'out/**'] },
    js.configs.recommended,
    react.configs.flat.recommended,
    { files: ['**/__tests__/**/*.js', '**/__mocks__/**/*.js'], ...jest.configs['flat/recommended'] },
    {
        languageOptions: {
            parser: babelParser,
            parserOptions: { sourceType: 'module', requireConfigFile: false },
            globals: { ...globals.node, fetch: 'readonly' }
        },
        // react is a peerDependency and not installed here, so it cannot be
        // detected automatically - pin the lowest version we support
        settings: { react: { version: '16.11' } },
        rules: {
            'react/jsx-uses-vars': ['error'],
            'react/prop-types': ['warn'],
            'indent': ['warn', 4],
            'no-console': 0,
            'linebreak-style': ['error', 'unix'],
            'quotes': ['error', 'single'],
            'semi': ['error', 'never']
        }
    }
]
