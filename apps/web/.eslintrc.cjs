module.exports = {
  root: true,
  extends: ['@repo/eslint-config/react'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
