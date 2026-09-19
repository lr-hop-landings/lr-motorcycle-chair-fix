<?php
/** Read-only audit: wp eval-file verify-pages.php */
if (! defined('WP_CLI') || ! WP_CLI) { exit(1); }
if (wp_parse_url(home_url(), PHP_URL_HOST) !== 'testing-gutenberg.local') {
    WP_CLI::error('This audit targets the local testing-gutenberg site only.');
}
$catalog = json_decode(file_get_contents(dirname(__DIR__) . '/lenremont-page-importer/examples/catalog.json'), true);
$failures = array();
$results = array();
$count_blocks = function ($blocks) use (&$count_blocks) {
    $count = 0;
    foreach ($blocks as $block) {
        if ($block['blockName']) $count++;
        $count += $count_blocks($block['innerBlocks']);
    }
    return $count;
};
foreach ($catalog as $entry) {
    $page = get_page_by_path($entry['slug']);
    if (! $page || $page->post_status !== 'publish') {
        $failures[] = 'Missing published page: ' . $entry['key'];
        continue;
    }
    $url = home_url($entry['path']);
    if (get_permalink($page) !== $url) $failures[] = 'Unexpected permalink: ' . $entry['key'];
    if (get_page_template_slug($page) !== 'lenremont-landing') $failures[] = 'Wrong template: ' . $entry['key'];
    $response = wp_remote_get($url, array('redirection' => 0, 'timeout' => 15));
    if (is_wp_error($response)) {
        $failures[] = $response->get_error_message();
        continue;
    }
    $status = wp_remote_retrieve_response_code($response);
    if ($status !== 200) $failures[] = 'Non-200 response: ' . $url;
    $dom = new DOMDocument();
    $previous_errors = libxml_use_internal_errors(true);
    $dom->loadHTML('<?xml encoding="utf-8" ?>' . wp_remote_retrieve_body($response));
    libxml_clear_errors();
    libxml_use_internal_errors($previous_errors);
    $xpath = new DOMXPath($dom);
    $h1 = $xpath->query('//h1');
    $sections = $xpath->query('//*[@id="top"]/section')->length;
    $blocks = $count_blocks(parse_blocks($page->post_content));
    if ($h1->length !== 1 || $sections !== 13) $failures[] = 'Heading/section count mismatch: ' . $entry['key'];
    if ($blocks !== ($entry['key'] === 'main' ? 468 : 418)) $failures[] = 'Block count mismatch: ' . $entry['key'];
    $canonical = $xpath->query('//link[@rel="canonical"]')->item(0);
    if (! $canonical || $canonical->getAttribute('href') !== $url) $failures[] = 'Wrong canonical: ' . $entry['key'];
    $links = array();
    foreach ($catalog as $target) {
        if ($target['key'] === $entry['key']) continue;
        if ($xpath->query('//a[@href="' . $target['path'] . '"]')->length < 1) $failures[] = 'Missing crosslink: ' . $entry['key'] . ' -> ' . $target['key'];
        else $links[] = $target['path'];
    }
    foreach ($xpath->query('//a[starts-with(@href,"#")]') as $anchor) {
        $id = substr($anchor->getAttribute('href'), 1);
        if ($id && ! $dom->getElementById($id)) $failures[] = 'Missing anchor #' . $id . ' on ' . $entry['key'];
    }
    $quiz = $dom->getElementById('quiz-app');
    $expected_vehicle = $entry['key'] === 'main' ? '' : $entry['key'];
    if (! $quiz || $quiz->getAttribute('data-vehicle') !== $expected_vehicle || $quiz->getAttribute('data-page-path') !== $entry['path']) $failures[] = 'Wrong quiz context: ' . $entry['key'];
    $callback = $xpath->query('//*[@id="callback"]//input[@name="page_path"]')->item(0);
    if (! $callback || $callback->getAttribute('value') !== $entry['path']) $failures[] = 'Wrong callback path: ' . $entry['key'];
    $images = 0;
    foreach ($xpath->query('//img') as $image) {
        $src = $image->getAttribute('src');
        if (wp_parse_url($src, PHP_URL_HOST) !== wp_parse_url(home_url(), PHP_URL_HOST)) $failures[] = 'Nonlocal image: ' . $src;
        elseif (! is_file(ABSPATH . ltrim(wp_parse_url($src, PHP_URL_PATH), '/'))) $failures[] = 'Missing image: ' . $src;
        $images++;
    }
    $results[] = array('key' => $entry['key'], 'id' => $page->ID, 'url' => $url, 'status' => $status, 'blocks' => $blocks, 'sections' => $sections, 'crosslinks' => $links, 'images' => $images);
}
$redirects = array();
foreach ($results as $result) {
    foreach (get_post_meta($result['id'], '_lenremont_previous_path') as $old_path) {
        $response = wp_remote_get(home_url(implode('/', array_map('rawurlencode', explode('/', $old_path)))), array('redirection' => 0, 'timeout' => 15));
        if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 301 || wp_remote_retrieve_header($response, 'location') !== $result['url']) {
            $failures[] = 'Old path does not redirect correctly: ' . $old_path;
        } else {
            $redirects[] = array('from' => $old_path, 'to' => $result['url'], 'status' => 301);
        }
        foreach ($results as $linked_page) {
            if (strpos(get_post($linked_page['id'])->post_content, 'href="' . $old_path . '"') !== false) $failures[] = 'Stale crosslink on page ' . $linked_page['id'];
        }
    }
}
WP_CLI::line(wp_json_encode(array('pages' => $results, 'redirects' => $redirects, 'failures' => $failures), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
if ($failures) WP_CLI::error(implode('; ', $failures));
WP_CLI::success('Five-page audit passed.');
