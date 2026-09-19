<?php
/** Blank local drafts for assembling original sections through the real editor UI. */
if (wp_parse_url(home_url(), PHP_URL_HOST) !== 'testing-gutenberg.local' || is_multisite()) throw new RuntimeException('Named local single site only.');
foreach (array('0.11.0' => 'Ленремонт — блоки из исходного лендинга', '0.11.0-partial' => 'Ленремонт — отдельные исходные секции') as $marker => $title) {
	$ids = get_posts(array('post_type' => 'page', 'post_status' => array('draft', 'private'), 'meta_key' => '_lr_block_library_demo', 'meta_value' => $marker, 'fields' => 'ids', 'posts_per_page' => 1));
	if ($ids) { echo $marker . ' existing: ' . $ids[0] . PHP_EOL; continue; }
	$id = wp_insert_post(array('post_type' => 'page', 'post_status' => 'draft', 'post_title' => $title, 'post_content' => '', 'meta_input' => array('_lr_block_library_demo' => $marker, '_wp_page_template' => 'lenremont-landing')), true);
	if (is_wp_error($id)) throw new RuntimeException($id->get_error_message());
	echo $marker . ' created: ' . $id . PHP_EOL;
}
