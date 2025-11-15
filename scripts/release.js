#!/usr/bin/env node
// b_path:: scripts/release.js
/**
 * Automated release script for b_short
 * Usage: node scripts/release.js [version-type]
 *
 * Requirements:
 * - Must be on 'main' branch
 * - Working directory must be clean
 *
 * Process:
 * 1. Runs tests, linting, and build
 * 2. Updates version in package.json
 * 3. Updates CHANGELOG.md
 * 4. Commits changes
 * 5. Creates and pushes git tag
 * 6. GitHub Actions automatically publishes to npm when tag is pushed
 *
 * version-type can be: patch (1.2.2 -> 1.2.3), minor (1.2.2 -> 1.3.0), major (1.2.2 -> 2.0.0)
 * If not specified, defaults to 'patch'
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

// Configuration
const RELEASE_BRANCH = "main";

// ANSI colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    const result = execSync(command, {
      cwd: rootDir,
      encoding: "utf-8",
      stdio: options.silent ? "pipe" : "inherit",
      ...options,
    });
    return result?.trim();
  } catch (error) {
    log(`❌ Command failed: ${command}`, "red");
    throw error;
  }
}

function getCurrentVersion() {
  const packageJson = JSON.parse(readFileSync(join(rootDir, "package.json"), "utf-8"));
  return packageJson.version;
}

function incrementVersion(version, type) {
  const [major, minor, patch] = version.split(".").map(Number);

  switch (type) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

function updatePackageJson(newVersion) {
  const packageJsonPath = join(rootDir, "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  packageJson.version = newVersion;
  writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
  log(`✅ Updated package.json to version ${newVersion}`, "green");
}

function updateChangelog(newVersion) {
  const changelogPath = join(rootDir, "CHANGELOG.md");
  const changelog = readFileSync(changelogPath, "utf-8");

  // Get current date in YYYY-MM-DD format
  const date = new Date().toISOString().split("T")[0];

  // Replace [Unreleased] with [version] - date
  const updatedChangelog = changelog.replace("## [Unreleased]", `## [${newVersion}] - ${date}`);

  writeFileSync(changelogPath, updatedChangelog);
  log(`✅ Updated CHANGELOG.md with version ${newVersion}`, "green");
}

function checkGitStatus() {
  const status = exec("git status --porcelain", { silent: true });
  if (status && !status.includes("CHANGELOG.md") && !status.includes("package.json")) {
    log("❌ Working directory is not clean. Please commit or stash changes first.", "red");
    process.exit(1);
  }
}

function checkBranch() {
  const branch = exec("git rev-parse --abbrev-ref HEAD", { silent: true });
  if (branch !== RELEASE_BRANCH) {
    log(`❌ You must be on the '${RELEASE_BRANCH}' branch to release. Current branch: ${branch}`, "red");
    process.exit(1);
  }
}

async function main() {
  const versionType = process.argv[2] || "patch";

  if (!["patch", "minor", "major"].includes(versionType)) {
    log("❌ Invalid version type. Use: patch, minor, or major", "red");
    process.exit(1);
  }

  log("\n🚀 Starting automated release process...", "bright");

  // 1. Check preconditions
  log("\n📋 Checking preconditions...", "blue");
  checkBranch();
  checkGitStatus();

  // 2. Get current version and calculate new version
  const currentVersion = getCurrentVersion();
  const newVersion = incrementVersion(currentVersion, versionType);
  log(`\n📦 Current version: ${currentVersion}`, "yellow");
  log(`📦 New version: ${newVersion}`, "green");

  // 3. Run tests
  log("\n🧪 Running tests...", "blue");
  exec("npm test");

  // 4. Run linter
  log("\n🔍 Running linter...", "blue");
  exec("npm run lint");

  // 5. Build
  log("\n🔨 Building...", "blue");
  exec("npm run build");

  // 6. Update version in files
  log("\n📝 Updating version files...", "blue");
  updatePackageJson(newVersion);
  updateChangelog(newVersion);

  // 7. Commit changes
  log("\n💾 Committing changes...", "blue");
  exec("git add package.json CHANGELOG.md");
  exec(`git commit -m "chore: release v${newVersion}"`);

  // 8. Create and push tag
  log("\n🏷️  Creating and pushing tag...", "blue");
  exec(`git tag -a v${newVersion} -m "Release v${newVersion}"`);
  exec(`git push origin ${RELEASE_BRANCH}`);
  exec(`git push origin v${newVersion}`);

  log("\n✨ Release process completed!", "bright");
  log("\n📍 Next steps:", "yellow");
  log("   1. GitHub Actions will automatically build and publish to npm");
  log("   2. GitHub release will be created automatically");
  log("\n🔗 Monitor the release at: https://github.com/alphabio/b_short/actions", "blue");
}

main().catch((error) => {
  log(`\n❌ Release failed: ${error.message}`, "red");
  process.exit(1);
});
