/**
 * @type {import('@types/eslint').Linter.BaseConfig}
 */
module.exports = {
  extends: ["@kontrol/eslint-config/library"],
  rules: {
    "unicorn/filename-case": "off",
  },
};
