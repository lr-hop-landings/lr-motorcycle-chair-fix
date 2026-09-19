<?php
/** Local-only, idempotent creation of a draft demonstrating the pattern library. */
if (! defined('ABSPATH') || wp_parse_url(home_url(), PHP_URL_HOST) !== 'testing-gutenberg.local') {
	throw new RuntimeException('Only the named local test site is supported.');
}
$ids = get_posts(array('post_type' => 'page', 'post_status' => 'any', 'meta_key' => '_lr_ai_design_demo', 'meta_value' => '1', 'fields' => 'ids', 'posts_per_page' => 1));
if ($ids) {
	if (in_array(get_post_meta($ids[0], '_wp_page_template', true), array('default', 'lenremont-page-importer//lenremont-landing'), true)) update_post_meta($ids[0], '_wp_page_template', 'lenremont-landing');
	// Repair only the known empty-image placeholder from the initial local demo.
	$content = get_post_field('post_content', $ids[0]);
	$fixed = str_replace('<!-- wp:image {"className":"lr-ai-media"} /-->', '<!-- wp:image {"className":"lr-ai-media"} --><figure class="wp-block-image lr-ai-media"><img alt=""/></figure><!-- /wp:image -->', $content);
	if ($fixed !== $content) wp_update_post(array('ID' => $ids[0], 'post_content' => wp_slash($fixed)));
	echo 'Existing draft: ' . $ids[0] . PHP_EOL;
	return;
}
$pattern = WP_Block_Patterns_Registry::get_instance()->get_registered('lenremont/ai-page');
if (! $pattern) throw new RuntimeException('Design-system pattern is missing.');
$id = wp_insert_post(array(
	'post_type' => 'page',
	'post_status' => 'draft',
	'post_title' => 'Ленремонт — демо дизайн-системы',
	'post_name' => 'lr-ai-design-system-demo',
	'post_content' => wp_slash($pattern['content']),
	'meta_input' => array('_lr_ai_design_demo' => '1', '_wp_page_template' => 'lenremont-landing'),
), true);
if (is_wp_error($id)) throw new RuntimeException($id->get_error_message());
update_post_meta($id, '_wp_page_template', 'lenremont-landing');
echo 'Created draft: ' . $id . PHP_EOL;
