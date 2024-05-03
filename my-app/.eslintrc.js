module.exports = {
  root: true,
  env: {
     node: true,
     browser: true,
  },
  extends: ['plugin:vue/vue3-essential', '@vue/standard'],
  parserOptions: {
     parser: '@babel/eslint-parser',
     babelConfigFile: './babel.config.js', // Specify the path to your Babel config file
  },
  plugins: ['vue'],
  rules: {
     // Add your own ESLint rules if needed
  },
 };
 