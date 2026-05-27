---
title: Viewer — Download as PDF (style-preserving, consistent layout)
type: feat
status: active
date: 2026-05-27
---

# ✨ Viewer — Download as PDF (style-preserving, consistent layout)

## Overview

Add a **Save as PDF** button to `viewer.html` that turns the live preview into a
PDF whose layout and styling match what the user sees, with sensible, repeatable
page formatting. No backend, no external library, no new third-party requests —
consistent with the site's privacy/no-build model.

> **Interpretation note (flag):** the trailing `/prompt-refinery` in the request
> looks like a stray slash-command, not a requirement. I'm treating the feature
> as: a polished, style-preserving PDF download for the viewer preview that
> produces a good, consistent layout. Correct me if `/prompt-refinery` was meant
> as scope.

## Problem Statement / Motivation

The viewer renders user code inside a **sandboxed iframe** (`sandbox="allow-scripts
allow-modals allow-forms allow-popups"`, deliberately **no** `allow-same-origin`)
via `srcdoc`. That isolation is the security backbone (see the live page:
`viewer.html` `render()` / `buildDoc()`), and it must not be weakened to add PDF
export.

Users want to save their rendered result as a PDF that *looks like the preview*.
Two naive routes fail against this sandbox:

1. **`html2canvas` / `jsPDF` from the parent** — the parent cannot read the
   iframe's DOM (opaque cross-origin → `contentDocument` access throws
   `SecurityError`; canvas would be tainted). `editor.html:6848` uses a
   canvas-capture trick, but only because *that* editor's preview iframe is
   **same-origin**. It does not transfer to the hardened viewer iframe.
2. **Printing the parent page** with `@media print` that hides the chrome — the
   browser tends to clip embedded iframes to their on-screen box and does **not**
   reliably paginate the iframe's full content across PDF pages.

## Proposed Solution

**In-iframe print bridge.** Trigger the browser's native print-to-PDF *from
inside the iframe*, so the iframe prints its own full document with its own CSS
and correct pagination.

1. Inject a tiny **print bridge** script into the assembled document in
   `buildDoc()`. It listens for `message` events and, on a validated
   `{ type: "hibot-print" }` message from `window.parent`, calls `window.print()`.
2. Add a **Save as PDF** button to the toolbar. On click it posts that message to
   `preview.contentWindow.postMessage({ type: "hibot-print" }, "*")`.
3. `window.print()` inside a sandboxed iframe is permitted because the sandbox
   already includes **`allow-modals`** (the token that gates `print`/`alert`/
   `confirm`). No sandbox change required — **verify this in a real browser
   before shipping** (see Acceptance Criteria).

This uses the real rendering engine, so layout/styling fidelity is exact and
multi-page content paginates correctly.

### Style preservation & layout consistency

Inject a small, **overridable** print stylesheet into the assembled document head
(before the user's `<style>`, so user rules win):

```html
<style id="hibot-print-defaults">
  @media print {
    html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @page { margin: 12mm; }
  }
</style>
```

- `print-color-adjust: exact` keeps user backgrounds/colors in the PDF (browsers
  drop backgrounds by default) — directly serves "style preserving".
- A default `@page` margin gives consistent, repeatable framing; user CSS can
  override `@page` if they want edge-to-edge.

Set the assembled document `<title>` (e.g. `Hi Bot Code — preview`) so the
browser's "Save as PDF" defaults to a sensible filename.

### Honest UX

Native print-to-PDF routes through the browser's print dialog; the user picks
"Save as PDF" as the destination. Label the control **"Save as PDF"** with a
tooltip: *"Opens your browser's print dialog — choose 'Save as PDF' as the
destination."* Do not imply a silent one-click `.pdf` download we can't deliver
without a heavy rasterizing library and worse fidelity.

## Technical Considerations

- **No sandbox weakening.** `allow-same-origin` stays off. The bridge is the only
  new capability, gated to messages whose `source === window.parent`.
- **postMessage hygiene.** Parent → iframe must use `targetOrigin: "*"` (the
  iframe origin is opaque, so a specific origin can't be used). On the iframe
  side, ignore any message where `event.source !== window.parent` or
  `event.data.type !== "hibot-print"`. Low risk (only triggers a print dialog),
  but worth gating.
- **No external dependency.** Pure DOM + native print. Preserves "no tracking, no
  external requests" (`index.html` feature card) and the no-build static model.
- **Reduced-motion / a11y.** Button matches existing `.tbtn` styling, has a
  `title`, is keyboard-reachable, and participates in the toolbar tab order.

## System-Wide Impact

- **Interaction graph:** click `#pdf` → parent `postMessage` → iframe bridge
  `message` handler → `window.print()` → browser print dialog. No persistence, no
  network, no shared state mutated.
- **Error propagation:** if `preview.contentWindow` is null (iframe not yet
  loaded) the click is a no-op; guard and optionally flash a hint. If a browser
  blocks print in-sandbox, fall back (below).
- **State lifecycle risks:** none — read-only over current editor content.
- **API surface parity:** `editor.html` has its own (same-origin) preview and
  export path; this change is scoped to `viewer.html` only. Do **not** retrofit
  `editor.html` here (separate surface, separate plan if wanted).
- **Integration scenarios:** (1) multi-page content paginates; (2) user
  background colors survive into PDF; (3) shared-link content prints the same as
  locally typed content; (4) empty editors print a blank page without error.

## Acceptance Criteria

- [ ] A **Save as PDF** button appears in the toolbar (`viewer.html`), styled as
      `.tbtn`, with a clarifying `title`.
- [ ] Clicking it opens the browser print dialog showing the **preview content
      only** (no nav/toolbar/editor chrome).
- [ ] User-defined background colors and styles are preserved in the print
      preview (verify `print-color-adjust: exact` takes effect).
- [ ] Multi-page content paginates across pages (no clipping to the on-screen
      iframe box).
- [ ] The assembled doc `<title>` produces a sensible default PDF filename.
- [ ] **Sandbox unchanged:** `allow-same-origin` still absent; iframe origin still
      opaque (re-confirm parent cannot read `contentDocument`).
- [ ] Print bridge ignores messages not of type `hibot-print` and not from
      `window.parent`.
- [ ] No new external requests, no new dependency, no console errors on the parent
      page.
- [ ] Verification performed in a real browser (print emulation), results
      reported.

## Verification Plan

Full print-to-PDF can't be fully automated, but most of it is checkable with the
`browse` skill against a local server:

- Wire-up: click `#pdf`, assert the iframe received the message and a print was
  requested (instrument the bridge to set a flag the test can read, or use CDP
  `Page.printToPDF` after emulating print media).
- Style/layout: `emulateMedia('print')` (or CDP `Emulation.setEmulatedMedia`) on
  the iframe document, screenshot, confirm chrome is gone and colors persist.
- Sandbox regression: re-run the existing isolation check (origin opaque, parent
  storage unreadable) to prove the bridge didn't loosen anything.
- Manual confirmation in Chrome/Safari/Firefox print dialog for the final fidelity
  check (note any per-browser quirks).

## Mock implementation sketch (for reference — do not build yet)

`viewer.html` — toolbar button (next to Share):

```html
<button class="tbtn" id="pdf" type="button"
  title="Opens your browser's print dialog — choose 'Save as PDF'">
  <!-- printer/download icon --> Save as PDF
</button>
```

`viewer.html` — `buildDoc()` head additions (print defaults + bridge):

```js
// prepended into <head>, before user <style>, so user rules win
'<title>Hi Bot Code — preview</title>' +
'<style id="hibot-print-defaults">@media print{' +
  'html{-webkit-print-color-adjust:exact;print-color-adjust:exact;}' +
  '@page{margin:12mm;}}</style>'

// appended near the existing error-catch <script> in the body
'window.addEventListener("message",function(e){' +
  'if(e.source!==window.parent)return;' +
  'if(e.data&&e.data.type==="hibot-print"){window.print();}});'
```

`viewer.html` — button handler:

```js
document.getElementById("pdf").addEventListener("click", function () {
  if (!preview.contentWindow) return;       // iframe not ready
  preview.contentWindow.postMessage({ type: "hibot-print" }, "*");
});
```

## Dependencies & Risks

- **Risk: `allow-modals` doesn't permit print in some browser.** Mitigation:
  verify early; fallback = open the assembled doc in a new tab via the existing
  `allow-popups` capability (blob/`document.write` window that prints itself).
  Decide fallback only if the primary path fails verification.
- **Risk: users expect a silent `.pdf` download.** Mitigation: honest label +
  tooltip. A true headless rasterizer (jsPDF/html2canvas) is explicitly rejected
  (cross-origin block + fidelity loss + ~1MB dep + privacy/no-dep ethos).
- **Risk: per-browser print fidelity differences.** Mitigation: keep injected
  print CSS minimal and overridable; document known quirks during verification.

## Out of scope (possible future polish)

- Page-size / orientation / margin picker UI.
- "Print just a selection" or fit-to-width scaling controls.
- PDF export from `editor.html` (different, same-origin surface).

## Sources & References

- Live implementation this builds on: `viewer.html` — `buildDoc()`, `render()`,
  sandboxed iframe (`#preview`), toolbar (`#share`, `#reset`, `#run`).
- Contrast / why canvas-capture won't port: `editor.html:6848` (same-origin
  preview capture).
- Privacy/no-dep constraint: `index.html` feature card "100% Private — No
  tracking, no cookies, no external requests"; `DESIGN-TOKENS.md`.
- Prior related plan: `docs/plans/2026-05-08-001-feat-byo-html-import-plan.md`
  (paste/import flow feeding the same editors).
