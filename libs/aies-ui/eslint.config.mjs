import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}'],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'aies',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          // Element hosts (`aies-select`) and attribute hosts (`button[aies-button]`).
          type: ['element', 'attribute'],
          prefix: 'aies',
          style: 'kebab-case',
        },
      ],
      // CVA controls expose `disabled` via `disabledInput` + alias — intentional.
      '@angular-eslint/no-input-rename': 'off',
    },
  },
  {
    files: ['**/*.html'],
    rules: {},
  },
];
