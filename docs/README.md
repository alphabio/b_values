# 📚 Agent Documentation

# IMPORTANT

READ EVERY LINE OF THIS DOCUMENT CAREFULLY BEFORE PROCEEDING
IT CONTAINS INFORMATION FOR HOW WE WILL WORK TOGETHER THROUGHOUT THE SESSION

**Start here**

---

## 📂 Documentation Structure

```
docs/
├── README.md              ← You are here (bootstrap)
├── CODE_QUALITY.md        ← Standards (bootstrap)
├── SESSION_HANDOVER.md    ← CURRENT state
├── skills/                ← Executable skills (on-demand)
├── sessions/              ← Archived sessions (001/, 002/, ...)
└── architecture/          ← Technical decisions (ADRs, patterns)
```

---

## 📝 Session Protocol

### Philosophy

**User-controlled sessions.** Agent never archives automatically.

### Bootstrap (Always Read First)

On every agent start:

1. Read `@docs/README.md` (this file)
2. Read `@docs/CODE_QUALITY.md`
3. Wait for user command

### Skills System

**Skills are executable protocols stored in `docs/skills/`.**

**How it works:**

1. User issues command (e.g., "continue session")
2. Agent maps command → skill file (e.g., `session.continue.md`)
3. Agent reads skill → executes protocol

**Discovering skills:**

```bash
ls docs/skills/
```

Each skill file defines:

- Command trigger
- Purpose
- Step-by-step protocol

**Common skill naming:**

- `session.*` - Session management
- `code.*` - Code operations (future)
- `docs.*` - Documentation (future)

### Session Status

Every `SESSION_HANDOVER.md` must include:

```markdown
**Status:** 🟢 COMPLETE | 🟡 IN-PROGRESS | 🔴 BLOCKED
```

- **🟢 COMPLETE**: Work done, ready to archive
- **🟡 IN-PROGRESS**: Active work, do not archive
- **🔴 BLOCKED**: Stuck, needs intervention

### Core Session Skills (Foundational)

These are hardcoded and always available:

**`continue session`** ⭐ Most common

- Resume IN-PROGRESS session (fresh CLI)
- Skill: `@docs/skills/session.continue.md`

**`check session`**

- View current state (read-only)
- Skill: `@docs/skills/session.status.md`

**`update session`**

- Record progress during work
- Skill: `@docs/skills/session.update.md`

**`end session`**

- Mark COMPLETE or IN-PROGRESS
- Skill: `@docs/skills/session.end.md`

**`new session`**

- Archive if COMPLETE, start fresh
- Skill: `@docs/skills/session.init.md`

### Skill Discovery

**To see all available skills:**

```bash
ls docs/skills/
```

**New skills can be added without updating README.** Agent discovers by:

1. User mentions skill name
2. Agent looks for `docs/skills/{name}.md`
3. Reads and executes if exists

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

- Don't use `/tmp/` use your session dir `$SESSION_DIR/*.md`

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

1. **Read `@docs/README.md`** (this file) - always first
2. **Read `@docs/CODE_QUALITY.md`** - non-negotiable standards
3. **Wait for user command** - user controls session flow

**Most common flow (token limit):**

1. Old agent: `end session` → marks IN-PROGRESS
2. New agent: `continue session` → picks up work

**→ User will tell you what to do next 🚀**

1. Old agent: `end session` → marks IN-PROGRESS
2. New agent: `continue session` → picks up where left off

**→ User will tell you what to do next 🚀**

**→ User will tell you what to do next 🚀**
