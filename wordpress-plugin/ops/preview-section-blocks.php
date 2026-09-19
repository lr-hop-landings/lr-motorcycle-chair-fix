<?php
// Create a new blank draft; never overwrite an existing test or user page.
if (wp_parse_url(home_url(), PHP_URL_HOST) !== 'testing-gutenberg.local' || is_multisite()) throw new RuntimeException('Local single site only.');
$ids = get_posts(array('post_type' => 'page', 'post_status' => array('draft', 'private'), 'meta_key' => '_lr_block_library_demo', 'meta_value' => '0.12.0', 'fields' => 'ids', 'posts_per_page' => 1));
if ($ids) { echo 'Existing: ' . $ids[0]; return; }
$id = wp_insert_post(array('post_type' => 'page', 'post_status' => 'draft', 'post_title' => 'Ленремонт — самостоятельные блоки секций', 'meta_input' => array('_lr_block_library_demo' => '0.12.0', '_wp_page_template' => 'lenremont-landing')), true);
if (is_wp_error($id)) throw new RuntimeException($id->get_error_message());
echo 'Created: ' . $id;
