---
title: "feat: Editor UX pass 2 — preview toolbar density, Open in Viewer, shared nav theme"
type: feat
status: active
date: 2026-05-27
---

# Editor UX pass 2 — preview toolbar density, Open in Viewer, shared nav theme

Follow-up to the first-pass editor polish (viewer-aligned nav CTA, welcome banner, Editor ↔ Viewer cross-links). This plan covers three scoped improvements without removing any editor features.

## Overview

| Track | Goal |
|-------|------|
| **A. Preview toolbar** | Reduce visual clutter on desktop when ~12 controls share one bar |
| **B. Open in Viewer** | One-click handoff from editor → `viewer.html` with current HTML/CSS/JS |
| **C. Shared nav CSS** | Move site navigation styles into `assets/hibot-theme.css` so editor and viewer stay aligned |

**Stack:** Static HTML/CSS/JS in `hibot-code/` — no build step, no new npm deps. Primary files: `editor.html`, `viewer.html`, `assets/hibot-theme.css`.

## Problem Statement / Motivation

### A. Preview toolbar density

The preview card toolbar (`#previewCard .bar`, ~4390–4432 in `editor.html`) packs many controls on one row at ≥1200px:

- Label chip + muted helper (beginner)
- Mobile / Tablet / Desktop (desktop only)
- Device preset `<select>` (mobile/tablet widths)
- Frame, Fullscreen, Pop-out
- Zoom cluster (advanced)
- Refresh, Screenshot (advanced)
- Viewport dimensions chip

Existing mitigations (`flex-wrap: nowrap`, horizontal scroll, hide device select when breakpoint buttons show, hide spacer below 1320px) keep everything **accessible** but still feel busy on laptop/desktop — the “second pass” is about **hierarchy and grouping**, not removing capabilities.

### B. Open in Viewer

- **Viewer** is optimized for paste-first HTML/CSS/JS tabs and share links (`#code=` + base64 JSON in `viewer.html:252–272`, `402–408`).
- **Editor** uses a single full-document model plus optional split tabs (`parseHTMLIntoTabs` / `assembleTabs`, ~7936–7993) and **different** share format (`#v1:` compressed hash in editor share flow).
- Users who import or paste full HTML (see shipped [BYO import plan](2026-05-08-001-feat-byo-html-import-plan.md)) may want the **lighter Viewer studio** without manually re-pasting three panes.
- Today: static nav link to `viewer.html` only; no payload handoff.

### C. Duplicated nav CSS

- `assets/hibot-theme.css` is effectively empty (comment header only).
- **Editor** uses `.site-top-nav` + hamburger menu (`@media (max-width: 1040px)`, ~4103–4230).
- **Viewer** uses `.site-nav` with similar tokens but **no hamburger** — links hidden at `640px` with no toggle (~148–150).
- ~100+ other pages embed their own copy of `.site-top-nav` inline; this plan **scopes Phase C to editor + viewer first**, with a migration note for site-wide rollout later.

## Proposed Solution

### Track A — Preview toolbar (desktop hierarchy)

**Design direction (viewer-aligned):** Calm panel chrome, grouped actions, icon+tooltip where labels add width without clarity.

**Recommended layout (desktop ≥1200px):**

```
[ Your Website · hint ]  |  [Viewport ▾]  |  [Display ▾]  |  [Actions ▾]  |  [dimensions]
```

| Group | Controls | Notes |
|-------|----------|--------|
| **Viewport** | Mobile, Tablet, Desktop, device `<select>` (mutually exclusive per existing CSS) | Keep current breakpoint swap |
| **Display** | Frame, zoom controls | `advanced-only` unchanged |
| **Actions** | Fullscreen, Pop-out, Refresh, Screenshot | Refresh/Screenshot stay advanced |
| **Meta** | `#viewportDimensions` | Right-aligned chip |

**Implementation approach:**

1. **HTML:** Wrap existing buttons in `.preview-toolbar-group` containers with optional `.preview-toolbar-group-label` (visually hidden or micro-label on wide screens only).
2. **CSS:**  
   - Groups: `display: inline-flex; gap: 4px; align-items: center;`  
   - Subtle separators between groups (`border-left` + padding) instead of one long button strip  
   - Optional **“More” overflow** at `max-width: 1320px` for Actions only (if grouping alone is insufficient) — prefer grouping first
3. **Do not remove** any control IDs (`#btnMobile`, `#btnOpenPreview`, etc.) — QA and existing JS listeners depend on them.
4. **Beginner mode:** Preserve `body[data-mode="beginner"]` rules that hide advanced preview bar controls (~713, 880–892).
5. **Accessibility:** Keep `aria-label` / `data-tooltip` on every control; overflow menu must be keyboard-operable.

**Alternatives considered:**

| Approach | Verdict |
|----------|---------|
| Icon-only toolbar | Saves width but hurts beginner discoverability — use icons only inside overflow, not globally |
| Second row on desktop | Rejected — wastes vertical space in preview-first layout |
| Remove device presets | Rejected — user constraint: no feature removal |

### Track B — “Open in Viewer” (optional link / button)

**UX placement (pick one primary, one secondary):**

| Location | Rationale |
|----------|-----------|
| **Primary:** Preview bar, after Pop-out | Same mental model as “open preview elsewhere” |
| **Secondary:** Side panel near Share / Import | Discoverable for paste/import workflows |

Label: **Open in Viewer** (text) or **Viewer** with `title="Open current code in Viewer"`.

**Data handoff contract** — reuse viewer’s existing format (do not invent a third share scheme):

```javascript
// viewer.html — existing pattern
var url = location.origin + location.pathname + "#code=" + encodeURIComponent(encodeCode({
  html: "...", css: "...", js: "..."
}));
```

**Editor-side helper** `buildViewerHandoffUrl()`:

1. **If split tabs active** (`activeEditorTab !== 'full'`): read `htmlTA`, `cssTA`, `jsTA` values directly.
2. **If full HTML tab:** run extraction logic equivalent to `parseHTMLIntoTabs()` (~7936–7957) **without** switching UI or mutating tabs — extract into a local `{ html, css, js }` object.
3. **Encode** using the same `encodeCode` / `TextEncoder` + `btoa` approach as `viewer.html:253–258` (copy into editor or extract to shared asset — see Track C note).
4. **Navigate:** `window.open(viewerUrl, '_blank', 'noopener')` or `<a href="..." target="_blank" rel="noopener">` so editor state is preserved.

**Shared script (recommended):** Add `assets/hibot-share.js` (~30 lines) with `hibotEncodeViewerPayload(obj)` and `hibotDecodeViewerPayload(b64)` exported on `window`, included by both `viewer.html` and `editor.html` before inline scripts. Avoids duplicating Unicode-safe base64 logic.

**Guards:**

| Case | Behavior |
|------|----------|
| Empty / whitespace-only payload | Disable button or toast: “Add some code first” |
| Payload too large for URL | Mirror viewer share limits — toast with size hint; optional fallback: `sessionStorage` key + `viewer.html?from=editor&key=...` (defer unless needed) |
| User mid-edit, autorun off | Handoff uses **current** editor buffer (call `codeToPreview` sync if needed before read) |
| External `<script src>` in HTML | Viewer preview already runs inline JS only — document limitation in tooltip |

**Out of scope:** Bi-directional sync, replacing editor Share with viewer format, server-side transfer.

### Track C — Shared nav in `hibot-theme.css`

**Phase C1 (this plan):** Editor + viewer only.

1. **Tokens** in `hibot-theme.css` (if not already on page): `--nav-h`, `--accent`, `--border`, `--radius-sm`, `--font-display`, `--font-ui`, `--bg`, `--ink`, `--muted` — only variables both pages need for nav (pages already define full `:root`; theme file can define nav-specific aliases or document “load after page :root”).
2. **Unified selectors** — single rule block targeting both class names:

```css
/* assets/hibot-theme.css */
.site-top-nav,
.site-nav { /* shared sticky nav shell */ }

.site-top-nav .nav-logo,
.site-nav a.home-link { /* brand */ }

.site-top-nav .nav-links a,
.site-nav .nav-links > a { /* links */ }

.site-top-nav .nav-cta,
.site-nav .nav-cta { /* CTA */ }
```

3. **Mobile behavior:** Adopt **editor’s hamburger pattern** for viewer (`.site-nav-toggle` + `.nav-open`) so viewer is not worse at 640px. Markup change in `viewer.html` nav only.
4. **Remove** duplicated nav rules from inline `<style>` in `editor.html` and `viewer.html` after parity check.
5. **Safe-area / sticky / z-index:** Use `var(--z-sticky)` on editor; align viewer `z-index: 100` to same token in theme.

**Phase C2 (future):** Migrate `index.html`, `learn.html`, glossary templates — mechanical copy-paste reduction, separate PR to limit regression surface.

**Constraint:** Do not change nav link inventory or URLs in this pass unless fixing a clear bug.

## Technical Considerations

- **Monolithic files:** `editor.html` is ~20k lines — keep JS/CSS diffs localized; avoid drive-by refactors.
- **No new dependencies:** Grouping and handoff are HTML/CSS/JS only.
- **Security:** Viewer handoff is client-side only; no weakening of preview sandbox. Do not add `allow-same-origin` to editor preview iframe.
- **Performance:** `encodeCode` on large documents is synchronous — acceptable for click handler; show brief disabled state if > ~100KB.
- **Testing:** Manual matrix on `python3 -m http.server` in `hibot-code/` — desktop widths 1280 / 1440 / 1920, mobile 390, beginner vs advanced mode.

## System-Wide Impact

### Interaction graph

- **Toolbar grouping:** CSS/DOM only — no change to preview resize, device preset, or screenshot JS unless selectors change (mitigate with stable IDs).
- **Open in Viewer:** Click → read buffers → encode → `window.open` → viewer `load()` → `fromShareLink()` → `applySrc()` → `render()`. Does not write editor `localStorage`.
- **Theme extract:** CSS cascade only — load order: `fonts.css` → `hibot-theme.css` → page inline styles (page-specific overrides still win if needed).

### Error propagation

- Encode failures: try/catch → toast “Could not open Viewer” (malformed Unicode edge cases).
- `window.open` blocked: fallback copy link to clipboard (same as Share).

### State lifecycle risks

- Opening Viewer does not clear editor autosave — good.
- Viewer `#code=` hash cleared on edit in viewer — expected; editor tab unchanged.

### API surface parity

| Surface | Share format | Handoff |
|---------|--------------|---------|
| Editor Share | `#v1:` / `#v0:` | N/A |
| Viewer Share | `#code=` | Target format for Open in Viewer |
| Editor → Viewer | — | `#code=` only |

### Integration test scenarios (manual)

1. Full HTML document in editor → Open in Viewer → preview matches editor preview (modulo sandbox differences).
2. Split tabs (HTML/CSS/JS) with custom values → handoff preserves three panes.
3. Imported W3Schools-style paste (full doc) → Open in Viewer without re-import.
4. Desktop 1280px: all preview controls reachable (scroll or overflow).
5. Viewer nav at 800px width: hamburger opens links (after Track C).
6. Editor nav CTA + viewer nav CTA visually identical after theme extract.

## Implementation Phases

### Phase 1 — Preview toolbar density (Track A)

**Files:** `editor.html` (HTML + CSS in preview bar section)

**Tasks:**

- [ ] Add `.preview-toolbar-group` wrappers and group CSS
- [ ] Tune separators and spacing; verify horizontal scroll still works &lt;1320px
- [ ] Verify beginner/advanced visibility unchanged
- [ ] Screenshot before/after at 1440px desktop

**Success:** Toolbar reads as 3–4 zones, not 12 equal buttons; no control removed.

**Effort:** ~0.5–1 day

### Phase 2 — Open in Viewer (Track B)

**Files:** `assets/hibot-share.js` (new), `editor.html`, optionally `viewer.html` (swap inline encode to shared)

**Tasks:**

- [ ] Extract `encodeCode` / `decodeCode` to `hibot-share.js`
- [ ] Implement `getViewerPayloadFromEditor()` using split tabs or `parseHTMLIntoTabs` logic
- [ ] Add `#btnOpenInViewer` (or link) + handler with size guard + `window.open`
- [ ] Optional secondary affordance in side panel
- [ ] Manual test large payload / empty state

**Success:** One click opens Viewer with equivalent preview; link works for paste/import workflows.

**Effort:** ~0.5–1 day

### Phase 3 — Shared nav theme (Track C)

**Files:** `assets/hibot-theme.css`, `editor.html`, `viewer.html`

**Tasks:**

- [ ] Populate `hibot-theme.css` with unified nav rules (dual selectors)
- [ ] Add hamburger markup + toggle JS to `viewer.html` (match editor pattern)
- [ ] Delete redundant nav CSS from both inline stylesheets
- [ ] Visual diff: editor + viewer nav at 1200px, 900px, 400px

**Success:** Single source of truth for nav chrome on editor and viewer; mobile nav parity.

**Effort:** ~1 day

**Suggested order:** Phase 1 → 2 → 3 (user priority). Phase 3 can start in parallel if two contributors — no hard dependency except avoid editing the same nav block simultaneously.

## Acceptance Criteria

### Track A — Toolbar

- [ ] On viewport ≥1200px, preview controls are visually grouped (viewport / display / actions)
- [ ] All existing preview features remain available (device presets, frame, zoom, fullscreen, pop-out, refresh, screenshot)
- [ ] Beginner mode still hides advanced preview actions per current rules
- [ ] Keyboard focus order remains logical; no control-only-on-hover traps

### Track B — Open in Viewer

- [ ] “Open in Viewer” opens `viewer.html` in a new tab with current HTML/CSS/JS loaded
- [ ] Works from **full HTML** mode and **split tab** mode
- [ ] Empty project shows clear feedback (disabled or toast)
- [ ] Oversized payload fails gracefully (no silent broken tab)
- [ ] Does not change editor Share (`#v1:`) behavior

### Track C — Nav theme

- [ ] `hibot-theme.css` contains shared nav rules used by both `editor.html` and `viewer.html`
- [ ] Nav height, CTA style, link hover, and sticky behavior match between pages
- [ ] Viewer has usable mobile nav (not hidden-without-menu at 640px)
- [ ] No visual regression on editor nav CTA or Editor/Viewer link highlighting

### Quality gates

- [ ] Manual QA checklist above completed
- [ ] No new third-party network requests
- [ ] Changelog entry under `[Unreleased]` in `CHANGELOG.md` (if project convention)

## Success Metrics

- **Qualitative:** Preview bar feels “studio-grade” on desktop (internal dogfood / design review).
- **Handoff:** Import → edit → Open in Viewer flow completable in &lt;3 clicks after import.
- **Maintenance:** Future nav tweak requires editing one file (`hibot-theme.css`) for editor+viewer.

## Dependencies & Risks

| Risk | Mitigation |
|------|------------|
| URL length limits for handoff | Size guard + toast; defer sessionStorage bridge |
| Selector breakage in editor JS | Keep all `id=` attributes stable |
| Viewer mobile nav JS drift | Copy editor toggle script verbatim, minimal diff |
| Site-wide nav migration scope creep | Explicit Phase C2 deferral |
| `parseHTMLIntoTabs` mismatch for exotic HTML | Document same limitations as split-tab sync |

## Related Work

- First-pass editor polish (uncommitted): nav CTA, welcome banner, `viewer.html` link in editor nav
- [2026-05-08-001-feat-byo-html-import-plan.md](2026-05-08-001-feat-byo-html-import-plan.md) — import workflows benefit from Open in Viewer
- [2026-05-27-001-feat-viewer-pdf-export-plan.md](2026-05-27-001-feat-viewer-pdf-export-plan.md) — viewer toolbar patterns (`.tbtn`) as design reference
- `docs/brainstorms/2026-05-08-byo-html-import-requirements.md` — inbound HTML context (not origin for this plan)

## Sources & References

### Internal

- Preview bar markup: `hibot-code/editor.html` ~4390–4432
- Preview bar responsive CSS: `editor.html` ~415–447, 880–892
- Split / parse: `editor.html` `parseHTMLIntoTabs` ~7936–7957, `assembleTabs` ~7966–7993
- Viewer share/load: `viewer.html` ~252–282, 402–408
- Editor share: `editor.html` `#v1:` ~14802–14808, ~17176
- Nav CSS duplication: `editor.html` ~4103–4230; `viewer.html` ~52–62, 148–150
- Empty theme hook: `assets/hibot-theme.css`

### External

- [Stack Overflow: maximum URL length](https://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers) — practical ~2,000 character guidance for cross-browser GET/fragment handoffs
- [Simon Willard URL limits investigation](https://github.com/simonw/research/tree/main/url-limits-investigation) — modern engines tolerate much longer strings; still use conservative product limits

---

## Deepened research (2026-05-27)

Supplement from `/deepen-plan`: UI patterns, concrete snippets, size guards, and accessibility checklist.

### Track A — Toolbar: recommended DOM sketch

Keep every existing `id` on its control. Only add wrappers:

```html
<!-- editor.html — inside #previewCard .bar (conceptual) -->
<div class="preview-toolbar-group preview-toolbar-group--viewport" role="group" aria-label="Viewport size">
  <!-- btnMobile, btnTablet, btnDesktop, deviceSelector unchanged -->
</div>
<div class="preview-toolbar-group preview-toolbar-group--display" role="group" aria-label="Preview display">
  <!-- btnToggleFrame, preview-zoom-controls unchanged -->
</div>
<div class="preview-toolbar-group preview-toolbar-group--actions" role="group" aria-label="Preview actions">
  <!-- btnFullscreen, btnOpenPreview, btnRefreshPreview, btnScreenshot unchanged -->
</div>
```

**CSS additions** (after existing `.preview-wrap .bar` rules):

```css
.preview-toolbar-group {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.preview-toolbar-group + .preview-toolbar-group {
  margin-left: 4px;
  padding-left: 8px;
  border-left: 1px solid var(--border);
}
@media (max-width: 1320px) {
  .preview-toolbar-group + .preview-toolbar-group {
    border-left: none; /* avoid visual noise when bar scrolls */
    padding-left: 0;
    margin-left: 2px;
  }
}
```

**Overflow fallback (only if grouping insufficient at 1280px):** Add `#btnPreviewMore` + `<details class="preview-more-menu">` or a tiny `popover` polyfill-free pattern:

```html
<details class="preview-more-menu advanced-only">
  <summary class="btn small" aria-label="More preview actions">More</summary>
  <div class="preview-more-panel" role="menu">
    <!-- move Refresh, Screenshot, Frame here on max-width: 1280px via CSS order/display -->
  </div>
</details>
```

Native `<details>` avoids new JS for a first ship; ensure `summary` is keyboard-focusable and panel closes on Escape (optional one-liner `keydown` listener).

**Design reference:** Viewer studio toolbar (`viewer.html` `.toolbar` / `.tbtn`) — fewer labeled buttons, more whitespace; editor preview bar should feel closer to that density without dropping labels on primary viewport controls.

### Track B — `assets/hibot-share.js` sketch

```javascript
// assets/hibot-share.js — no dependencies, loaded before page inline scripts
(function (global) {
  function encodeCode(obj) {
    var bytes = new TextEncoder().encode(JSON.stringify(obj));
    var bin = "";
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  function decodeCode(b64) {
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return JSON.parse(new TextDecoder().decode(bytes));
  }
  function buildViewerUrl(originPath, payload) {
    var encoded = encodeURIComponent(encodeCode(payload));
    return originPath + "#code=" + encoded;
  }
  global.hibotShare = { encodeCode: encodeCode, decodeCode: decodeCode, buildViewerUrl: buildViewerUrl };
})(typeof window !== "undefined" ? window : globalThis);
```

**Editor handler sketch:**

```javascript
function getViewerPayloadFromEditor() {
  if (activeEditorTab !== "full") {
    return {
      html: htmlTA ? htmlTA.value : "",
      css: cssTA ? cssTA.value : "",
      js: jsTA ? jsTA.value : ""
    };
  }
  var src = getCode();
  // Inline extract (same regexes as parseHTMLIntoTabs) — do not mutate split TAs
  var styleMatch = src.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  var scriptMatches = [...src.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
  var bodyMatch = src.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  var bodyContent = bodyMatch ? bodyMatch[1] : src;
  bodyContent = bodyContent.replace(/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/gi, "").trim();
  return {
    html: bodyContent,
    css: styleMatch ? styleMatch[1].trim() : "",
    js: scriptMatches.length ? scriptMatches[scriptMatches.length - 1][1] : ""
  };
}

function openInViewer() {
  var payload = getViewerPayloadFromEditor();
  if (!String(payload.html || "").trim() && !String(payload.css || "").trim() && !String(payload.js || "").trim()) {
    showToast("Add some code before opening Viewer");
    return;
  }
  var url = hibotShare.buildViewerUrl(location.origin + "/viewer.html", payload);
  if (url.length > 180000) { // ~150KB raw JSON + base64 overhead — align with editor share warnings
    showToast("Project is too large to open in Viewer via link. Try Share or trim code.");
    return;
  }
  var w = window.open(url, "_blank", "noopener,noreferrer");
  if (!w) {
    copyToClipboard(url); // reuse existing share clipboard helper if present
    showToast("Popup blocked — Viewer link copied to clipboard");
  }
}
```

**Size guard rationale:** Fragment is not sent to the server, so Apache/Nginx line limits rarely apply; the real risks are clipboard UX, `window.open` failures, and memory. Product limit **~180k characters total URL** (conservative vs Chromium ~2MB) matches existing editor share commentary near `#v1:` compression. Log `url.length` in dev-only if tuning needed.

**Viewer migration:** Replace inline `encodeCode`/`decodeCode` in `viewer.html` with `hibotShare.*` to prevent drift.

### Track C — Nav: viewer hamburger markup

Align viewer with editor (`editor.html` uses `.site-top-nav` + `.site-nav-toggle`). Minimal viewer nav change:

```html
<nav class="site-nav" aria-label="Site navigation">
  <!-- existing logo + divider + nav-links -->
  <button type="button" class="site-nav-toggle" aria-expanded="false" aria-controls="viewer-nav-links" hidden>
    <span class="sr-only">Menu</span>
    ☰
  </button>
  <a href="editor.html" class="nav-cta">Open full Editor →</a>
</nav>
```

- Move `id="viewer-nav-links"` onto `.nav-links` for `aria-controls`.
- Reuse editor’s toggle script pattern (grep `site-nav-toggle` in `editor.html` for listener).
- In `hibot-theme.css`, `@media (max-width: 1040px)` block mirrors editor: hide inline links, show toggle, dropdown panel.

**Token note:** Both pages already define `:root` tokens inline. Phase C should **not** duplicate full `:root` into theme — only nav-specific rules. Optional comment in `hibot-theme.css`:

```css
/* Requires page :root: --nav-h, --accent, --border, --bg, --ink, --muted, --font-display, --font-ui, --radius-sm, --z-sticky */
```

### Accessibility checklist (all tracks)

| Check | Track |
|-------|--------|
| `role="group"` + `aria-label` on toolbar groups | A |
| All icon-only controls retain `aria-label` | A |
| `details`/`summary` More menu: focus trap not required; Escape closes | A |
| `Open in Viewer` is `<button type="button">` or link with explicit accessible name | B |
| Nav toggle: `aria-expanded` toggles with `.nav-open` on `<nav>` | C |
| `prefers-reduced-motion` unchanged on new transitions | A/C |

### SpecFlow edge cases (added)

| Flow | Expected |
|------|----------|
| User on **Full HTML** with only `<body>` snippet (no `<style>`/`<script>`) | Handoff sends body as `html`, empty css/js |
| User switches to split tabs, edits CSS only, returns to Full without assemble | Handoff from Full uses `getCode()` — document that split edits must assemble first OR handoff reads split when `activeEditorTab !== 'full'` |
| **Beginner mode** + Open in Viewer | Button visible (viewer is friendly for paste workflows); hide only if product says otherwise |
| Viewer opened, user hits Share | Viewer re-encodes same `#code=` format — round-trip compatible |
| **Pop-up blocker** | Clipboard fallback + toast |
| Nav theme deploy | Hard-refresh both pages; compare CTA hover `#e19412` on both |

### Performance notes

- `encodeCode` on 100KB document: typically &lt;50ms on modern hardware — acceptable for click handler; set `btn.disabled = true` for 200ms to prevent double-open.
- Moving nav CSS to external file: **one extra HTTP request** but cacheable (`hibot-theme.css` already linked on both pages — no new request).

### Review highlights (consolidated)

- **architecture-strategist:** Phase C scoped to editor+viewer only — correct boundary; avoid boiling the ocean on 100+ glossary pages.
- **code-simplicity-reviewer:** Prefer `<details>` overflow over custom dropdown JS; shared `hibot-share.js` over copy-paste encode.
- **security-sentinel:** Handoff is client-side only; no sandbox changes; warn on `javascript:` URLs only if existing sanitizer already does.
- **agent-native-reviewer:** Add `data-testid` optional hooks: `preview-toolbar-viewport`, `btn-open-in-viewer` for future automation.

### Updated effort (deepened)

| Phase | Estimate |
|-------|----------|
| A — Toolbar grouping | 4–6h |
| B — Open in Viewer + shared encode | 4–6h |
| C — Nav theme + viewer hamburger | 6–8h |
| QA matrix | 2h |
| **Total** | ~2–2.5 days |
