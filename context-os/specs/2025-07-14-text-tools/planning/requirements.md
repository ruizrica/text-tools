# Text Tools — Requirements

**Date:** 2025-07-14
**Status:** Confirmed

---

## Architecture

- **Modular multi-file structure** with proper separation of concerns
- No file over 500 lines of code
- `index.html` — markup only
- `styles.css` — all styling
- `app.js` — main orchestration / UI logic
- `operations.js` — text operation functions (pure logic)
- No external dependencies, no build step

## Text Operations (All)

1. Remove extra spaces (collapse multiple to one)
2. Remove extra line breaks (collapse multiple blank lines)
3. Find and replace (plain text + regex toggle)
4. Trim whitespace (leading/trailing per line)
5. Remove all line breaks (flatten to single line)
6. Convert case — UPPER, lower, Title Case, camelCase
7. Sort lines — alphabetical, reverse, unique
8. Remove duplicate lines
9. URL encode / decode
10. Character / word / line count

## Layout

- **Dual-pane** with toggle between side-by-side and top/bottom
- Left (or top) = Original input
- Right (or bottom) = Result output
- Toggle button to switch layout orientation

## Toolbar

- Horizontal toolbar **above** the panes
- Icon buttons with tooltip labels
- Find-and-replace expands inline input bar when activated

## Diff Highlighting

- **Default:** show clean result
- **Toggle:** switch to diff view showing what changed
  - Removed characters/sections highlighted in a subtle red/accent
  - Added/changed areas in a complementary accent

## Pane Controls

- Copy to clipboard (per pane)
- Clear (per pane)
- Swap (move result back to original for chaining)

## Design

- Dark theme UI
- Blue accent shades (~#6B8AFF range)
- Elegant, modern aesthetic
- No emojis anywhere
- Mono-color icons only (SVG inline, single tone)
- No visual references provided — minimal dark utility tool aesthetic

## No Visual Assets Provided

Design from scratch using minimal dark utility aesthetic.
