<?php
/** Run with wp eval-file on the local fixture site. Does not write to the DB. */
function lr_check($condition, $message) {
	if (! $condition) throw new RuntimeException($message);
	echo "PASS: $message\n";
}

// A distinct theme key avoids Core's static theme.json cache. These request-only
// filters reproduce wp_restore_group_inner_container without switching themes.
add_filter('stylesheet', static function () { return 'lr-classic-test'; });
add_filter('theme_file_path', static function ($path, $file) {
	return 'theme.json' === $file ? __DIR__ . '/no-theme-json-here.json' : $path;
}, 10, 2);
lr_check(! wp_theme_has_theme_json(), 'classic theme compatibility path is active');

$plain = '<!-- wp:group --><div class="wp-block-group"><!-- wp:paragraph --><p>Outside</p><!-- /wp:paragraph --></div><!-- /wp:group -->';
$normal = do_blocks($plain);
lr_check(false !== strpos($normal, 'wp-block-group__inner-container'), 'ordinary groups keep Core compatibility wrappers');
$ids = array(11, 19, 20, 21, 22);
foreach ($ids as $id) {
	$post = get_post($id);
	lr_check($post && false !== strpos($post->post_content, 'lr-reference'), "reference page $id exists");
	$html = do_blocks($post->post_content);
	lr_check(false === strpos($html, 'wp-block-group__inner-container'), "page $id: no injected group wrappers");
	lr_check(1 === substr_count($html, 'id="hop-gutenberg"'), "page $id: one isolated root");
	$dom = new DOMDocument();
	libxml_use_internal_errors(true);
	$dom->loadHTML('<?xml encoding="utf-8" ?>' . $html);
	$xp = new DOMXPath($dom);
	$slides = $xp->query('//*[contains(concat(" ", normalize-space(@class), " "), " swiper-wrapper ")]/*[contains(concat(" ", normalize-space(@class), " "), " swiper-slide ")]');
	$all_slides = $xp->query('//*[contains(concat(" ", normalize-space(@class), " "), " swiper-slide ")]');
	lr_check($slides->length > 0 && $slides->length === $all_slides->length, "page $id: all {$slides->length} Swiper slides are direct children");
	if (11 === $id) lr_check(8 === $slides->length, 'main page retains eight cases');
}
lr_check(do_blocks($plain) === $normal, 'ordinary content is unchanged after landing rendering');

$library = WP_Block_Patterns_Registry::get_instance()->get_registered('lenremont/ai-page');
lr_check(! empty($library), 'library page pattern is registered');
$library_html = do_blocks($library['content']);
lr_check(false === strpos($library_html, 'wp-block-group__inner-container'), 'library grids have no injected classic-theme wrappers');
lr_check(1 === substr_count($library_html, 'id="hop-gutenberg"'), 'library page has one isolated root');
lr_check(do_blocks($plain) === $normal, 'ordinary groups unchanged after library rendering');

$legacy = '<!-- wp:group {"className":"lr-reference"} --><div class="wp-block-group lr-reference"><div class="wp-block-group__inner-container"><p>Explicit legacy wrapper</p></div></div><!-- /wp:group -->';
lr_check(false !== strpos(do_blocks($legacy), 'wp-block-group__inner-container'), 'explicitly saved legacy wrappers are preserved');
echo "All classic-theme compatibility tests passed.\n";
