module.exports = {
	root: true,
	env: { browser: true, es2022: true, node: true },
	extends: [
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:react-hooks/recommended'
	],
	parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
	rules: {
		// Week 6: block common XSS vectors in React code
		'react/no-danger': 'error',
		'no-implied-eval': 'error',
		'no-eval': 'error',
		'no-script-url': 'error'
	},
	settings: { react: { version: 'detect' } }
}

