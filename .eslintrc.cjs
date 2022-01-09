module.exports = {
  env: {
    es2021: true,
    node: true,
  },

  extends: [
    'airbnb-base', //
    'airbnb-typescript/base',
  ],

  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 2021,
    project: './tsconfig.eslint.json',
    sourceType: 'module',
    tsconfigRootDir: __dirname,
  },

  plugins: [
    'import', //
    '@typescript-eslint',
  ],

  rules: {
    'implicit-arrow-linebreak': 'off',
    'import/prefer-default-export': 'off',
    'import/extensions': [
      2,
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'indent': 'off',
    'max-len': [1, { code: 120 }],
    'no-console': 'off',
    'no-debugger': 'off',
    'no-param-reassign': 'off',
    'no-shadow': 'off',
    'no-spaced-func': 'off',
    'no-unused-vars': 'off',
    'quote-props': ['error', 'consistent-as-needed'],
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/no-shadow': ['error'],
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  },

  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@', './src'], //
        ],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
