# 📝 Changelog

Canonical version lives in [`VERSION`](VERSION); the service worker
(`sw.js`) cache key must match it on every release.

## Unreleased

- **Content (cross-link sweep):** Six AI-cluster sibling pages now link to the new `ai-build-stack.html` in both their nav and footer — `ai-coding-landscape-2026.html`, `cursor-slack-github.html`, `get-started-coding.html`, `how-backends-work-vercel-railway.html`, `ai-roi-calculator.html`, `pull-requests-github.html`. The page is now reachable from every adjacent AI/dev-tooling page, not just `index.html`.
- **PWA:** `VERSION` and `sw.js` `CACHE_NAME` bumped to `2.13.4` / `bws-v2.13.4` so returning PWA users get the cross-linked nav/footers on activate.
- **Content:** New **AI Build Stack** showcase page (`ai-build-stack.html`) — an opinionated single-thesis landing for the 2026 stack: Cursor (referral CTA), Vercel + AI Gateway, Claude Sonnet 4.6, Neon via Vercel Marketplace, GitHub, Railway when you need it. Includes anti-patterns block, the loop, and FTC affiliate disclosure (Cursor + Railway). Linked from the Resources flyout and footer in `index.html`. Added to `sitemap.xml`.
- **PWA:** `VERSION` and `sw.js` `CACHE_NAME` bumped to `2.13.3` / `bws-v2.13.3`; `/ai-build-stack.html` added to `CORE_ASSETS`.
- **Editor:** **Import HTML** — side-panel button opens a modal to paste a full document or choose a `.html` / `.htm` file (Tryit-style workflow). Respects the same size guard as share links (~400 KB). Asks before replacing unsaved edits vs the session baseline. Initial load now `await`s shared URL decode so hash shares apply before the default template runs.

## Version 2.13.5 — Brand chrome, default OG, editor typography (May 2026)

- **Brand / favicon:** `favicon.svg` uses canonical near-black `#0A0A0A`, amber hairline frame, and monospace `</>` mark with amber gradient — aligned with `DESIGN-TOKENS.md`.
- **Editor (typography):** Slightly larger UI rhythm (`--text-body` 17px, `--leading-body` 1.62, caption/ui-sm bumps, CodeMirror mono 14px / 1.75); corrected misleading `--accent` comment.
- **Social (default card):** `get-started-coding-og.png` regenerated at 1200×630 with amber-on-charcoal art and self-hosted Outfit + DM Sans; reproducible via `scripts/og-default-brand.html` + headless Chrome screenshot.
- **SEO:** `learn-tier-6.html` adds `twitter:*` parity, `og:image` width/height/alt.
- **PWA:** `VERSION` and `sw.js` `CACHE_NAME` bumped to `2.13.5` / `bws-v2.13.5`; `index.html` and `editor.html` favicon query strings aligned to `2.13.5`.

## Version 2.13.2 — World-class color contrast (May 2026)

- **Editor (preview):** `buildHTML` now runs every palette through `prepareContrastTokens` — body/link/accent text ≥4.5:1 on background, CTA labels pick white or dark dynamically with ≥4.5:1 on the button fill. Custom templates get contextual `{{accentColor}}` substitution (text vs fill) and inline white-on-accent fixes.
- **Editor (fallback demo):** H2 uses ink with an accent underline instead of raw accent-on-bg; CTA uses `--cta-fg` / `--cta-bg` CSS variables.
- **Palettes:** Darkened failing legacy presets (mint, coffee, coral, ocean, sunset, forest, lavender, barbie) and tuned bundles (Studio, Chalkboard, Newsprint, Meadow) so source tokens meet large-text contrast before runtime nudge.
- **CI:** `scripts/contrast.mjs` + `scripts/contrast-audit.mjs` run in deploy workflow; fails the build if any preset or bundle misses WCAG AA after contrast prep.
- **PWA:** `VERSION` and `sw.js` `CACHE_NAME` bumped to `2.13.2` / `bws-v2.13.2`.
- **Editor (design craft):** Shared tokens for body size, line-height, caption scale, and app/sidebar spacing (`--app-pad`, `--app-gap`, `--sidebar-cap`); fluid padding/gap; sidebar column scales up to 420px on wide viewports; safe-area insets on the shell nav and main grid; welcome headline uses `clamp()`; panel section labels are clearer (uppercase 14px tracks); step labels, bundle hints, and help text bumped to readable caption size with consistent line-height.
- **Editor (responsive):** Preview and panel toolbars use a single horizontal scroll row (`flex-wrap: nowrap` + `overflow-x: auto`) so control labels (e.g. Pop-out, Fullscreen) never letter-wrap; mid-width layout drops multi-row flex-wrap in favor of scroll; mobile-only multi-line button text is limited to `.row` stacks; mode toggle uses scroll + `flex: 0 0 auto` and reserves right padding for the mobile quick-action FAB so Pro Mode is not covered.

## Version 2.13.1 — Mobile toast rail + preview CTA contrast (May 2026)

- **Editor (mobile UX):** Toasts anchor to the **top** safe area on viewports ≤768px so transient messages (e.g. beginner mode switch) no longer cover the live preview or Quick Start card. Entry/exit animations slide from above on mobile only.
- **Editor (preview demo):** Default template CTA uses **white** text with a light shadow so label contrast holds when users pick blue or other saturated accent presets.
- **PWA:** `VERSION` and `sw.js` `CACHE_NAME` bumped to `2.13.1` / `bws-v2.13.1`.

## Version 2.13.0 — Anti-slop color bundles (April 2026)

- **Editor:** New `.color-bundle-grid` at the top of the "3. Pick Your Colors" panel ships seven curated 3-color palettes — Editorial, Studio, Library, Chalkboard, Newsprint, Meadow, Memo — each with an inline one-sentence rationale that names the design principle it teaches. Every bundle is built around the single-accent principle (bg/ink/accent only; border and shadow untouched) and clears WCAG-AA body-text contrast (4.5:1) for ink-on-bg. Newsprint's accent lands at ~4.2:1 intentionally — "single pop of red," not body-text safe — and the rationale flags it.
- **Editor:** `applyColorBundle(id)` writes state in one round through the existing `stateToPanel → stateToCode → codeToPreview` chain, mirroring the legacy `colorPreset` select handler. Click the card; the whole page updates.
- **Editor:** Bundle choice persisted in `localStorage['colorBundleId']`. A `#currentBundleIndicator` reads "Using **Editorial**." when the state matches the bundle's pristine palette and flips to "Based on **Editorial** (modified)." the moment the user tweaks any of bg/ink/accent. Hidden when no bundle id is stored or the stored id isn't known. Provenance display only — the bundle is never auto-re-applied on load.
- **Editor:** Legacy `colorPreset` dropdown and individual color pickers are untouched. Bundles augment, they don't replace.

## Version 2.12.0 — Launch essay (April 2026)

- **New:** `/why-i-built-this.html` — a 2,400-word first-person essay on why this tool exists, what it deliberately doesn't do, and what happened with the friend whose VS Code install failed. Positioned at the adult self-learner ICP named in the mega-eval. Footer link added to `index.html`. Added to `sitemap.xml` and `sw.js` `CORE_ASSETS`. Service worker cache bumped to `bws-v2.12.0`.

## Version 2.11.0 — Launch-Ready Sprint (April 2026)

- **Repo hygiene:** Added `LICENSE` (MIT, Expat form) at the repo root; replaced the vague "free to use, modify, distribute" language in README. Archived 39 development-artifact notes (`FIX_*`, `TEST_REPORT_v*`, `DEPLOY_v*`, `USABILITY_*`, `IMPLEMENTATION_*`, etc.) under `docs/archive/`; added `CONTRIBUTING.md` at the root covering local-dev, where-docs-live, showcase submission, and the localStorage keys the site writes.
- **Challenges track:** New `/challenges/` hub + five per-challenge landing pages (`colors.html`, `button.html`, `card.html`, `hover.html`, `responsive.html`) — one crawlable URL per challenge, each with objective, "how the editor knows you're done," a starting snippet, and an `Open in editor →` deep link. Hub lists the three capstone challenges as bonus track.
- **Editor:** Per-core-challenge completion tracked in `localStorage.completedCoreChallenges` (array of `challenge1`…`challenge5`). Challenge panel shows a persistent "`N` of 5 core challenges complete" badge once the user has finished at least one. A `bws:completedCoreChallengesChanged` CustomEvent lets the challenges pages repaint progress without a reload.
- **Site nav:** "Challenges" promoted to a top-level nav link across every main page (17 root HTML files) and regenerated for all 74 glossary subpages.
- **SEO / PWA:** Six new URLs added to `sitemap.xml` with today's `<lastmod>` and to `sw.js`'s `CORE_ASSETS`. Service worker cache bumped from `bws-v2.10.0` to `bws-v2.11.0` so clients evict the old cache on activate.

## Version 2.10.0 — Trust & Safety Sprint (April 2026)

- **Privacy (all pages):** Self-host Outfit + DM Sans + Noto Sans Georgian + DM Serif Display + JetBrains Mono under `/assets/fonts/`. Removes every `fonts.googleapis.com` / `fonts.gstatic.com` reference across 7 HTML files so the "no external requests" claim is true in the markup. Editor CSP tightened to drop the matching Google allowances.
- **Security (editor):** Preview iframe now runs in an opaque origin — `sandbox="allow-forms allow-popups allow-scripts"` (was `allow-forms allow-popups allow-same-origin allow-scripts`). The previous combination voided sandbox isolation, letting user-authored preview code reach the editor's own `localStorage`. Pop-out preview modal now uses `srcdoc` + the same sandbox. Screenshot feature re-routed to serialize from `codeTA.value` instead of reading the iframe's now-opaque `contentDocument`.
- **Compliance (`learn-to-code-age-12.html`):** Above-the-fold parents' notice added ahead of the April 22, 2026 COPPA compliance deadline. Names every third-party export target (CodePen, JSFiddle, Replit, CodeSandbox, Glitch, Carrd, Webflow, Softr, GitHub Gist). Static HTML, no consent banner, no cookie — the notice itself doesn't track.
- **Versioning:** Added canonical `VERSION` file at repo root. Service worker cache bumped from `bws-v2.9.2` to `bws-v2.10.0` so existing users' caches evict on activate.

## Unreleased (pre-2.10)

- **Landing (`index.html`):** WebApplication JSON-LD, aligned Twitter description with OG/privacy claims, stronger high-contrast tokens, service worker registration for offline/repeat visits.
- **Showcase:** Hero copy aligned with GitHub submission flow; template preview cards use self-contained CSS mockups (no broken `img/` dependencies).
- **PWA:** Service worker cache bumped to `bws-v2.9.2` (CLI Directory data + editor updates).
- **Editor:** First-run strip for beginner mode after share URL load finishes (`hasSeenEditorWelcome` + Learn link); template validation scans `htmlContent` / `customCSS` / `customHTML` and stricter JSON import checks; `scrollIntoView` respects `prefers-reduced-motion`.
- **Editor:** **CLI Directory** — Learning Tools → offline bundled reference (`cli-reference-data.js`): topic tree for OS → cloud, filter, stub sections with clear “Coming soon,” sample `pwd` / `ls` entries under OS → Navigation & files; wide modal with TOC + detail (`cliReference.show()`).
- **Editor:** **CLI Directory Phase 3–4** — Expanded content: OS streams (`grep`, `tail`, `curl`, `jq`), Git daily workflow, Node (`npm`/`npx`/pnpm-yarn note), Vite (`dev`/`build`/`preview`). Editorial block comment in data file. Responsive TOC/detail stack (narrow viewports), `createWideModal` teardown + focus return to **CLI Directory** button (`#btnCliReference`).

## Version 2.0.0 - Major Educational & Export Enhancement (October 12, 2025)

### 🎉 Major New Features

#### 🚀 Export & Deployment (8 new export options!)
- ✨ **NEW:** Replit export with auto-copy
- ✨ **NEW:** CodeSandbox export with project structure
- ✨ **NEW:** Glitch remix export
- ✨ **NEW:** Carrd.co export with step-by-step instructions
- ✨ **NEW:** Webflow export with CSS/HTML separation
- ✨ **NEW:** Softr export with custom code formatting
- ✨ **NEW:** GitHub Gist integration
- ✅ Enhanced: CodePen export (added achievement tracking)
- ✅ Enhanced: JSFiddle export (added achievement tracking)

#### 🎓 Educational Features
- ✨ **NEW:** Interactive Challenge System (5 progressive challenges)
  - Challenge 1: Change 3 Colors
  - Challenge 2: Add a Button
  - Challenge 3: Create a Card
  - Challenge 4: Add Hover Effects
  - Challenge 5: Make it Responsive
- ✨ **NEW:** Achievement/Badge System (6 unlockable achievements)
  - ✏️ First Edit
  - 🎨 Color Master
  - 📤 Code Exporter
  - 💅 CSS Stylist
  - 🎯 Template Pro
  - 🌟 Challenge Complete
- ✨ **NEW:** Learning Hints Toggle (adds educational comments to code)
- ✨ **NEW:** Progress tracking with localStorage persistence

#### 📐 Layout & Productivity
- ✨ **NEW:** CSS Grid layout helper
- ✨ **NEW:** Flexbox layout helper
- ✨ **NEW:** 2-Column responsive layout helper
- ✨ **NEW:** Card component helper

#### 🎨 User Interface
- ✨ **NEW:** "📦 Export for Platforms" section in sidebar
- ✨ **NEW:** "📐 Layout Helpers" section in sidebar
- ✨ **NEW:** "🎓 Learn by Doing" section in sidebar
- ✨ **NEW:** "🏆 Your Progress" section in sidebar
- ✨ **NEW:** Export instruction modals with beautiful styling
- ✨ **NEW:** Toast notifications for all export actions

### 📚 Documentation
- ✨ **NEW:** `NEW_FEATURES.md` - Comprehensive feature guide
- ✨ **NEW:** `QUICK_REFERENCE.md` - Fast lookup tables & workflows
- ✨ **NEW:** `IMPLEMENTATION_SUMMARY.md` - Complete implementation details
- ✨ **NEW:** `CHANGELOG.md` - This file
- ✅ **Updated:** `README.md` - Added feature highlights
- ✅ **Updated:** `INDEX.md` - Added navigation to new docs

### 🔧 Technical Improvements
- ✨ Added modal system for export instructions
- ✨ Added achievement tracking system with localStorage
- ✨ Added challenge validation system with periodic checking
- ✨ Added layout template insertion system
- ✨ Added learning hints toggle system
- ✅ Improved code organization and comments
- ✅ Enhanced user feedback with toasts and animations

### 📊 Statistics
- **Lines of code added:** ~700+
- **New functions:** 15+
- **New UI elements:** 17 (13 buttons + 4 sections)
- **New documentation pages:** 4
- **Export platforms supported:** 9 (up from 2)
- **Interactive challenges:** 5
- **Achievement badges:** 6
- **Layout helpers:** 4

### 🎯 Impact
- **Deployment options:** 450% increase (2 → 9 platforms)
- **Educational features:** Infinite increase (0 → 11 new features)
- **Usability:** Significantly improved with step-by-step guides
- **Learning curve:** Greatly reduced with challenges and hints

### 🔄 Breaking Changes
**NONE!** All changes are additive and non-breaking. Existing functionality remains intact.

### 📱 Compatibility
- ✅ All features work in modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- ✅ Mobile-responsive design maintained
- ✅ Touch-friendly interactions
- ✅ Accessibility preserved
- ✅ Privacy-first approach maintained (no tracking, no external requests)

### 🐛 Bug Fixes
- None needed - this is a pure feature addition release

### 🙏 Credits
Built with care for novice developers who want to learn, build, and deploy their projects with confidence!

---

## Version 1.0.0 - Initial Release

### Core Features
- Live preview with sandboxed iframe
- Visual editor with color pickers and typography controls
- Code editor with line numbers and syntax awareness
- 12+ page templates (portfolio, blog, landing, etc.)
- 14 color presets
- Undo/Redo functionality
- Download HTML
- Copy to clipboard
- Share via URL
- Auto-save to localStorage
- Mobile responsive design
- Dark theme interface
- CodePen export
- JSFiddle export
- Fullscreen and device preview modes
- Theme toggle (light/dark)

---

## Future Roadmap (Optional)

### Potential v2.1 Features
- Additional challenges (6-10)
- More export platforms (Notion, Wix, Squarespace)
- Video tutorial embeds
- Syntax highlighting in code editor
- Code snippets library

### Potential v3.0 Features
- Community gallery (requires backend)
- AI code suggestions (requires API)
- Collaborative editing (requires backend)
- Custom template saving
- Export to ZIP with assets

**Note:** v2.0 is feature-complete for all original requirements. Future versions are optional enhancements.

---

## How to Upgrade

### From v1.0 to v2.0
Simply replace your `index.html` file with the new version. No configuration changes needed!

All new features are automatically available. User progress is tracked in browser localStorage.

### Deployment
No changes to deployment process. Deploy via:
- GitHub Pages
- Netlify  
- Vercel
- Cloudflare Pages
- Any static hosting

---

## Support

- 📖 Documentation: See `NEW_FEATURES.md` and `QUICK_REFERENCE.md`
- 🐛 Issues: Check existing functionality first
- 💡 Feature Requests: See Future Roadmap above
- 🎓 Learning: Try the interactive challenges in the app!

---

**Last Updated:** October 12, 2025  
**Current Version:** 2.0.0  
**Status:** ✅ Stable & Production Ready

