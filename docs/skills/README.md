# Skills Directory

**Skills are executable protocols that agents follow.**

---

## What is a Skill?

A skill is a markdown file that defines:

- **Command:** What user says to trigger it
- **Purpose:** What problem it solves
- **Protocol:** Step-by-step instructions for agent

---

## How Skills Work

1. **User issues command:** "continue session"
2. **Agent maps to file:** `session.continue.md`
3. **Agent reads protocol:** Loads instructions
4. **Agent executes:** Follows steps precisely

---

## Skill Naming Convention

```
{domain}.{action}.md
```

**Examples:**

- `session.continue.md` - Continue a session
- `session.init.md` - Initialize new session
- `code.refactor.md` - Refactor code (future)
- `docs.generate.md` - Generate docs (future)

---

## Core Session Skills

**Required for session management:**

| Skill                 | Command            | Purpose                               |
| --------------------- | ------------------ | ------------------------------------- |
| `session.continue.md` | `continue session` | Resume IN-PROGRESS work (most common) |
| `session.status.md`   | `check session`    | View current state                    |
| `session.update.md`   | `update session`   | Record progress                       |
| `session.end.md`      | `end session`      | Mark complete or pause                |
| `session.init.md`     | `new session`      | Archive & start fresh                 |

---

## Adding New Skills

1. **Create file:** `docs/skills/{domain}.{action}.md`
2. **Define protocol:** Use existing skills as template
3. **Document command:** First line should be clear trigger
4. **Test:** Have agent execute the skill

**No need to update `docs/README.md`** - skills are discovered automatically.

---

## Skill Template

```markdown
# Skill: {Name}

**Command:** `{trigger phrase}`

**Purpose:** {One line description}

---

## Use Case

{When/why to use this skill}

---

## Protocol

### Step 1: {First Action}

{Instructions}

### Step 2: {Next Action}

{Instructions}

---

## Notes

- {Important considerations}
- {Edge cases}
```

---

## Discovering Skills

**List all available skills:**

```bash
ls docs/skills/
```

**Read a specific skill:**

```bash
cat docs/skills/session.continue.md
```
