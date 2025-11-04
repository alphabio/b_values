# CI/CD Setup Guide

## 🚀 Overview

This repository uses GitHub Actions for CI/CD with the following workflow:

```
Feature Branch → PR → CI Checks → Merge to main → Release Automation
```

## 📋 Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

Runs on every PR and push to main:

- **Lint**: Markdown + code linting with Biome
- **Type Check**: TypeScript validation across all packages
- **Build**: Turbo build of all packages
- **Test**: Run test suite (when tests are added)

**Triggers:**

- Pull requests to `main`
- Pushes to `main`

### 2. Release Workflow (`.github/workflows/release.yml`)

Automated release management using Changesets:

- **On merge to main**: Creates a "Release PR" that:
  - Bumps package versions
  - Updates CHANGELOG.md files
  - Consolidates all changesets

- **When Release PR is merged**:
  - Publishes packages to npm
  - Creates GitHub releases with tags
  - Includes changelogs in release notes

**Triggers:**

- Pushes to `main` branch

## 🔐 Branch Protection Rules

### Automated Setup

Run this script to automatically configure branch protection:

```bash
node scripts/setup-branch-protection.js
```

**Prerequisites:**

1. Install GitHub CLI: `brew install gh` (macOS) or https://cli.github.com/
2. Authenticate: `gh auth login`
3. Have admin access to the repository

### Protection Rules Applied

The script configures:

- ✅ **Require PR reviews** - 1 approval required
- ✅ **Dismiss stale reviews** - New commits require re-approval
- ✅ **Require status checks** - All CI jobs must pass:
  - Lint
  - Type Check
  - Build
  - Test
- ✅ **Block force pushes** - Prevent history rewriting
- ✅ **Require conversation resolution** - All comments must be resolved
- ✅ **Admin bypass allowed** - For emergencies only

### Manual Setup (Alternative)

If you prefer to set up manually via GitHub UI:

1. Go to: **Settings** → **Branches** → **Add rule**
2. Branch name pattern: `main`
3. Enable:
   - ☑️ Require a pull request before merging
   - ☑️ Require approvals (1)
   - ☑️ Dismiss stale pull request approvals
   - ☑️ Require status checks to pass: Lint, Type Check, Build, Test
   - ☑️ Require conversation resolution
   - ☑️ Do not allow bypassing the above settings (optional)
4. Save changes

## 📦 Publishing Setup

### 1. NPM Token

Before packages can be published, you need to set up npm authentication:

1. **Create npm account** (if needed): https://www.npmjs.com/signup

2. **Generate access token**:

   ```bash
   npm login
   npm token create --type automation
   ```

3. **Add to GitHub Secrets**:
   - Go to: **Settings** → **Secrets and variables** → **Actions**
   - Click: **New repository secret**
   - Name: `NPM_TOKEN`
   - Value: Paste your npm token
   - Click: **Add secret**

### 2. Configure Package for Publishing

When ready to publish a package, update its `package.json`:

```json
{
  "name": "@your-org/package-name",
  "version": "0.1.0",
  "private": false, // ← Remove private flag
  "publishConfig": {
    "access": "public" // For public packages
  }
}
```

## 🔄 Development Workflow

### Making Changes

1. **Create feature branch**:

   ```bash
   git checkout -b feat/your-feature
   ```

2. **Make changes** and commit:

   ```bash
   pnpm commit  # Interactive commit
   ```

3. **Add changeset** (for user-facing changes):

   ```bash
   pnpm changeset
   ```

   Select affected packages and describe the change.

4. **Push and create PR**:

   ```bash
   git push origin feat/your-feature
   ```

5. **Wait for CI checks** ✅

6. **Get approval** and **merge**

### Release Process

The release process is **fully automated**:

1. **Merge PRs with changesets to main**

2. **Changesets bot creates/updates "Release PR"**
   - Automatically bumps versions
   - Updates CHANGELOGs
   - Groups all pending changes

3. **Review Release PR**
   - Check version bumps are correct
   - Review changelog entries
   - Ensure everything looks good

4. **Merge Release PR**
   - Packages automatically publish to npm
   - GitHub releases created with tags
   - Changesets are cleaned up

### Manual Release (if needed)

```bash
# Version bump
pnpm changeset:version

# Commit changes
git add .
git commit -m "chore: release packages"

# Publish (requires npm authentication)
pnpm changeset:publish

# Push tags
git push --follow-tags
```

## 🎯 CI Best Practices

### PR Workflow

1. **Small, focused PRs** - Easier to review
2. **Always add changeset** - For versioned changes
3. **Wait for CI** - Never merge with failing checks
4. **Resolve conversations** - Before merging
5. **Keep main stable** - CI prevents broken merges

### Debugging Failed CI

**Lint failures:**

```bash
pnpm lint:md      # Fix markdown
pnpm exec biome lint --write .  # Fix code
```

**Type errors:**

```bash
pnpm typecheck    # See all errors
```

**Build failures:**

```bash
pnpm build        # Test locally
```

### Local Validation

Before pushing, run the full check:

```bash
pnpm check  # Runs: format + lint + typecheck
```

Or use git hooks (already configured):

```bash
git push  # Hooks run typecheck automatically
```

## 🔍 Monitoring

### Check CI Status

**Via GitHub UI:**

- Go to **Actions** tab
- See all workflow runs
- Click for detailed logs

**Via GitHub CLI:**

```bash
gh run list
gh run view <run-id>
gh run watch  # Live updates
```

### Check Release Status

**Latest release:**

```bash
gh release view
```

**All releases:**

```bash
gh release list
```

## 🛠️ Maintenance

### Update Dependencies

1. Update versions in `pnpm-workspace.yaml` (catalog)
2. Run `pnpm install`
3. Test thoroughly
4. Create PR with changeset
5. Use scope `deps`: `chore(deps): update React to 19.3`

### Update CI Workflow

1. Edit `.github/workflows/*.yml`
2. Test changes on a branch
3. Merge when CI passes

### Update Branch Protection

Re-run the setup script:

```bash
node scripts/setup-branch-protection.js
```

## 📊 Status Badges

Add to your README.md:

```markdown
![CI](https://github.com/YOUR_ORG/YOUR_REPO/workflows/CI/badge.svg)
![Release](https://github.com/YOUR_ORG/YOUR_REPO/workflows/Release/badge.svg)
```

## 🆘 Troubleshooting

### CI keeps failing on main

- Check the Actions tab for error details
- Run commands locally to reproduce
- Fix and push directly (or create hotfix PR)

### Release workflow not triggering

- Ensure `NPM_TOKEN` secret is set
- Check workflow file syntax
- Verify permissions in workflow

### Can't push to main

- ✅ This is correct! Always use PRs
- For emergencies, admins can bypass (if configured)

### Changeset not creating Release PR

- Ensure changeset files exist in `.changeset/`
- Check Release workflow logs
- May need to trigger manually: merge an empty commit

## 📚 Learn More

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Changesets Documentation](https://github.com/changesets/changesets)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)

---

**Questions?** Check workflow logs in the Actions tab or review this guide.
