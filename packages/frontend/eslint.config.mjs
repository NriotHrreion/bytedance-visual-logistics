import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
 
const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-unused-vars": ["error", {
        "args": "none",
        "caughtErrors": "none"
      }],
      "@typescript-eslint/consistent-type-imports": "warn",
      "@next/next/no-img-element": "off",
      "import/order": ["warn", {
        groups: [
          "type",
          "builtin",
          "external",
        ],
        "newlines-between": "ignore"
      }],
      "import/first": "error",
      "import/no-duplicates": "error",
      "import/no-named-as-default": "off",
    }
  }
]);
 
export default eslintConfig;
