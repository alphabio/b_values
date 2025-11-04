// b_path:: commitlint.config.js
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Monorepo scopes
    "scope-enum": [
      2,
      "always",
      [
        // Apps
        "basic",

        // Packages
        "b_components",
        "b_server",
        "b_store",
        "ui",
        "tailwind-config",
        "typescript-config",

        // Common
        "docs",
        "deps",
        "build",
        "ci",
        "test",
        "repo",
        "dx",
      ],
    ],

    // Scope recommended but not required
    // (some commits like "docs: update README" don't need scope)
    "scope-empty": [1, "never"],

    // Allow any case for subject
    "subject-case": [0],

    // Subject min length
    "subject-min-length": [2, "always", 10],
  },
};
