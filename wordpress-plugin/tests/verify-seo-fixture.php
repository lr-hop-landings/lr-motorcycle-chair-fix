<?php
if (wp_parse_url(home_url(), PHP_URL_HOST) !== 'testing-gutenberg.local') throw new RuntimeException('Local test site only');
$id = 35;
if (! get_post_meta($id, '_lr_seo_fixture', true)) throw new RuntimeException('Not a test fixture');
$manifest = json_decode(file_get_contents(LENREMONT_PAGE_IMPORTER_DIR . 'examples/baggi.json'), true);
$mapping = array('title' => 'title', 'description' => 'metadesc', 'breadcrumbsTitle' => 'bctitle', 'ogTitle' => 'opengraph-title', 'ogDescription' => 'opengraph-description');
foreach ($mapping as $key => $field) {
	if ($manifest['seo'][$key] !== get_post_meta($id, '_lr_fixture_' . $field, true)) throw new RuntimeException('Saved SEO mismatch: ' . $key);
	echo 'PASS saved SEO: ' . $key . "\n";
}
if ('draft' !== get_post_status($id)) throw new RuntimeException('Test page must stay draft');
if (! has_block('lenremont/reference-quiz', $id)) throw new RuntimeException('Test import was not saved');
echo "PASS draft status and imported blocks; no production writes.\n";
