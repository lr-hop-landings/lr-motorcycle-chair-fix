<?php
if (wp_parse_url(home_url(), PHP_URL_HOST) !== 'testing-gutenberg.local') throw new RuntimeException('Local test site only');
$id = 35;
$post = get_post($id);
if (!$post || $post->post_title !== 'SEO importer verification 0.8.0' || get_post_meta($id, '_lr_seo_fixture', true) !== '1') throw new RuntimeException('Test draft identity mismatch');
if (!wp_trash_post($id)) throw new RuntimeException('Could not trash test draft');
echo "Test draft 35 moved to trash (recoverable).\n";
