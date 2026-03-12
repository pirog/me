import tseslint from 'typescript-eslint';

export const typescriptLintLayer = tseslint.config(...tseslint.configs.recommended);
