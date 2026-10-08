import { defineConfig } from "eslint/config";
import nextConfig from "eslint-config-next";
import globals from "globals";
import typescriptEslint from "typescript-eslint";

export default defineConfig([
  { ignores: [".next/", "node_modules/", "dist/", "*.config.*"] },
  ...typescriptEslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: { version: "19" },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  ...nextConfig,
]);