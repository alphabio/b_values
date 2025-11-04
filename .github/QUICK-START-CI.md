# 🚀 Quick Start: CI/CD Setup

## ✅ What's Been Configured

### 1. GitHub Actions Workflows

- ✅ **CI Pipeline** (`.github/workflows/ci.yml`)
  - Runs on every PR and push to main
  - Validates: Lint, Type Check, Build, Tests

- ✅ **Release Automation** (`.github/workflows/release.yml`)
  - Auto-creates Release PRs with version bumps
  - Publishes to npm when Release PR is merged

### 2. Branch Protection Script

- ✅ **Automated setup** (`scripts/setup-branch-protection.js`)
  - Protects main branch
  - Requires PR reviews and passing CI
  - Blocks force pushes

## 🎯 Next Steps

### 1. Push to GitHub (if not already done)

```bash
git add .
git commit -m "ci: add CI/CD workflows and branch protection"
git push origin main
```

### 2. Set Up Branch Protection

```bash
pnpm setup:branch-protection
```

**Requirements:**

- GitHub CLI installed: `brew install gh`
- Authenticated: `gh auth login`
- Admin access to repo

### 3. Configure npm Publishing

**Only needed when you're ready to publish packages:**

```bash
# 1. Generate npm token
npm login
npm token create --type automation

# 2. Add to GitHub Secrets
# Go to: Settings → Secrets and variables → Actions
# Create: NPM_TOKEN = <your-token>

# 3. Update package to publish (e.g., packages/ui/package.json)
{
  "name": "@your-org/ui",
  "private": false,  // ← Remove private
  "publishConfig": {
    "access": "public"
  }
}
```

## 📖 Workflow Overview

### Development Flow

```
1. Create branch          → git checkout -b feat/my-feature
2. Make changes          → code, code, code...
3. Commit with changeset → pnpm commit && pnpm changeset
4. Push & create PR      → git push origin feat/my-feature
5. CI runs automatically → Lint, Type, Build, Test
6. Get approval          → Request review
7. Merge to main         → Squash and merge
```

### Release Flow (Automated)

```
1. Merge PR with changeset to main
2. Release workflow creates "Release PR"
   ├─ Bumps versions
   ├─ Updates CHANGELOGs
   └─ Groups all changes
3. Review Release PR
4. Merge Release PR
   ├─ Publishes to npm
   ├─ Creates GitHub release
   └─ Tags version
```

## 🔍 Verify Setup

### Check Workflows Exist

```bash
ls -la .github/workflows/
# Should see: ci.yml, release.yml
```

### Test CI Locally

```bash
pnpm check     # format + lint + typecheck
pnpm build     # build all packages
pnpm test      # run tests
```

### Check Changeset Config

```bash
cat .changeset/config.json
# Should reference: @changesets/changelog-github
```

## 📝 Usage Examples

### Making a Change with Changeset

```bash
# 1. Create branch
git checkout -b feat/add-button

# 2. Edit code
# ... make changes ...

# 3. Commit
pnpm commit
# Select: feat(ui): add new Button component

# 4. Add changeset
pnpm changeset
# Select: @b/ui
# Type: minor
# Summary: "Added new Button component with variants"

# 5. Push
git push origin feat/add-button

# 6. Create PR on GitHub
# CI will run automatically
```

### Creating Release PR Manually

Usually automatic, but if needed:

```bash
# On main branch
pnpm changeset:version
git add .
git commit -m "chore: version packages"
git push
```

## 🔐 Branch Protection Status

After running `pnpm setup:branch-protection`, verify:

```bash
gh api repos/$(gh repo view --json nameWithOwner -q .nameWithOwner)/branches/main/protection | jq
```

Should show:

- ✅ Required status checks: Lint, Type Check, Build, Test
- ✅ Required PR reviews: 1 approval
- ✅ Force push blocked

## 📊 Monitoring

### Check CI Status

```bash
gh run list                    # List recent runs
gh run view <run-id>          # View specific run
gh run watch                  # Watch current run
```

### Check Latest Release

```bash
gh release view               # Latest release
gh release list               # All releases
```

## 🆘 Common Issues

### "CI workflow not found"

- Push `.github/workflows/*.yml` to GitHub
- Check Actions tab is enabled in Settings

### "Branch protection failed"

- Ensure GitHub CLI is authenticated: `gh auth login`
- Need admin access to repo
- Repo must exist on GitHub

### "Changeset not creating Release PR"

- Need at least one changeset in `.changeset/`
- Ensure Release workflow exists
- Check Actions tab for errors

### "npm publish failed"

- Add `NPM_TOKEN` to GitHub Secrets
- Update package.json: `"private": false`
- Ensure you have npm publish rights

## 📚 Full Documentation

- **CI/CD Guide**: `.github/CI-CD-GUIDE.md` - Complete setup guide
- **DX Guide**: `DX-GUIDE.md` - Developer experience overview
- **Workflow**: `WORKFLOW.md` - Development workflow

## 🎉 You're Ready!

Your CI/CD pipeline is configured with:

- ✅ Automated CI checks on every PR
- ✅ Branch protection rules (when applied)
- ✅ Automated release workflow
- ✅ Changeset-based versioning
- ✅ npm publishing automation

**Next:** Run `pnpm setup:branch-protection` to protect main branch!

---

**Questions?** See `.github/CI-CD-GUIDE.md` for detailed information.
