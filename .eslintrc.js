module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'unused-imports'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier'
  ],
  settings: { react: { version: 'detect' } },
  rules: {
    'unused-imports/no-unused-imports': 'warn',
    'react/react-in-jsx-scope': 'off'
  },
  ignorePatterns: ['node_modules', 'dist', '.next']
};


