# Lenremont Page Importer 0.5.1 — production-readiness audit

Date: 2026-09-18

## Verdict

The plugin package is structurally valid and low-risk to install and activate: it has no activation routine, database migration, cron job, REST endpoint, remote-code loader, or automatic page mutation. Front-end assets are conditionally loaded only on plugin landing pages, and an unrelated page and unrelated 404 were unaffected in the Local test site.

Direct production launch is **not approved yet**. The landing-page lead forms intentionally stop submission and display a test/unavailable message. Compatibility also needs to be checked on a staging copy of lenremont.ru because the production WordPress/PHP/theme/plugin matrix was not available during this audit.

## Verified

- PHP lint passed for every PHP file.
- JavaScript syntax checks passed for every JavaScript file.
- All bundled JSON files parse successfully.
- Converter tests passed.
- All five page manifests passed conversion validation with 13 sections each and no warnings (main: 468 blocks; each child page: 418 blocks).
- Quiz transition tests passed, including delayed transition, repeated-click guard, back navigation, resize animation, and reduced-motion handling.
- WordPress smoke tests passed on WordPress 7.1.1 / PHP 8.2.29 / Twenty Twenty-Five 1.5.
- A normal page returned 200 without plugin front-end assets.
- An unrelated missing URL returned 404 without a redirect or plugin front-end assets.
- The ZIP has one correct root directory (`lenremont-page-importer/`) and 122 entries.
- ZIP SHA-256: `832B984B0604E826204FDD2985D7FF26C869F4352A606C32E436E66B7F0BFA53`.
- Migration/operations scripts and database backups are outside the installable plugin ZIP.

## Required before production

1. Connect the quiz and callback forms to the real lead handler. Add server-side validation, nonce/CSRF protection, rate limiting or anti-spam, error handling, and a verified success state. At present no personal data is transmitted, but the landing cannot receive leads.
2. Test installation, activation, page import, save, preview, public rendering, and deactivation on a staging clone of lenremont.ru. Confirm WordPress 6.7+, PHP 7.4+, the active theme, caching/minification plugins, SEO/canonical output, and existing form/security plugins.
3. Take a database and `wp-content` backup before production installation. Install and activate the plugin first; import and publish pages only after the staging check succeeds.

## Hardening recommendations

- The legacy-path redirect performs a page-meta lookup on every GET/HEAD 404. It is exact and did not affect an unrelated 404, but a cached or predefined path map would avoid extra database work on high-traffic 404s.
- Scope editor assets to the Page editor instead of every block-editor screen available to users with `edit_pages`.
- Re-test or narrow the `get_block_templates` key-normalization workaround against the exact production WordPress version and other template-providing plugins.
- Reject protocol-relative URLs (`//external.example`) in the importer if imported links are intended to be local-only.
- Build a smaller production ZIP after verifying which test and legacy assets are unnecessary. This is packaging hygiene, not a correctness blocker.

## Known test-environment note

The Local CLI emits a pre-existing warning that `php_imagick.dll` is unavailable. WordPress smoke tests still passed, and the warning is unrelated to this plugin. The public production endpoint could not be inspected reliably from the audit environment, so no claim is made about the current lenremont.ru server stack.
