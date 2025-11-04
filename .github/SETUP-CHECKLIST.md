# CI/CD Setup Checklist

Use this checklist to complete your CI/CD setup.

## ✅ Initial Setup

- [ ] Repository pushed to GitHub
- [ ] GitHub Actions enabled (Settings → Actions → Allow all actions)
- [ ] Workflows committed and pushed (`.github/workflows/`)

## ✅ Branch Protection

- [ ] GitHub CLI installed (`brew install gh` or https://cli.github.com/)
- [ ] GitHub CLI authenticated (`gh auth login`)
- [ ] Admin access to repository confirmed
- [ ] Branch protection applied: `pnpm setup:branch-protection`
- [ ] Verify protection rules in Settings → Branches

## ✅ CI Verification

- [ ] Create a test branch: `git checkout -b test/ci-setup`
- [ ] Make a small change
- [ ] Push and create PR
- [ ] Verify CI runs: Lint, Type Check, Build, Test
- [ ] Verify all checks pass
- [ ] Verify PR cannot be merged until checks pass (if protection enabled)

## ✅ npm Publishing Setup (Optional - when ready)

- [ ] npm account created (https://www.npmjs.com/signup)
- [ ] npm authentication: `npm login`
- [ ] npm token created: `npm token create --type automation`
- [ ] Token added to GitHub Secrets:
  - Go to: Settings → Secrets and variables → Actions
  - Name: `NPM_TOKEN`
  - Value: Your token
- [ ] Test package updated (remove `"private": true`, add `publishConfig`)
- [ ] Test changeset created: `pnpm changeset`
- [ ] Test changeset committed and pushed

## ✅ Release Workflow Test

- [ ] Create branch with change
- [ ] Add changeset: `pnpm changeset`
- [ ] Create and merge PR to main
- [ ] Verify Release PR is auto-created
- [ ] Review Release PR (versions, changelog)
- [ ] Merge Release PR
- [ ] Verify packages published to npm (if configured)
- [ ] Verify GitHub release created

## ✅ Team Onboarding

- [ ] Share `.github/QUICK-START-CI.md` with team
- [ ] Review workflow in team meeting
- [ ] Add collaborators to repository
- [ ] Configure review requirements (Settings → Branches)
- [ ] Set up CODEOWNERS file (optional)

## ✅ Documentation

- [ ] Update main README.md with CI badge
- [ ] Document any custom workflow needs
- [ ] Add repository-specific notes

## 🎯 CI Badge (Optional)

Add to your `README.md`:

```markdown
![CI](https://github.com/YOUR_ORG/YOUR_REPO/workflows/CI/badge.svg)
![Release](https://github.com/YOUR_ORG/YOUR_REPO/workflows/Release/badge.svg)
```

Replace `YOUR_ORG/YOUR_REPO` with your repository path.

## 📝 Notes

### Current Status

Date completed: \***\*\_\_\_\*\***

Team members trained: \***\*\_\_\_\*\***

npm packages published: \***\*\_\_\_\*\***

### Issues Encountered

<!-- Document any issues and solutions here -->

### Custom Configuration

<!-- Note any project-specific customizations -->

---

**Completed?** Remove this checklist or keep it for reference.
