# Skill: Continue Session

**Command:** `continue session`

**Purpose:** Resume work in existing IN-PROGRESS session (most common use case).

---

## Use Case

**Scenario:** Token limit approaching, need to switch to fresh CLI instance.

**Flow:**
1. Old agent: User says "end session" → marks IN-PROGRESS
2. New agent (fresh CLI): User says "continue session" → picks up where left off

---

## Protocol

### Step 1: Read Session Handover

```bash
cat docs/SESSION_HANDOVER.md
```

---

### Step 2: Check Status

**Expected status:** 🟡 IN-PROGRESS

**If status is:**
- **🟡 IN-PROGRESS** → Perfect, continue to Step 3
- **🟢 COMPLETE** → Report: "Session already complete. Use 'new session' to start fresh."
- **🔴 BLOCKED** → Report blocker details, ask user for guidance
- **Missing** → Warning: "No status marker. Assuming IN-PROGRESS."

---

### Step 3: Load Context

**Parse and internalize:**
- Session number and focus
- What's been accomplished
- Current state (working/blocked)
- Next steps (priorities)
- Key decisions made

---

### Step 4: Report to User

```
📊 Resuming Session NNN: [Title]
Status: 🟡 IN-PROGRESS
Date: YYYY-MM-DD

✅ Accomplished so far:
- [summary of key items]

🎯 Next priority:
1. [top item from Next Steps]

💡 Context:
- [key decisions user needs to know]

Ready to continue. What would you like me to work on?
```

---

### Step 5: Wait for Direction

User will either:
- Continue with next steps as planned
- Pivot to different priority
- Ask questions about current state

---

## Notes

- **No archiving** - work continues in same session
- **No new session created** - pick up exactly where left off
- **Most common command** - used when switching CLI instances mid-work
- Keep SESSION_HANDOVER.md status as IN-PROGRESS
- Update handover as work progresses (use `update session`)
