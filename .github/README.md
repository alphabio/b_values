# GitHub Configuration

This directory contains GitHub-specific configuration files for CI/CD and branch protection.

## 📁 Contents

### Workflows

- **`workflows/ci.yml`** - Continuous Integration pipeline
  - Runs on every PR to main
  - Jobs: Lint, Type Check, Build, Test
  - Blocks merging if any job fails

- **`workflows/release.yml`** - Automated releases
  - Runs when PRs merge to main
  - Creates Release PRs automatically
  - Publishes to npm when Release PR merges

### Documentation

- **`QUICK-START-CI.md`** - Quick setup guide (start here!)
- **`CI-CD-GUIDE.md`** - Comprehensive CI/CD documentation
- **`SETUP-CHECKLIST.md`** - Step-by-step setup checklist

### Scripts

- **`../scripts/setup-branch-protection.js`** - Automated branch protection setup

## 🚀 Quick Start

1. **Review the setup:**

   ```bash
   cat .github/QUICK-START-CI.md
   ```

2. **Push workflows to GitHub:**

   ```bash
   git add .github/
   git commit -m "ci: add CI/CD workflows"
   git push origin main
   ```

3. **Set up branch protection:**

   ```bash
   pnpm setup:branch-protection
   ```

4. **Test the CI:**
   - Create a test PR
   - Verify CI runs automatically
   - Verify all checks pass

## 📚 Learn More

- See `QUICK-START-CI.md` for immediate next steps
- See `CI-CD-GUIDE.md` for detailed workflow documentation
- See `SETUP-CHECKLIST.md` to track your setup progress

## 🔗 Related Files

- Root: `package.json` - Contains `setup:branch-protection` script
- Root: `.changeset/config.json` - Changeset configuration
- Root: `DX-GUIDE.md` - Developer experience guide
- Root: `WORKFLOW.md` - Development workflow overview

---

**Questions?** Check the documentation files in this directory.
