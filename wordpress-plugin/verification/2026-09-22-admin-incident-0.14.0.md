# 0.14.0: admin critical-error investigation

User reports the entire production `/wp-admin/` shows WordPress's generic critical-error screen. Exact fatal message, server versions and stack trace are not available. **Root cause remains unconfirmed; do not treat 0.14.0 as production-verified.**

## Read-only checks performed

- All 216 entries in the shipped ZIP were compared against source with SHA-256; no mismatches or missing source files.
- All 12 PHP files pass PHP 8.3.31 syntax checks.
- Executed `check-admin-bootstrap-0.14.0.php` through WP-CLI against local `testing-gutenberg`, WordPress 7.1.2 / PHP 8.2.29. The installed 0.13.0 plugin was skipped for that process; 0.14.0 was loaded directly from this workspace. No plugin installation, activation or page writes were performed.
- Block/pattern registration, manual `admin_init`, editor enqueueing and printing editor script dependencies completed. Editor output: 456666 bytes; incremental allocated memory: 4194304 bytes; process peak: 62914560 bytes. PHP CLI memory limit was unlimited; these measurements do not prove production memory sufficiency.
- Repeated with the local theme and other plugins allowed (only installed importer skipped): same result.
- WP-CLI's separate `--context=admin` mode failed in Core `wp-admin/includes/menu.php:280` (`uksort(null, ...)`) **also with every plugin and theme skipped and before the diagnostic script ran**. This is a test-harness limitation, not evidence of the production cause.
- Existing local PHP log has no matching production fatal and the local installed plugin remains 0.13.0. Local logs cannot diagnose the remote server.

## Limits and next evidence

This is not a full browser/admin HTTP test, not a production-clone test and not an import/save/reload test. No production files or settings were changed. Plugin implementation and release ZIP remain unchanged.

To restore access, temporarily rename only `wp-content/plugins/lenremont-page-importer` to `lenremont-page-importer.disabled` using the host file manager/SFTP. This does not delete content, but plugin-dependent blocks can temporarily stop rendering. If admin is restored, keep the plugin disabled while retrieving the error.

Required evidence: the PHP Fatal error/Uncaught entry at the time of the failed `/wp-admin/` request (file, line and stack trace), WordPress/PHP versions, and whether disabling this one plugin restores admin. Never share credentials or recovery-mode tokens.

## Separate compatibility finding

The regenerated art dictionary omits the former key `art-0ca2e6b81f82`. Saved art blocks referencing that key now render empty. The renderer safely checks `isset`, so this does **not** explain a fatal error in the entire admin. Keep this as a separate backward-compatibility repair after identifying the incident cause.
