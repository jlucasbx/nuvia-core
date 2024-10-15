import globals from "globals"
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"


export default [
    { files: ["**/*.{js,mjs,cjs,ts}"] },
    { languageOptions: { globals: globals.node } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            "quotes": ["error", "double", { "avoidEscape": false }],
            "no-console": "error",
            "no-empty": "off",
            semi: ["error", "never"],
            "comma-dangle": ["error", "never"],
            "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }]
        }
    }
]
