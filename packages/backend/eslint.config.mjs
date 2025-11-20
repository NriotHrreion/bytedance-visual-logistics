import { defineConfig, globalIgnores } from "eslint/config";
 
const eslintConfig = defineConfig([
  globalIgnores([
    "build/**",
  ]),
  {
    rules: {
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
