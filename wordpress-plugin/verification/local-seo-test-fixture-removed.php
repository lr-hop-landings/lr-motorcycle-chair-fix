<?php
/** Local-only test double of the observed legacy metabox. NEVER ship in plugin. */
if (! defined('ABSPATH') || wp_parse_url(home_url(), PHP_URL_HOST) !== 'testing-gutenberg.local') return;
function lr_seo_fixture_fields() {
	return array('title', 'metadesc', 'bctitle', 'bctitle_url', 'canonical', 'opengraph-title', 'opengraph-description', 'opengraph-image-id');
}
add_action('add_meta_boxes_page', static function ($post) {
	if (! get_post_meta($post->ID, '_lr_seo_fixture', true)) return;
	add_meta_box('lr-seo-fixture', 'SEO test fixture (local only)', static function ($post) {
		wp_nonce_field('lr_seo_fixture', 'lr_seo_fixture_nonce');
		foreach (lr_seo_fixture_fields() as $field) {
			$id = 'on_yoast_wpseo_' . $field;
			echo '<p><label for="' . esc_attr($id) . '">' . esc_html($id) . '</label><input class="widefat" id="' . esc_attr($id) . '" name="' . esc_attr($id) . '" value="' . esc_attr(get_post_meta($post->ID, '_lr_fixture_' . $field, true)) . '"></p>';
		}
	}, 'page', 'normal');
});
add_action('save_post_page', static function ($id) {
	if (! get_post_meta($id, '_lr_seo_fixture', true) || ! current_user_can('edit_post', $id) || wp_is_post_autosave($id) || wp_is_post_revision($id)) return;
	if (! isset($_POST['lr_seo_fixture_nonce']) || ! wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['lr_seo_fixture_nonce'])), 'lr_seo_fixture')) return;
	foreach (lr_seo_fixture_fields() as $field) {
		$key = 'on_yoast_wpseo_' . $field;
		if (isset($_POST[$key]) && is_string($_POST[$key])) update_post_meta($id, '_lr_fixture_' . $field, sanitize_text_field(wp_unslash($_POST[$key])));
	}
});
