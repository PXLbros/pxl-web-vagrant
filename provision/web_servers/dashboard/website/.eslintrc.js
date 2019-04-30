module.exports = {
    root: true,
    env: {
        node: true
    },
    'extends': [
        'plugin:vue/recommended',
        '@vue/standard'
    ],
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'indent': 'off',
        'vue/script-indent': ['warn', 4, {
            'baseIndent': 1
        }],
        'vue/html-indent': ['warn', 4, {
            'baseIndent': 1
        }],
        'semi': [1, 'always'],
        'camelcase': 0,
        'vue/max-attributes-per-line': 0,
        'vue/html-self-closing': ['error', {
            'html': {
                'void': 'never',
                'normal': 'never',
                'component': 'always'
            },
            'svg': 'always',
            'math': 'always'
        }],
        'space-before-function-paren': 0
    },
    parserOptions: {
        parser: 'babel-eslint'
    }
}
