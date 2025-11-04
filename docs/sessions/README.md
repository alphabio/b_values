# Session Handovers Archive

This directory contains archived session folders - each session is self-contained with its handover, git reference, and any artifacts created during that session.

---

## Structure

```
sessions/
├── 001/                              ← Session 001
│   ├── SESSION_HANDOVER.md          ← The handover
│   ├── git-ref.txt                  ← Commit SHA from this session
│   └── *.md                         ← Session artifacts
├── 002/
│   ├── SESSION_HANDOVER.md
│   ├── git-ref.txt
│   ├── BUG_ADVECTION.md            ← Bug found and fixed this session
│   └── PERFORMANCE_FIX.md          ← Performance work this session
├── 003/
│   ├── SESSION_HANDOVER.md
│   ├── git-ref.txt
│   └── ADR-001-decision.md         ← (Later promoted to architecture/)
└── ...
```

---

## Naming Convention

- **Format:** `NNN/` (directories, zero-padded: 001, 002, 003)
- **Sequential:** Always increment from the last number
- **Self-contained:** Each session folder contains everything from that session

---

## When to Archive

At the **start** of each new session:

```bash
# Find next session number
LAST=$(ls -1 docs/sessions/ | grep -E '^[0-9]+$' | sort -n | tail -1)
NEXT=$((LAST + 1))
NEXT=$(printf "%03d" $NEXT)

# Create session directory
mkdir -p docs/sessions/$NEXT

# Archive handover
mv docs/SESSION_HANDOVER.md docs/sessions/$NEXT/

# Capture git reference
git rev-parse HEAD > docs/sessions/$NEXT/git-ref.txt

# Archive session artifacts (docs created during session)
mv docs/BUG_*.md docs/sessions/$NEXT/ 2>/dev/null || true
mv docs/ANALYSIS_*.md docs/sessions/$NEXT/ 2>/dev/null || true
# Add patterns for your session docs
```

---

## Important Rules

1. **Archive at session START, not end** - ensures previous session's final state is preserved
2. **Never modify archived sessions** - they are immutable historical records
3. **Always use sequential numbers** - no gaps, no reuse
4. **Include git-ref.txt** - makes it easy to checkout code from that session
5. **Archive artifacts with session** - keeps related docs together

---

## What Are Session Artifacts?

Working documents created DURING a session:

- Bug analyses (`BUG_*.md`)
- Performance investigations (`PERFORMANCE_*.md`)
- Critical findings (`CRITICAL_*.md`)
- Implementation status (`*_STATUS.md`)
- Debug plans (`*_DEBUG.md`)
- Test plans (`TESTING_*.md`)

These get archived WITH the session folder, not left in docs root.

---

## Promoting Artifacts

If an artifact has lasting value beyond the session, promote it:

```bash
# Promote ADR to architecture
mv docs/sessions/003/ADR-001-state.md docs/architecture/decisions/

# Or reference it in handover if it stays with session
```

---

## Using git-ref.txt

To checkout code from a specific session:

```bash
# See what commit the session was at
cat docs/sessions/003/git-ref.txt

# Checkout that commit
git checkout $(cat docs/sessions/003/git-ref.txt)

# Or create a branch from it
git checkout -b explore-session-003 $(cat docs/sessions/003/git-ref.txt)
```

---

## Purpose

**For agents:** Complete snapshot of what happened in each session
**For teams:** Self-contained history with code reference
**For debugging:** Trace when changes were made with exact code state

**Philosophy:** Each session folder is a time capsule - handover + artifacts + git ref.

---

**Current session handover:** `../SESSION_HANDOVER.md` (one level up)
**Structure guide:** Copy structure from previous session handover
