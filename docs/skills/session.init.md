# Skill: Initialize Session

**Command:** `new session`

**Purpose:** Start a new session, archiving previous if complete.

---

## Protocol

### Step 1: Check Previous Session Status

```bash
# Read SESSION_HANDOVER.md and extract status
cat docs/SESSION_HANDOVER.md | grep "^Status:"
```

**Decision tree:**

- **🟢 COMPLETE** → Proceed to Step 2 (archive)
- **🟡 IN-PROGRESS** → **STOP**: Report to user, continue in current session
- **🔴 BLOCKED** → **STOP**: Report to user, ask for guidance
- **No status marker** → **ASK USER**: "Previous session has no status. Archive anyway?"

---

### Step 2: Archive Previous Session (only if COMPLETE)

```bash
# Find session numbers
PREV=$(find docs/sessions -maxdepth 1 -type d | wc -l | xargs)
PREV=$((PREV + 1))
NEXT=$((PREV + 1))
PREV_DIR="docs/sessions/$(printf "%03d" $PREV)"
SESSION_DIR="docs/sessions/$(printf "%03d" $NEXT)"

# Create new session directory
mkdir -p "$SESSION_DIR"

# Archive handover and git ref
mv docs/SESSION_HANDOVER.md "$PREV_DIR/"
git rev-parse HEAD > "$PREV_DIR/git-ref.txt"

# Archive any session artifacts
find docs/ -maxdepth 1 -name "*.md" \
  -not -name "README.md" \
  -not -name "CODE_QUALITY.md" \
  -exec mv {} "$PREV_DIR/" \;
```

---

### Step 3: Create New Session Handover

```bash
cat > docs/SESSION_HANDOVER.md << 'EOF'
# Session NNN: [Title]

**Date:** YYYY-MM-DD
**Focus:** [One line summary]
**Status:** 🟡 IN-PROGRESS

---

## ✅ Accomplished

- Created session NNN

---

## 📊 Current State

**Working:**
- [To be determined]

**Not working:**
- [To be determined]

---

## 🎯 Next Steps

1. [Priority 1]
2. [Priority 2]

---

## 💡 Key Decisions

- [To be added as session progresses]
EOF
```

---

### Step 4: Confirm with User

Report:

- Session archived: `docs/sessions/NNN/`
- New session created: `NNN+1`
- Ready to begin

Ask: "What should we work on? / Offer suggestion based on previous session"

---

## Notes

- **Never archive IN-PROGRESS sessions without user consent**
- Always create status marker in new handover (defaults to IN-PROGRESS)
- Session artifacts in `docs/*.md` get archived automatically
- Git ref captured for traceability
