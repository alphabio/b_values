# Terminology Clarification

Let me start from scratch with concrete examples.

---

## CSS Anatomy

```css
.selector {
  background-image: linear-gradient(red, blue), url(img.png) !important;
  background-color: #556;
}
```

Breaking this down:

1. **Selector:** `.selector`
2. **Declaration Block:** Everything inside `{ }`
3. **Declaration:** `background-image: linear-gradient(red, blue), url(img.png) !important;`
   - Property name: `background-image`
   - Property value: `linear-gradient(red, blue), url(img.png)`
   - Important flag: `!important`
4. **Individual values:** `linear-gradient(red, blue)` and `url(img.png)`

---

## What b_values Does

### Level 1: Value Parsing ✅ (DONE)

Parse individual CSS values:

```ts
parseLength("10px")     → { value: 10, unit: "px" }
parseRgb("rgb(255, 0, 0)") → { kind: "rgb", r: 255, g: 0, b: 0, ... }
```

### Level 2: Property Value Parsing (TODO - THIS IS WHAT WE'RE BUILDING)

Parse the **value part** of a property (the stuff after the colon, before any !important):

```ts
// Input: just the values, comma-separated
"linear-gradient(red, blue), url(img.png), none"

// Output: array of parsed value IRs
{
  property: "background-image",
  values: [
    { kind: "linear-gradient", ... },
    { kind: "url", value: "img.png" },
    { kind: "keyword", value: "none" }
  ]
}
```

**Question: Does this include the property name in the input?**

Option A: Input is just values, we know it's background-image from context

```ts
parseBackgroundImage("linear-gradient(red, blue), url(img.png)");
```

Option B: Input includes property name

```ts
parseProperty("background-image: linear-gradient(red, blue), url(img.png)");
```

### Level 3: DeclarationList (FUTURE)

Parse multiple declarations:

```ts
"background-image: ...; background-color: #556; background-size: 80px";
```

### Level 4: Stylesheet (FUTURE)

Parse full stylesheet with selectors.

---

## My Confusion

I got confused about whether Level 2 includes:

- Just the values? `linear-gradient(...), url(...)`
- Or the full declaration? `background-image: linear-gradient(...), url(...)`
- Or with !important? `background-image: linear-gradient(...) !important`

**What's the correct scope for Level 2?**
