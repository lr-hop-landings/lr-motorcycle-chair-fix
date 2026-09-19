<?php
/**
 * Plugin Name: Lenremont - Gutenberg Page Importer
 * Description: Converts structured landing-page manifests and semantic HTML into editable Gutenberg blocks.
 * Version: 0.13.0
 * Requires at least: 6.7
 * Requires PHP: 7.4
 * Author: Goraie
 * Text Domain: lenremont-page-importer
 */

declare(strict_types=1);

if (! defined('ABSPATH')) {
	exit;
}

define('LENREMONT_PAGE_IMPORTER_FILE', __FILE__);
define('LENREMONT_PAGE_IMPORTER_DIR', plugin_dir_path(__FILE__));
define('LENREMONT_PAGE_IMPORTER_URL', plugin_dir_url(__FILE__));

require_once LENREMONT_PAGE_IMPORTER_DIR . 'includes/class-plugin.php';

add_action(
	'plugins_loaded',
	static function (): void {
		Lenremont\PageImporter\Plugin::instance()->register_hooks();
	}
);
