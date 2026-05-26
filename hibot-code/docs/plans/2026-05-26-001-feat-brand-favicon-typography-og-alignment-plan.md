---
title: "feat: Align favicon, editor typography, and default OG image with brand tokens"
type: feat
status: active
date: 2026-05-26
---

# feat: Align favicon, editor typography, and default OG image with brand tokens

## Overview

Bring **tab icon**, **in-editor reading rhythm**, and the **default social preview image** in line with `DESIGN-TOKENS.md` (near-black `#0A0A0A`, ink `#E8E8E3` / `#f1f5f9`, **amber** `#F5A524`). Today the favicon tile uses slate `#0f172a`; the shared `get-started-coding-og.png` reads with a **green** accent in previews while the product is **amber-forward**; editor UI uses `--text-body: 16px` and `--leading-body: 1.55`, which can feel tight at scale.

## Problem Statement / Motivation

- **Favicon:** Background and chrome do not match canonical `--bg` (`#0A0A0A`), weakening tab-level brand consistency.
- **Typography:** Body and mono blocks are slightly small with moderate line-height; increasing base size and line-height improves scanability without a full redesign.
- **OG image:** Many pages reference `https://code.hibot.space/get-started-coding-og.png` for `og:image` / `twitter:image`. Visual language should match amber + dark canvas, not legacy green.

## Proposed Solution

1. **`favicon.svg`** — Set tile background to `#0A0A0A`; keep a simple `</>` or monogram mark using amber gradient or solid `#F5A524`; optional hairline border in `rgba(245,165,36,0.25)` for legibility at 16×16.
2. **`editor.html` `:root` typography tokens** — Nudge `--text-body` (e.g. 16→17px), `--leading-body` (e.g. 1.55→1.62), proportional bumps for `--text-ui-sm` / `--text-caption` where they gate UI density; increase CodeMirror / console mono `font-size` + `line-height` slightly so code panels match the roomier rhythm.
3. **`get-started-coding-og.png`** — Regenerate 1200×630 PNG from a checked-in **HTML template** (exact pixel viewport) using headless Chrome screenshot; art direction: `#0A0A0A` field, amber rule or glow, **Outfit** / **DM Sans** via existing self-hosted fonts if loadable from `file:` (else fall back to system stack matching weights). Primary line: **Hi Bot Code** (display); secondary: short line compatible with most routes that reuse this asset.
4. **Service worker** — Bump `CACHE_NAME` in `sw.js` together with root `VERSION` per repo comment so favicon precache refreshes for returning PWA users.
5. **Favicon cache query** — Align `editor.html` `favicon.svg?v=` with bumped `VERSION` (or remove query if SW bump is the single source of truth); keep behavior consistent with `manifest.json` (no query on icon paths).

## Technical Considerations

- **No new npm dependencies** for PNG generation; use system Chrome `--headless --screenshot` against `file://` HTML under `scripts/` or repo root build artifact.
- **Binary commit:** Replace `get-started-coding-og.png` in repo; validators use absolute production URL — bytes update on next deploy.
- **Scope boundary:** Per-page unique OG assets (`ai-roi-calculator-og.png`, `og-ai-coding-landscape-2026.png`) stay unchanged unless explicitly expanded; this plan targets the **default** card used across index, editor, learn, challenges, etc.

## System-Wide Impact

- **Interaction graph:** SW `install` / `activate` evicts old cache when `CACHE_NAME` changes; first load repopulates `CORE_ASSETS` including `/favicon.svg`.
- **State risks:** None (static assets).
- **API parity:** N/A.
- **Integration checks:** Slack/Facebook/Twitter preview caches may need URL re-scrape; local verification via headless PNG dimensions 1200×630.

## Acceptance Criteria

- [x] `favicon.svg` uses `#0A0A0A` (or token-equivalent) and amber-forward mark; readable at 16×16.
- [x] `editor.html` body and primary UI feel slightly larger with increased line-height; no obvious layout breaks in sidebar, tabs, or challenge panels at 1280px and mobile width.
- [x] New `get-started-coding-og.png` is 1200×630, dark + amber, no green accent; committed to repo.
- [x] `sw.js` `CACHE_NAME` and root `VERSION` bumped in lockstep.
- [x] `editor.html` favicon query param matches new `VERSION` if query strategy kept.

## Dependencies & Risks

- **Risk:** Crawlers cache old OG image — mitigate by re-running official debuggers post-deploy.
- **Risk:** `file://` screenshot may block local fonts — template may use `system-ui` stack matching weights if `@font-face` fails.

## Sources & References

- [DESIGN-TOKENS.md](../../DESIGN-TOKENS.md) — canonical palette and typography roles.
- [editor.html](../../editor.html) — `:root` tokens and inline styles.
- [favicon.svg](../../favicon.svg) — current vector asset.
- SpecFlow analysis (2026-05-26) — SW cache, OG parity, `learn-tier-6` twitter gap (deferred).

## Implementation notes (post-work)

- OG source: `scripts/og-default-brand.html` + Chrome headless screenshot.
- VERSION → `2.13.5`; CACHE_NAME → `hibot-code-v2.13.5`.
