# Skill: Session Status Check

**Command:** `check session`

**Purpose:** Display current session state without modifications.

---

## Protocol

1. **Read `docs/SESSION_HANDOVER.md`**
2. **Parse and display:**
   - Session number and title
   - Status (COMPLETE/IN-PROGRESS/BLOCKED)
   - Date and focus
   - Accomplishments (summary)
   - Current state (working/not working)
   - Next steps

3. **Report to user in concise format**

---

## Output Format

```
📊 Session NNN: [Title]
Status: [🟢 COMPLETE | 🟡 IN-PROGRESS | 🔴 BLOCKED]
Date: YYYY-MM-DD
Focus: [One line]

✅ Accomplished: [count] items
🎯 Next: [top priority]
```

---

## Notes

- Read-only operation
- No file modifications
- No archiving
- Quick status check for orientation
