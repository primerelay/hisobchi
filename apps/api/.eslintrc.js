module.exports = {
  root: true,
  extends: ['@repo/eslint-config/node'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
