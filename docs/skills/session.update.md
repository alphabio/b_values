# Skill: Update Session

**Command:** `update session`

**Purpose:** Record progress, decisions, and state changes during active session.

---

## Protocol

### Step 1: Read Current Handover

```bash
cat docs/SESSION_HANDOVER.md
```

---

### Step 2: Update Sections

**Update these sections as appropriate:**

1. **✅ Accomplished**
   - Add completed tasks
   - Be specific and concise
   - Use bullet points

2. **📊 Current State**
   - Update "Working" (what's green)
   - Update "Not working" (blockers, issues)
   - Remove resolved items from "Not working"

3. **🎯 Next Steps**
   - Refine priorities based on progress
   - Remove completed steps
   - Add new priorities as they emerge

4. **💡 Key Decisions**
   - Document important choices made
   - Include rationale
   - Link to ADRs if created

---

### Step 3: Maintain Status

**Status should remain 🟡 IN-PROGRESS unless:**

- All work complete → use `end session` skill instead
- Blocked → update to 🔴 BLOCKED with explanation

---

### Step 4: Save and Confirm

- Save changes to `docs/SESSION_HANDOVER.md`
- Report brief summary to user
- No archiving occurs

---

## Update Frequency

**Update session:**

- After major milestones
- When making key decisions
- Before long breaks
- When changing focus areas
- At user request

---

## Notes

- Keep handover **current** - it's the source of truth
- Be concise but complete
- Focus on actionable information
- Document decisions with context
- Status remains IN-PROGRESS (use `end session` to mark complete)
