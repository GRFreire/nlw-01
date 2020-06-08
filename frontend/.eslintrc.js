module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 11,
    sourceType: 'module',
  },
  plugins: [
    'react',
    '@typescript-eslint',
  ],
  rules:  {
    'react/jsx-filename-extension': [2, { 'extensions': ['.js', '.jsx', '.ts', '.tsx'] }],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never'
      }
   ],
   'jsx-a11y/label-has-associated-control': [ 2, {
      'labelComponents': ['label'],
      'labelAttributes': ['htmlFor'],
      'controlComponents': ['input']
    }],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error'
    ],
    'react/jsx-props-no-spreading': 'off',
    camelcase: 'off'
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  },
};
