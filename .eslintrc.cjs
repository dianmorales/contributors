module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "google",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },

  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    "max-len": 0,
    "require-jsdoc": 0,
    "@typescript-eslint/no-var-requires": 0,
    "@typescript-eslint/ban-ts-comment": 1,
  },
  root: true,
};
