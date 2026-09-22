<?php
/** Read-only diagnostic: run with WP-CLI --skip-plugins --skip-themes --user=<admin>. */
if (!defined('WP_CLI') || !WP_CLI) { exit(1); }
$baseline = memory_get_usage(true);
require dirname(__DIR__) . '/lenremont-page-importer/lenremont-page-importer.php';
$plugin = \Lenremont\PageImporter\Plugin::instance();
$plugin->register_hooks();
$plugin->register_blocks();
$plugin->register_design_patterns();
require_once ABSPATH . 'wp-admin/includes/admin.php';
set_current_screen('dashboard');
do_action('admin_init');
echo "Dashboard admin_init completed\n";
set_current_screen('page');
$plugin->enqueue_canvas_assets();
$plugin->enqueue_editor_assets();
$scripts = wp_scripts();
ob_start();
$scripts->do_items(array('lenremont-page-importer-editor', 'lenremont-block-library'), 1);
$output = ob_get_clean();
if (strpos($output, 'LenremontReferenceLibraryConfig') === false) {
    throw new RuntimeException('Editor library configuration was not printed.');
}
echo wp_json_encode(array(
    'wordpress' => get_bloginfo('version'),
    'php' => PHP_VERSION,
    'plugin' => LENREMONT_PAGE_IMPORTER_FILE,
    'editor_output_bytes' => strlen($output),
    'extra_memory_bytes' => memory_get_usage(true) - $baseline,
    'peak_memory_bytes' => memory_get_peak_usage(true),
    'memory_limit' => ini_get('memory_limit'),
), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
