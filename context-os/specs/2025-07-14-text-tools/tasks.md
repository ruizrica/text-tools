# Text Tools — Implementation Tasks

## Wave 1: Foundation

- [ ] **T1: Create `operations.js`** — All 10 text operation functions as pure, tested exports
- [ ] **T2: Create `diff.js`** — Word-level diff algorithm, returns annotated segments for highlighting

## Wave 2: Structure & Style

- [ ] **T3: Create `index.html`** — Semantic markup: toolbar, dual panes, controls, find/replace bar
- [ ] **T4: Create `styles.css`** — Full dark theme, layout modes, toolbar styles, diff highlight classes, responsive breakpoints

## Wave 3: Interactivity

- [ ] **T5: Create `app.js`** — Wire toolbar buttons to operations, manage pane state, layout toggle, diff toggle, copy/clear/swap, localStorage persistence
- [ ] **T6: SVG icon set** — Inline SVG icons for all toolbar operations and pane controls (mono-color)

## Wave 4: Polish

- [ ] **T7: Integration test** — Open in browser, test all operations, verify diff view, layout toggle, responsive behavior
- [ ] **T8: Line count audit** — Verify no file exceeds 500 lines
