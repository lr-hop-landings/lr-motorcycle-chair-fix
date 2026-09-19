<?php
if (wp_parse_url(home_url(), PHP_URL_HOST) !== 'testing-gutenberg.local') throw new RuntimeException('Local test site only');
$id = wp_insert_post(array('post_type' => 'page', 'post_status' => 'draft', 'post_title' => 'SEO importer verification 0.8.0', 'post_content' => '<!-- wp:paragraph --><p>SEO-only import must preserve this text.</p><!-- /wp:paragraph -->', 'meta_input' => array('_lr_seo_fixture' => '1', '_lr_fixture_title' => 'Existing manual title')), true);
if (is_wp_error($id)) throw new RuntimeException($id->get_error_message());
echo 'SEO_FIXTURE_ID=' . $id . "\n";
