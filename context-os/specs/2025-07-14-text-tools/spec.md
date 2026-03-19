# Spec: Text Tools

**Date:** 2025-07-14  
**Author:** Pi  
**Status:** Draft

---

## Goal

A lightweight, self-contained text manipulation utility served as a local web page. Users paste text into an input pane, apply operations from a toolbar, and instantly see results in an output pane — with the option to view a diff of what changed. The tool must feel like a refined developer utility: dark, fast, zero-dependency, and distraction-free.

---

## User Stories

1. **As a user**, I paste messy text into the input pane, click "Remove Extra Spaces", and immediately see clean text in the output pane so I can copy it.

2. **As a user**, I toggle diff view on the output pane to see exactly which characters were removed or changed, highlighted inline.

3. **As a user**, I click Swap to move my result back to the input pane so I can chain multiple operations (e.g., trim whitespace then sort lines).

4. **As a user**, I toggle between side-by-side and stacked layout depending on whether I'm working with wide or tall text.

5. **As a user**, I use Find and Replace with a regex pattern to do targeted text surgery across my pasted content.

---

## Requirements

### R1: Architecture — Modular Multi-File

| File | Responsibility | Max Lines |
|------|---------------|-----------|
| `index.html` | Markup structure, no inline styles/scripts | 500 |
| `styles.css` | All visual styling, dark theme, layout | 500 |
| `app.js` | UI orchestration, event binding, DOM updates | 500 |
| `operations.js` | Pure text transformation functions | 500 |
| `diff.js` | Diff computation and highlight rendering | 300 |

- Zero external dependencies
- No build step — open `index.html` in a browser and it works
- All icons are inline SVG, mono-color

### R2: Text Operations

All operations are pure functions in `operations.js`:

| # | Operation | Description |
|---|-----------|-------------|
| 1 | Remove extra spaces | Collapse 2+ consecutive spaces to 1 |
| 2 | Remove extra line breaks | Collapse 3+ consecutive newlines to 2 (one blank line) |
| 3 | Find and replace | Plain text or regex; supports case-insensitive flag |
| 4 | Trim whitespace | Strip leading/trailing whitespace from every line |
| 5 | Remove all line breaks | Join all lines into a single continuous line |
| 6 | Convert case | UPPER, lower, Title Case, camelCase sub-options |
| 7 | Sort lines | Alphabetical (A-Z), reverse (Z-A), natural sort |
| 8 | Remove duplicate lines | Preserve first occurrence, remove subsequent |
| 9 | URL encode / decode | Full encodeURIComponent / decodeURIComponent |
| 10 | Character / word / line count | Display stats in a small counter bar |

### R3: Dual-Pane Layout

- Two equal-size panes: **Original** (input) and **Result** (output)
- Default: side-by-side (left / right)
- Toggle button switches to stacked (top / bottom)
- Both panes are editable textareas
- Pane headers labeled "Original" and "Result"
- Layout preference persists via `localStorage`

### R4: Toolbar

- Positioned above the panes
- Each operation is an icon button with a tooltip label on hover
- Grouped logically: Whitespace | Case | Lines | Search | Stats
- Active/selected tool gets a subtle blue highlight state
- Find-and-replace: clicking the icon expands an inline bar with search input, replace input, regex toggle, case toggle, and apply button

### R5: Diff View

- A toggle button on the Result pane header: "Clean" / "Diff"
- Default state: Clean (shows plain result text)
- Diff state: renders inline diff highlighting
  - Removed text: subtle red background
  - Added/changed text: subtle blue/green background
- Diff computed using a simple line-by-line or word-by-word algorithm in `diff.js`

### R6: Pane Controls

Each pane header includes small icon buttons:

| Control | Behavior |
|---------|----------|
| Copy | Copy pane contents to clipboard; brief "Copied" feedback |
| Clear | Empty the pane |
| Swap | Move Result content into Original pane (for chaining) |

Swap button appears only between the two panes or in a shared control area.

### R7: Visual Design

- **Theme:** Dark background (#0D1117 range), lighter surface panels (#161B22)
- **Text:** Light gray (#C9D1D9) on dark surfaces
- **Accent:** Blue shades (#6B8AFF primary, #4A6BDF hover, #8BA3FF active)
- **Icons:** Inline SVG, single color (matches text color, accent on active)
- **Typography:** System monospace for textareas, system sans-serif for UI
- **Borders:** Subtle 1px borders (#21262D)
- **Radius:** 6px on panels, 4px on buttons
- **No emojis** anywhere in the UI
- **No multi-color icons** — everything single-tone
- **Transitions:** Subtle 150ms transitions on hover/active states

### R8: Responsive Behavior

- Minimum viable width: 768px
- Below 768px: auto-switch to stacked layout
- Textareas fill available space, minimum height 300px

---

## Visual Design

No visual references provided. Design language:

- Inspired by GitHub's dark mode and VS Code's editor aesthetic
- Clean flat surfaces with minimal borders
- High contrast text on dark backgrounds
- Tool buttons feel like a refined code editor toolbar
- Monospace text areas that feel like editing in a terminal

---

## Existing Code to Leverage

- No existing text tool utilities found in the codebase
- The viewer pattern from Pi's `show_file` / `show_plan` tools provides precedent for spawning local HTML pages, but this tool is standalone and does not integrate with the Pi tool system
- Built from scratch

---

## Out of Scope

- Backend / server — this is purely client-side
- File upload/download (may add later)
- Syntax highlighting of code
- Markdown preview
- Multi-tab / multi-document support
- Persistent history / undo stack beyond browser native
- Integration with Pi's tool system or Commander
- Mobile-first responsive design (desktop-first, functional at 768px+)
