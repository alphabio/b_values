# Skill: End Session

**Command:** `end session`

**Purpose:** Mark session complete with clear handover for next agent.

---

## Protocol

### Step 1: Final Update

**Complete all sections of `SESSION_HANDOVER.md`:**

1. **✅ Accomplished**
   - Complete list of everything done
   - Include all merged changes
   - Note any commits/PRs

2. **📊 Current State**
   - Final state of the codebase
   - What's working (verified)
   - Outstanding issues (if any)
   - All tests passing? Build green?

3. **🎯 Next Steps**
   - Clear, prioritized list for next agent
   - Include context for each step
   - Link to relevant docs/issues

4. **💡 Key Decisions**
   - All architectural choices
   - Trade-offs made
   - Deferred decisions with rationale

---

### Step 2: Update Status

**Set status based on session outcome:**

```markdown
**Status:** 🟢 COMPLETE
```

**Or if blocked:**

```markdown
**Status:** 🔴 BLOCKED

**Blocker:** [Clear description of what's blocking progress]
**Tried:** [What approaches were attempted]
**Needs:** [What's needed to unblock]
```

---

### Step 3: Verify State

**Before marking complete, verify:**

```bash
# All changes committed?
git status

# Tests passing?
just test

# Build working?
just build

# Checks passing?
just check
```

**Document any failures in "Not working" section.**

---

### Step 4: Create Session Artifacts (if needed)

**Promote important documents:**

```bash
# Move ADRs to permanent location
mv docs/sessions/NNN/ADR-*.md docs/architecture/decisions/

# Create analysis docs if valuable
# Keep in session dir: docs/sessions/NNN/*.md
```

---

### Step 5: Final Summary to User

Report:

- Session NNN marked COMPLETE (or BLOCKED)
- Summary of accomplishments
- Clear next steps documented
- Ready for archival on next "new session"

---

## Notes

- **COMPLETE** = work done, ready to archive
- **BLOCKED** = can't proceed, needs intervention
- Clear handover is critical for next agent
- Don't leave the next agent guessing
- Document _why_ not just _what_
