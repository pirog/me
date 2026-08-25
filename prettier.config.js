export default {
  printWidth: 100,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  arrowParens: 'always',
  bracketSpacing: true,
  proseWrap: 'preserve',
  endOfLine: 'lf',
  overrides: [
    {
      files: '.github/ISSUE_TEMPLATE/*.yml',
      options: {
        singleQuote: false,
      },
    },
  ],
};
