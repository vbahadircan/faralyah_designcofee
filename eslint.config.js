import js from '@eslint/js';
import globals from 'globals';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

// CLAUDE.md hard rule 1: no hard-coded colors outside client/src/styles/tokens.css.
const HEX = /#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3,4}\b/;
const COLOR_FN = /\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb)\(/;
const MESSAGE = 'No hard-coded colors in code. Use a design token (see DESIGN.md).';

const faralyahPlugin = {
  rules: {
    'no-hardcoded-colors': {
      meta: { type: 'problem', schema: [] },
      create(context) {
        const check = (node, text) => {
          if (typeof text === 'string' && (HEX.test(text) || COLOR_FN.test(text))) {
            context.report({ node, message: MESSAGE });
          }
        };
        return {
          Literal: (node) => check(node, node.value),
          TemplateElement: (node) => check(node, node.value.raw),
        };
      },
    },
  },
};

export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**', 'uploads/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.node } },
    plugins: { faralyah: faralyahPlugin },
    rules: { 'faralyah/no-hardcoded-colors': 'error' },
  },
  {
    files: ['client/**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    rules: { ...reactHooks.configs.recommended.rules, ...jsxA11y.flatConfigs.recommended.rules },
  },
  {
    // mongosh init script run by the MongoDB container, not Node: `db` is a mongosh global.
    files: ['deploy/mongo-init.js'],
    languageOptions: { globals: { ...globals.node, db: 'readonly' } },
  },
  prettier,
);
