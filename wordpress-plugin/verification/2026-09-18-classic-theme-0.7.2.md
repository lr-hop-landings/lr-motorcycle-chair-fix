# 0.7.2 — classic-theme compatibility

## Confirmed on lenremont.ru

Read-only inspection of page 350083 editor (WordPress 7.0.5 asset version):
- All 0.7.1 importer CSS files were loaded.
- `classic.min.css`: `html :where(.wp-block)` sets `max-width:840px`, margins 28px. Custom Hero inherited this cap; root was not the bottleneck.
- `supportsLayout:false` made Core render 120 group inner wrappers in the editor; Hero grids had one direct child instead of two.
- Temporarily applying the two width rules and enabling layout support restored Hero width to 2256px, inner grids to 1280px, two direct children per grid, zero injected wrappers, zero invalid blocks, dirty=false.
- Temporary style element was removed and supportsLayout restored to false. No post saved, no production plugin files changed.
- Earlier frontend inspection confirmed the same wrappers broke Swiper (0 recognized slides), and Use Any Font forced dinpro-bold on headings.

## Fix

- Runtime tree marker scopes Core/group compatibility-wrapper removal to an `lr-reference` subtree. Saved markup is unchanged; explicit legacy wrappers are preserved.
- Editor modern group layout is enabled only for a document containing one reference root; restored when that document root is removed/replaced.
- Classic editor width/margin reset loads before original component rules.
- Only the reference landing heading font overrides the site's global !important font rule; explicit font-family styling is excluded.
- Version bump invalidates plugin asset URLs.

## Verification

- PHP syntax, converter tests, editor layout subscription tests and quiz-transition tests passed.
- WP-CLI request-only classic-theme simulation: all five local pages render without injected wrappers. Main: 8 direct slides; four service pages: 5 direct slides each. Ordinary groups retain their wrappers before and after landing rendering. Explicit saved legacy wrappers preserved. No DB writes.
- Actual local editor: 0.7.2 stylesheet, 468 blocks, 0 invalid, dirty=false; Hero grids 1280px with two children.
- Actual local frontend: Swiper recognizes 8 slides, unlocked, next button advances index 0 -> 1. Correct Manrope font. No horizontal overflow at 1920px or 390px; mobile Hero uses display:contents. Viewport override removed.
- Previous local plugin saved in `local-before-0.7.2.zip` before updating six files. Existing PHP imagick startup warning is unrelated.

Production installation still required. No JSON reimport or page rewrite needed for the tested current-format pages. Entire production-site compatibility is not claimed beyond these targeted checks.
