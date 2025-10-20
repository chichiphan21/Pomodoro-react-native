// .eslintrc.js
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  // 1. Dùng ... (spread) để trải phẳng config của Expo
  ...expoConfig,

  // 2. Cấu hình ignores của bạn
  {
    ignores: ['dist/*'],
  },

  // 3. Cấu hình settings và rules
  {
    settings: {
      'import/resolver': {
        node: {
          caseSensitive: false,
        },
        typescript: {
          caseSensitive: false,
        },
      },
    },
    rules: {
      'import/no-unresolved': [
        'error',
        {
          caseSensitive: false,
          caseSensitiveStrict: false,
        },
      ],
    },
  },
]);