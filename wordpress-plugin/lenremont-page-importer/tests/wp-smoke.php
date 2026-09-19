<?php
/**
 * Run with: wp eval-file tests/wp-smoke.php --user=admin
 */

if (! defined('ABSPATH')) {
	exit(1);
}

require_once ABSPATH . 'wp-admin/includes/plugin.php';

$failures = array();

if (! is_plugin_active('lenremont-page-importer/lenremont-page-importer.php')) {
	$failures[] = 'Plugin is not active.';
}

$registry = \WP_Block_Type_Registry::get_instance();
$patterns = \WP_Block_Patterns_Registry::get_instance();
foreach (array('page', 'hero', 'advantages', 'services', 'prices', 'process', 'reviews', 'faq', 'contact', 'buttons') as $name) {
	if (! $patterns->is_registered('lenremont/ai-' . $name)) $failures[] = 'Missing design pattern: ' . $name;
}
$page_pattern = $patterns->get_registered('lenremont/ai-page');
$pattern_blocks = parse_blocks($page_pattern['content'] ?? '');
if ('lr-ai-page' !== ($pattern_blocks[0]['attrs']['className'] ?? '') || 'hop-gutenberg' !== ($pattern_blocks[0]['attrs']['anchor'] ?? '')) {
	$failures[] = 'Design-system page must have one native root with its class and anchor.';
}
if (! wp_style_is('lenremont-design-system', 'registered')) $failures[] = 'Design-system stylesheet is not registered.';
foreach (array('lenremont/quiz', 'lenremont/before-after', 'lenremont/lead-form', 'lenremont/element', 'lenremont/text', 'lenremont/picture', 'lenremont/art', 'lenremont/reference-quiz', 'lenremont/reference-widget') as $block_name) {
	if (! $registry->is_registered($block_name)) {
		$failures[] = 'Block is not registered: ' . $block_name;
	}
}

\Lenremont\PageImporter\Plugin::instance()->enqueue_editor_assets();
foreach (array('lenremont-page-converter', 'lenremont-page-importer-editor') as $script_handle) {
	if (! wp_script_is($script_handle, 'enqueued')) {
		$failures[] = 'Editor script is not enqueued: ' . $script_handle;
	}
}

$quiz_markup = '<!-- wp:lenremont/quiz {"title":"Smoke test","options":["One","Two"]} /-->';
$quiz_output = do_blocks($quiz_markup);
if (false === strpos($quiz_output, 'data-lr-quiz')) {
	$failures[] = 'Quiz did not render expected markup.';
}

$compare_markup = '<!-- wp:lenremont/before-after {"title":"Compare","beforeUrl":"https://example.test/before.webp","afterUrl":"https://example.test/after.webp"} /-->';
$compare_output = do_blocks($compare_markup);
if (false === strpos($compare_output, 'data-lr-before-after')) {
	$failures[] = 'Before/after block did not render expected markup.';
}

$art = json_decode(file_get_contents(LENREMONT_PAGE_IMPORTER_DIR . 'assets/reference/art.json'), true);
$asset = array_key_first($art);
if (false === strpos(do_blocks('<!-- wp:lenremont/art {"asset":"' . $asset . '"} /-->'), '<svg')) {
	$failures[] = 'Trusted SVG did not render.';
}
if ('' !== do_blocks('<!-- wp:lenremont/art {"asset":"../../wp-config.php"} /-->')) {
	$failures[] = 'Unknown art key must not render.';
}
if (false === strpos(do_blocks('<!-- wp:lenremont/reference-widget {"widget":"contact-dialog"} /-->'), 'id="contact-dialog"')) {
	$failures[] = 'Trusted dialog did not render.';
}
foreach (array('motocikly', 'skutery', 'kvadrocikly', 'baggi') as $vehicle) {
	$callback = do_blocks('<!-- wp:lenremont/reference-widget {"widget":"callback-' . $vehicle . '"} /-->');
	if (false === strpos($callback, 'id="callback"') || false === strpos($callback, 'value="/peretyazhka-sidenij-mototransporta-' . $vehicle . '/"')) {
		$failures[] = 'Vehicle callback did not render its page path: ' . $vehicle;
	}
}
if ('' !== do_blocks('<!-- wp:lenremont/reference-widget {"widget":"../../wp-config.php"} /-->')) {
	$failures[] = 'Unknown widget key must not render.';
}
$legacy_root = '<!-- wp:group {"align":"full","className":"lr-reference lr-imported-page-reference"} --><div class="wp-block-group alignfull lr-reference lr-imported-page-reference"><p>Legacy page</p></div><!-- /wp:group -->';
if (false === strpos(do_blocks($legacy_root), 'id="hop-gutenberg"')) {
	$failures[] = 'Legacy imported page did not receive the isolated root id.';
}
$templates = get_block_templates(array('slug__in' => array('lenremont-landing')));
if (! isset($templates[0]) || 'lenremont-landing' !== $templates[0]->slug) {
	$failures[] = 'Plugin template must be accessible at index 0 for the editor.';
}

if ($failures) {
	foreach ($failures as $failure) {
		fwrite(STDERR, 'FAIL: ' . $failure . PHP_EOL);
	}
	exit(1);
}

echo 'WP smoke tests passed' . PHP_EOL;
