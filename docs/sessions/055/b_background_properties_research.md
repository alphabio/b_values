# Background Properties Research

## Properties to Implement

### 1. background-attachment

**MDN:** https://developer.mozilla.org/en-US/docs/Web/CSS/background-attachment

- Syntax: `<attachment>#` where `<attachment> = scroll | fixed | local`
- Initial: `scroll`
- Inherited: `no`
- Multi-value: YES (comma-separated for layers)

**Examples:**

```css
background-attachment: scroll;
background-attachment: fixed;
background-attachment: local;
background-attachment: scroll, fixed;
background-attachment: fixed, local, scroll;
```

---

### 2. background-clip

**MDN:** https://developer.mozilla.org/en-US/docs/Web/CSS/background-clip

- Syntax: `<box>#` where `<box> = border-box | padding-box | content-box | text`
- Initial: `border-box`
- Inherited: `no`
- Multi-value: YES (comma-separated for layers)
- Note: `text` is experimental but widely supported

**Examples:**

```css
background-clip: border-box;
background-clip: padding-box;
background-clip: content-box;
background-clip: text;
background-clip: border-box, padding-box;
background-clip: padding-box, padding-box, border-box;
```

---

### 3. background-origin

**MDN:** https://developer.mozilla.org/en-US/docs/Web/CSS/background-origin

- Syntax: `<box>#` where `<box> = border-box | padding-box | content-box`
- Initial: `padding-box`
- Inherited: `no`
- Multi-value: YES (comma-separated for layers)
- Note: No `text` value (unlike clip)

**Examples:**

```css
background-origin: border-box;
background-origin: padding-box;
background-origin: content-box;
background-origin: padding-box, border-box;
```

---

### 4. background-repeat

**MDN:** https://developer.mozilla.org/en-US/docs/Web/CSS/background-repeat

- Syntax: `<repeat-style>#` where `<repeat-style> = repeat-x | repeat-y | [repeat | space | round | no-repeat]{1,2}`
- Initial: `repeat`
- Inherited: `no`
- Multi-value: YES (comma-separated for layers)
- Complex: Can have 1 or 2 keywords

**Examples:**

```css
background-repeat: repeat;
background-repeat: repeat-x;
background-repeat: repeat-y;
background-repeat: no-repeat;
background-repeat: repeat space;
background-repeat: repeat no-repeat;
background-repeat: round space;
background-repeat:
  no-repeat,
  repeat-x,
  repeat repeat;
```

---

### 5. background-size

**MDN:** https://developer.mozilla.org/en-US/docs/Web/CSS/background-size

- Syntax: `<bg-size>#` where `<bg-size> = [ <length-percentage [0,∞]> | auto ]{1,2} | cover | contain`
- Initial: `auto`
- Inherited: `no`
- Multi-value: YES (comma-separated for layers)
- Complex: Can have 1 or 2 values (width height)

**Examples:**

```css
background-size: auto;
background-size: cover;
background-size: contain;
background-size: 50%;
background-size: 100px;
background-size: 50% auto;
background-size: 100px 50px;
background-size: auto 100px;
background-size: cover, contain, 50%;
```

---

### 6. background-position

**MDN:** https://developer.mozilla.org/en-US/docs/Web/CSS/background-position

- Syntax: `<position>#`
- Initial: `0% 0%`
- Inherited: `no`
- Multi-value: YES (comma-separated for layers)
- Most complex: 1-4 value syntax with edge keywords

**Examples:**

```css
background-position: top;
background-position: bottom;
background-position: left;
background-position: right;
background-position: center;
background-position: 25% 75%;
background-position: 0 0;
background-position: 1cm 2cm;
background-position: 10ch 8em;
background-position:
  0 0,
  center;
background-position: bottom 10px right 20px;
background-position: right 3em bottom 10px;
background-position:
  top,
  center,
  bottom 10px;
```

**Position syntax (complex!):**

- 1-value: `<position-keyword> | <length-percentage>`
- 2-value: `<position-keyword> <position-keyword> | <length-percentage> <length-percentage>`
- 3-value: `<position-keyword> <length-percentage> <position-keyword>`
- 4-value: `<position-keyword> <length-percentage> <position-keyword> <length-percentage>`

Where `<position-keyword> = top | right | bottom | left | center`

---

## Implementation Order

### Phase 1: Simple Keywords (Quick Wins)

1. **background-attachment** - 3 keywords
2. **background-clip** - 4 keywords
3. **background-origin** - 3 keywords

### Phase 2: Keyword Combinations

4. **background-repeat** - 1-2 keywords combo

### Phase 3: Complex Values

5. **background-size** - Keywords + length/percentage (1-2 values)
6. **background-position** - MOST COMPLEX (use existing Position parser from @b/parsers)
