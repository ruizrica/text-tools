# Text Tools — Shaping Questions

---

### 1. Single HTML file with everything inlined?

I'm assuming this should be a fully self-contained single `.html` file — all CSS and JS inlined, no external dependencies, no build step. You paste text, manipulate it, copy results. Zero infrastructure.

_Default: Yes, single self-contained HTML file_

---

### 2. Text operations — which set?

Here's what I captured plus a few natural additions. Which of these do you want?

- **Remove extra spaces** — collapse multiple spaces to one
- **Remove extra line breaks** — collapse multiple blank lines to one
- **Find and replace** — targeted string replacement (plain text + regex option)
- **Trim whitespace** — remove leading/trailing whitespace per line
- **Remove all line breaks** — flatten to single line
- **Convert case** — UPPER, lower, Title Case, camelCase
- **Sort lines** — alphabetical, reverse, unique
- **Remove duplicate lines**
- **URL encode/decode**
- **Count** — characters, words, lines

_Default: All of the above — they're lightweight to add_

---

### 3. Dual-pane layout — side by side or top/bottom?

I'm assuming a left/right split: **Original** on the left, **Result** on the right. Both are read-write textareas. You paste into the left, apply operations, result appears on the right.

_Default: Side-by-side (left = original, right = result)_

---

### 4. Operation toolbar — where?

I'm assuming a clean toolbar strip between or above the two panes with icon buttons for each operation. Hovering shows a label tooltip. Find-and-replace would expand an inline input bar when activated.

_Default: Horizontal toolbar above the panes_

---

### 5. Diff highlighting?

Should the "after" pane highlight what changed (e.g., removed characters shown in red, changed areas in a subtle accent)? Or just show the clean result?

_Default: Show clean result only — keep it simple_

---

### 6. Copy / paste / clear controls?

I'm assuming each pane gets small utility buttons: **Copy to clipboard**, **Clear**, and a **Swap** button to move the result back to the original pane for chaining operations.

_Default: Yes — Copy, Clear, Swap_

---

### 7. Color accent for the dark theme?

The UI will be dark with mono-color (single tone) icons. What accent color for active states, selected tools, and highlights?

_Default: A cool blue-gray accent (like #6B8AFF)_

---

### 8. Any visual references?

If you have screenshots, mockups, or reference images of tools/UIs you like the look of, drop them into:
`context-os/specs/2025-07-14-text-tools/planning/visuals/`

_Default: None — I'll design based on minimal dark utility tool aesthetic_
