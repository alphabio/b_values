# 📚 Documentation Guide

**Purpose:** Entry point for agents and developers working on this turborepo monorepo template.

---

## 🚀 Quick Start for New Agents

1. **Read this file** to understand the monorepo structure
2. **Check `SESSION_HANDOVER.md`** for current project state
3. **Review `CODE_QUALITY.md`** for standards and conventions
4. **Begin work** - confirm action plan with user

---

## 📂 Documentation Structure

```
docs/
├── README.md                          ← You are here (static guide)
├── SESSION_HANDOVER.md                ← CURRENT session state
├── CODE_QUALITY.md                    ← Code standards and quality gates
│
├── sessions/                          ← Session archives + artifacts
│   ├── 001/                          ← Session 001 directory
│   │   ├── SESSION_HANDOVER.md       ← The handover
│   │   ├── git-ref.txt               ← Commit SHA from session
│   │   └── *.md                      ← Session artifacts (analyses, bugs, etc)
│   ├── 002/
│   │   ├── SESSION_HANDOVER.md
│   │   ├── git-ref.txt
│   │   └── *.md
│   └── ...
│
├── architecture/                      ← Long-lived technical docs
│   ├── README.md
│   └── decisions/                     ← ADRs promoted from sessions
│       └── 001-example-decision.md
│
└── archive/                           ← Deprecated/superseded docs
```

---

## 🏗️ Monorepo Structure

```
b_values/
├── apps/                              ← Applications
│   └── basic/                         ← Example app (React + TanStack Router + Convex)
│
├── packages/                          ← Shared packages
│   ├── b_components/                  ← Shared React components
│   ├── b_server/                      ← Server-side utilities
│   ├── b_store/                       ← State management (Zustand)
│   ├── ui/                            ← UI component library (Radix UI)
│   ├── tailwind-config/               ← Shared Tailwind CSS config
│   └── typescript-config/             ← Shared TypeScript configs
│
├── docs/                              ← Documentation (this directory)
├── scripts/                           ← Build and utility scripts
├── .github/                           ← GitHub workflows and config
│
├── turbo.json                         ← Turborepo configuration
├── pnpm-workspace.yaml                ← PNPM workspace config
├── package.json                       ← Root package.json
├── justfile                           ← Just command runner recipes
└── biome.json                         ← Biome linter/formatter config
```

---

## 🛠️ Technology Stack

### Core

- **Build System:** Turborepo - high-performance monorepo build system
- **Package Manager:** PNPM - fast, disk space efficient package manager
- **Language:** TypeScript - type-safe JavaScript
- **Bundler:** Vite - next generation frontend tooling

### Frontend (Apps)

- **Framework:** React 19
- **Routing:** TanStack Router - type-safe routing
- **Styling:** Tailwind CSS v4 - utility-first CSS
- **UI Components:** Radix UI - accessible component primitives
- **State Management:** Zustand - lightweight state management
- **Backend:** Convex - serverless backend with real-time sync
- **Auth:** Convex Auth - authentication for Convex apps

### Developer Experience

- **Linter/Formatter:** Biome - fast, unified toolchain
- **Task Runner:** Just - command runner
- **Git Hooks:** Lefthook - fast git hooks manager
- **Commits:** Commitizen + Conventional Commits
- **Versioning:** Changesets - version and publish management

---

## 📝 Session Handover Protocol

### Philosophy

**Keep it lean:** Each session handover documents ONLY what happened in that session. Previous context is in archived sessions - don't duplicate it.

**Think incremental snapshots, not cumulative history.**

### For Incoming Agent (Starting Session)

1. **Read `SESSION_HANDOVER.md`** (current state)
2. **Get context:**
   - What's the current focus?
   - What's blocking?
   - What needs to happen next?
3. **Archive previous session:**

```bash
# Find next session number
NEXT=$(find docs/sessions -maxdepth 1 -type d -name "[0-9]*" | wc -l | xargs)
NEXT=$((NEXT + 1))
SESSION_DIR="docs/sessions/$(printf "%03d" $NEXT)"

# Create session archive directory
mkdir -p "$SESSION_DIR"

# Archive the handover and git ref
mv docs/SESSION_HANDOVER.md "$SESSION_DIR/"
git rev-parse HEAD > "$SESSION_DIR/git-ref.txt"

# Archive any session artifacts (exclude permanent docs)
find docs/ -maxdepth 1 -name "*.md" \
  -not -name "README.md" \
  -not -name "CODE_QUALITY.md" \
  -exec mv {} "$SESSION_DIR/" \;
```

4. **Create new `SESSION_HANDOVER.md`:**

```bash
# Copy structure from previous session
cat > docs/SESSION_HANDOVER.md << 'EOF'
# Session NNN: [Title]

**Date:** YYYY-MM-DD
**Git Ref:** [Will be captured on next session start]
**Focus:** [What this session is about]

---

## ✅ What Was Accomplished

- [List achievements]

---

## 📊 Current State

**What's working:**
- [List working features]

**What's not:**
- [List issues/blockers]

---

## 🎯 Next Steps

1. [Priority 1]
2. [Priority 2]

---

## 📝 Session Artifacts Created

- [List docs created]

---

## 💡 Key Decisions

- [Document important decisions]
EOF
```

5. **Read `CODE_QUALITY.md`** (important)

6. **Begin work**
   - Confirm action plan for this session
   - Ask if the user has anything additional to add

### For Outgoing Agent (Ending Session)

**Your job: Write a good handover for the next agent**

1. **Update `docs/SESSION_HANDOVER.md`** throughout your session

Include:

- What was accomplished
- Current state (what's working, what's not)
- Session artifacts created (list them)
- Next steps and blockers
- Key decisions made

2. **Create working docs as needed:**

```bash
# Create analysis docs, bug reports, etc. in docs root
docs/BUG_ADVECTION.md
docs/PERFORMANCE_ANALYSIS.md
docs/CRITICAL_FINDINGS.md
```

Don't worry about organizing - next agent will archive them.

3. **Promote lasting docs if needed:**

If you create an ADR or something with lasting value:

```bash
# Move to architecture immediately
mv docs/ADR-001-state-management.md docs/architecture/decisions/
```

Or note in handover: "Promote `ADR-001-state-management.md` to architecture"

4. **Reference previous sessions if helpful:**

```markdown
## Related Context

See `docs/sessions/001/BUG_ADVECTION.md` for original bug analysis.
```

**The next agent will archive everything on session start.**

---

**Key principle:**

- Current handover: `docs/SESSION_HANDOVER.md` (you edit this)
- Archives: `docs/sessions/NNN/` (next agent creates on start)
- Work naturally, archive on transition

**Key principle:** `SESSION_HANDOVER.md` is always current. Old ones go to `sessions/` and become immutable.

---

## 🧹 Cleanup Instructions

During development, ad-hoc documents are often created in the project root or various locations.

### When to Clean Up

Periodically (or when instructed), organize loose documentation:

```bash
# Architecture decisions → docs/architecture/
mv ROOT_DOC_ABOUT_ARCHITECTURE.md docs/architecture/decisions/

# Planning docs that are complete → docs/archive/
mv PLANNING_DOC.md docs/archive/

# Outdated/deprecated → docs/archive/
mv OLD_APPROACH.md docs/archive/
```

### Guidelines

- **Architecture docs** → `docs/architecture/` (use subdirectories: decisions/, patterns/, diagrams/)
- **Completed plans** → `docs/archive/`
- **Old/deprecated** → `docs/archive/`
- **Feature specs** → Create `docs/features/` if needed for your project
- **Research notes** → Create `docs/research/` if needed for your project

**Keep root clean:** Only essential files (README.md, package.json, etc.) should live in project root.

---

## 🎯 Key Directories Explained

### `sessions/`

Archived session handovers. Immutable historical record of project progress and decisions. Each session gets numbered (001, 002, 003...) and archived at the start of the next session.

### `architecture/`

System design, architecture decisions (ADRs), technical choices, and patterns. Documents the "why" and "how" of the codebase structure. Create subdirectories for decisions, patterns, and diagrams as needed.

### `archive/`

Deprecated or superseded documentation. Kept for historical reference but no longer active. Move completed planning docs and old approaches here.

---

## 📖 Important Documents

**Current Session:**

- `SESSION_HANDOVER.md` - Start here for current state

**Standards:**

- `CODE_QUALITY.md` - Code standards and quality gates

**Architecture:**

- `architecture/README.md` - System architecture and decisions

---

## ⚠️ Important Conventions

### Documentation

- **`SESSION_HANDOVER.md` is always current** - Lives in `docs/` root, archived on session start
- **Old handovers go to `sessions/NNN/`** - Complete session folders with artifacts
- **This README stays static** - Minimal maintenance required
- **Link, don't duplicate** - Reference other docs instead of copying

### Temporary Files

- **System temp only** - Use system `/tmp/` for temporary files (NOT repo directories)
- **Prefix with `b_`** - All temp files must start with `b_` (e.g., `/tmp/b_analysis.md`, `/tmp/b_script.sh`)
- **Why:** Easy to identify agent-generated files vs system files
- **Applies to:** Analysis docs, scratch files, ad-hoc scripts, working notes
- **User may review later** - Temp files often contain valuable context

Examples:

```bash
# ✅ Good
/tmp/b_session_flow_analysis.md
/tmp/b_build_script.sh
/tmp/b_debug_output.txt

# ❌ Bad
/tmp/analysis.md
/tmp/script.sh
/tmp/output.txt
```

### File Organization

- **Active docs in architecture/** - ADRs, patterns, technical decisions
- **Historical records in sessions/** - Project progress over time
- **Deprecated in archive/** - Historical reference only

### Naming

- Session directories: `001/`, `002/`, `003/` (zero-padded) in `sessions/`
- Session handovers: `SESSION_HANDOVER.md` (always the same name, archived to session dirs)
- Architecture decisions: `NNN-kebab-case-title.md` in `architecture/decisions/`
- General docs: lowercase with hyphens `document-name.md`

---

## 🚀 Common Commands

### Development

```bash
# Install dependencies
pnpm install

# Start development (all apps)
just dev
# or: pnpm dev

# Start specific app
pnpm --filter @b/basic dev

# Build all packages and apps
just build
# or: pnpm build

# Type check
just typecheck

# Run tests
just test

# Run tests with coverage
just cover
```

### Quality Control

```bash
# Format code
just format

# Lint code
just lint

# Run all checks (format + lint + typecheck)
just check

# Clean all build artifacts and node_modules
just clean
```

### Documentation

```bash
# Read current session handover
cat docs/SESSION_HANDOVER.md

# View session history
ls -lt docs/sessions/

# View docs structure
tree -L 2 docs/

# View monorepo structure
tree -L 2 apps/ packages/
```

### Package Management

```bash
# Check for outdated packages (both package.json and catalog)
just deps-check

# Update all dependencies (package.json + catalog) with validation
just deps-upgrade

# Add runtime dependency to catalog (shared across apps/packages)
just deps-add lodash              # Latest version
just deps-add lodash ^4.17.21    # Specific version
# Then add to package.json: "lodash": "catalog:"

# Add dev dependency to root
pnpm add -Dw vitest

# Add dependency to specific package
pnpm --filter @b/basic add react-query

# Advanced: Update separately
just deps-update     # Update package.json only
just deps-catalog    # Update catalog only
```

---

## 🎯 Monorepo Concepts

### Workspaces

- **Apps (`apps/*`)**: Deployable applications, each can be independently developed and deployed
- **Packages (`packages/*`)**: Shared code used by apps and other packages
- **Workspace protocol**: `workspace:*` in package.json links to local packages

### Turborepo Features

- **Task pipelines**: Automatically run tasks in correct order based on dependencies
- **Caching**: Intelligent caching of build outputs for faster rebuilds
- **Parallel execution**: Run tasks across packages in parallel when possible
- **Remote caching**: Optional shared cache for teams (not enabled by default)

### Catalog (PNPM Feature)

- Centralized dependency version management in `pnpm-workspace.yaml`
- Use `catalog:` in package.json to reference catalog versions
- Ensures consistent versions across all packages

---

## 🎓 Context: What This Template Is

A production-ready turborepo monorepo template featuring:

- **Modern React stack** - React 19, TypeScript, Vite, TanStack Router
- **Shared packages** - Reusable components, configs, and utilities
- **Type safety** - End-to-end TypeScript with strict configs
- **Code quality** - Biome linting/formatting, pre-commit hooks
- **Professional DX** - Fast builds, hot reload, comprehensive tooling
- **Scalable architecture** - Add apps and packages as needed

**Perfect for:**

- Multi-app projects sharing common code
- Component libraries with example apps
- Micro-frontends architectures
- Teams needing consistent tooling across projects

---

**Ready to work? → Read `SESSION_HANDOVER.md` now! 🚀**
