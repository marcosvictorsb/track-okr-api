import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  { files: ['**/*.{ts}'] },
  { files: ['**/*.ts'], languageOptions: { sourceType: 'esnext' } },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  { languageOptions: { globals: globals.browser } },
  {
    rules: {
      eqeqeq: 'off',
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { 
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_"
        }
      ],
      'prefer-const': ['error', { ignoreReadBeforeAssign: true }],
      'no-restricted-imports': ['error']
    }
  },
  {
    ignores: ['.node_modules/*']
  }
];
