# 📚 Agent Documentation

# IMPORTANT

READ EVERY LINE OF THIS DOCUMENT CAREFULLY BEFORE PROCEEDING
IT CONTAINS INFORMATION FOR HOW WE WILL WORK TOGETHER THROUGHOUT THE SESSION

**Start here**

---

## 📂 Documentation Structure

```
docs/
├── README.md              ← You are here
├── SESSION_HANDOVER.md    ← CURRENT state (always edit this)
├── CODE_QUALITY.md        ← Standards
├── sessions/              ← Archived sessions (001/, 002/, ...)
└── architecture/          ← Technical decisions (ADRs, patterns)
```

---

## 📝 Session Protocol

### Philosophy

Document **only this session**. Don't duplicate history. Link to previous sessions if needed.

### Starting a Session

**Step 1: Archive previous session**

```bash
# Find session numbers
PREV=$(find docs/sessions -maxdepth 1 -type d -name "[0-9]*" | wc -l | xargs)
NEXT=$((PREV + 1))
PREV_DIR="docs/sessions/$(printf "%03d" $PREV)"

# Create new session directory
mkdir -p "docs/sessions/$(printf "%03d" $NEXT)"

# Archive handover and git ref
mv docs/SESSION_HANDOVER.md "$PREV_DIR/"
git rev-parse HEAD > "$PREV_DIR/git-ref.txt"

# Archive any session artifacts
find docs/ -maxdepth 1 -name "*.md" \
  -not -name "README.md" \
  -not -name "CODE_QUALITY.md" \
  -exec mv {} "$PREV_DIR/" \;
```

**Step 2: Create new handover**

```bash
cat > docs/SESSION_HANDOVER.md << 'EOF'
# Session NNN: [Title]

**Date:** YYYY-MM-DD
**Focus:** [One line summary]

---

## ✅ Accomplished

- [What was done]

---

## 📊 Current State

**Working:**
- [Green checkmarks]

**Not working:**
- [Red issues/blockers]

---

## 🎯 Next Steps

1. [Priority 1]
2. [Priority 2]

---

## 💡 Key Decisions

- [Important choices made]
EOF
```

### During a Session

- Update `SESSION_HANDOVER.md` as you go
- Create analysis docs in session dir: `docs/sessions/NNN/*.md`
- Promote lasting docs immediately: `mv docs/sessions/NNN/ADR-*.md docs/architecture/decisions/`

### Ending a Session

Write a clear handover. The next agent will archive everything.

---

## 🏗️ Project Structure

```
b_values/
├── apps/basic/                    ← Playground app
├── packages/
│   ├── b_keywords/               ← CSS keyword enums
│   ├── b_types/                  ← Zod schemas
│   ├── b_units/                  ← Unit definitions
│   ├── b_parsers/                ← CSS → IR
│   ├── b_generators/             ← IR → CSS
│   ├── b_properties/             ← Property schemas
│   └── b_values/                 ← Umbrella package
├── docs/                          ← This directory
├── scripts/                       ← Build utilities
├── turbo.json                     ← Turborepo config
├── pnpm-workspace.yaml            ← PNPM workspace + catalog
└── justfile                       ← Task commands
```

**Tech Stack:** Turborepo, PNPM, TypeScript, React 19, TanStack Router, Vite, Biome, Lefthook, Changesets

**Project:** CSS value parsing/generation library. Pure functions. Bidirectional. Type-safe.

---

## 🚀 Commands

```bash
# Development
just dev                  # Start dev server
just build                # Production build
just typecheck            # Type check
just test                 # Run tests

# Quality (run before commit)
just check                # Format + lint + typecheck
just format               # Auto-fix formatting
just lint                 # Show lint issues

# Dependencies
just deps-add <pkg>       # Add to catalog
just deps-check           # Check outdated
just deps-upgrade         # Update all

# Documentation
cat docs/SESSION_HANDOVER.md     # Current state
ls -lt docs/sessions/            # Session history
```

---

## 📌 Key Conventions

**Imports:**

- Apps: use `@/` for cross-directory imports
- Packages: use `@b/package-name`
- Same directory: use relative `./`

**Exports:**

- Every directory has `index.ts` (barrel exports)
- `export *` pattern (no selective re-exports)
- Named exports only (no `default`)

**Temp files:**

- Use `/tmp/b_*` prefix for all temporary files
- Examples: `/tmp/b_analysis.md`, `/tmp/b_script.sh`

**Naming:**

- Sessions: `001/`, `002/` (zero-padded)
- ADRs: `NNN-kebab-case.md`
- General: `kebab-case.md`

**Dependencies:**

- Shared deps → catalog in `pnpm-workspace.yaml`
- Reference as `"pkg": "catalog:"` in package.json
- Use `just deps-add <pkg>` to add to catalog

---

## ⚠️ Non-Negotiables

See `CODE_QUALITY.md` for full standards. Key points:

- ❌ No `any` types
- ❌ No `@ts-ignore`
- ❌ No disabled lint rules without justification
- ❌ No unused imports/variables
- ❌ No committing broken builds
- ✅ All checks must pass: `just check && just build`

---

## 📖 Context

**b_values:** Production-ready CSS value parsing/generation library.

- 7-package structure (keywords → types → parsers/generators → properties → values)
- Pure data transformation (CSS ↔ IR)
- Type-safe with Zod schemas
- Tree-shakeable

**See `docs/sessions/001/` for architecture analysis.**

---

## 🚀 Quick Start

1. **Read `SESSION_HANDOVER.md`** - current state, blockers, next steps
2. **Read `CODE_QUALITY.md`** - non-negotiable standards
3. **Archive previous session** (commands below)
4. **Create new handover** (template below)
5. **Confirm plan** with user → begin

**→ Now read `SESSION_HANDOVER.md` for current state 🚀**
