# 0.11.0 — extraction QA, 2026-09-19

Scope: local testing-gutenberg only (WordPress 7.1.1 / PHP 8.2.29). No production changes. Backup: `local-before-0.11.0.zip`.

## Changes

- Default custom library collection: original 13 main landing sections, four vehicle-specific Hero variants, full page and empty container (19 entries).
- Reuse manifests, converter, registered editable blocks, images, styles and original interaction modules. No duplicated stylesheet or new external library.
- Shared root, icon sprite and two dialogs; automatic section insertion into the main group; conflicting IDs/section variants blocked.
- Source quiz module loads only when a quiz exists on an assembled page. No-Hero pages support message dialog and callback. Current path replaces source path for attribution.
- Old 37 patterns remain in the secondary collection. Original imported pages are not automatically edited or mixed with extracted sections.
- Fixed eager construction before WordPress core block registration: library setup now runs through `wp.domReady`.

## Verified

- All 19 entries parsed with real Gutenberg serializer/parser: 1,018 total blocks across entries, zero invalid blocks.
- Draft 50 inserted via UI, saved and reloaded: 465 blocks, zero invalid blocks, 13 sections, clean editor state.
- Second Hero variant rejected by UI notice, no content changes.
- Source portfolio preview shows original images/type/colors in its modal.
- Draft 51 assembled via three successive UI inserts: materials, FAQ, contact. One root and one of each shared dialog.
- Desktop source Hero matches existing landing design; editor uses full available canvas width.
- At mobile viewport 390×844: scrollWidth 390, quiz width 322, original stacked layout visible.
- Original quiz moves to second question after delayed transition. Swiper next button changes active index 0→1. FAQ opens. No duplicate HTML IDs; no failed completed images; no frontend console errors observed.
- No-Hero contact CTA opens preparation dialog; close restores page; callback CTA opens phone dialog. No leads or messenger messages sent.
- Read-only PHP checks pass for drafts 50/51, old library, generic service quiz, classic-theme compatibility of five original pages and normal Gutenberg groups.
- Node regression tests pass: reference-library, library, editor-layout, SEO import, quiz transition, converter and all five manifests.

## Limits

Not deployed/tested on production. Actual lead delivery not tested. Reference quiz retains motorcycle-seat scenario (not arbitrary service questions). Source collection inserts through the custom library panel, not native pattern registration. One instance of each source section per page; manual Gutenberg duplication bypasses panel guards. Assembly omits original sticky mobile bar and moves message dialog to shared root. Links to omitted sections must be updated by the editor. Local PHP prints a pre-existing missing Imagick startup warning, unrelated to this change.
