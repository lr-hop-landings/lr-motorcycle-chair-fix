<?php
/** Local-only, idempotent migration. wp eval-file prepare-pages.php [apply|publish] --user=admin */
if (! defined('WP_CLI') || ! WP_CLI) { exit(1); }
if (wp_parse_url(home_url(), PHP_URL_HOST) !== 'testing-gutenberg.local' || is_multisite() || ! current_user_can('publish_pages')) {
    WP_CLI::error('This migration is restricted to the single-site testing-gutenberg environment and a page publisher.');
}
$mode = $args[0] ?? 'dry-run';
if (! in_array($mode, array('dry-run', 'apply', 'publish'), true)) WP_CLI::error('Unknown mode.');
$catalog = json_decode(file_get_contents(dirname(__DIR__) . '/lenremont-page-importer/examples/catalog.json'), true);
$plan = array();
$path_replacements = array();
foreach ($catalog as $entry) {
    $existing = get_page_by_path($entry['slug']);
    $owned = get_posts(array('post_type' => 'page', 'post_status' => 'any', 'posts_per_page' => 2, 'meta_key' => '_lenremont_source', 'meta_value' => $entry['key']));
    if (count($owned) > 1) WP_CLI::error('Multiple pages own source: ' . $entry['key']);
    $post = $entry['key'] === 'main' ? get_post(11) : ($owned[0] ?? null);
    if ($entry['key'] === 'main' && (! $post || ! has_block('lenremont/reference-quiz', $post))) WP_CLI::error('Expected imported homepage ID 11 not found.');
    if ($existing && (! $post || $existing->ID !== $post->ID)) {
        WP_CLI::error('URL belongs to an unrelated page: ' . $entry['path']);
    }
    if (wp_unique_post_slug($entry['slug'], $post ? $post->ID : 0, 'publish', 'page', 0) !== $entry['slug']) WP_CLI::error('Slug conflict: ' . $entry['slug']);
    $old_path = $post ? rawurldecode(wp_parse_url(get_permalink($post), PHP_URL_PATH)) : null;
    if ($old_path && $old_path !== $entry['path']) $path_replacements[$old_path] = $entry['path'];
    if ($entry['sourcePath'] !== '/' && $entry['sourcePath'] !== $entry['path']) $path_replacements[$entry['sourcePath']] = $entry['path'];
    $plan[] = array('entry' => $entry, 'post' => $post, 'old_path' => $old_path);
}
// Preflight all pages before publishing any of them.
if ($mode === 'publish') {
    foreach ($plan as $item) {
        $post = $item['post'];
        if (! $post || ! has_block('lenremont/reference-quiz', $post) || strlen($post->post_content) < 10000) WP_CLI::error('Page has not been imported: ' . $item['entry']['key']);
        foreach ($catalog as $target) {
            if ($target['key'] !== $item['entry']['key'] && strpos($post->post_content, 'href="' . $target['path'] . '"') === false) WP_CLI::error('Missing crosslink from ' . $item['entry']['key'] . ' to ' . $target['key']);
        }
    }
}
$result = array();
// Check the prospective links before modifying any already-imported pages.
if ($mode !== 'publish') {
    foreach ($plan as $item) {
        if (! $item['post'] || ! has_block('lenremont/reference-quiz', $item['post'])) continue;
        $prospective = strtr($item['post']->post_content, $path_replacements);
        foreach ($catalog as $target) {
            if ($target['key'] !== $item['entry']['key'] && strpos($prospective, 'href="' . $target['path'] . '"') === false) WP_CLI::error('Missing prospective link to ' . $target['key']);
        }
    }
}
foreach ($plan as $item) {
    $entry = $item['entry']; $post = $item['post'];
    if ($mode === 'apply') {
        if ($post) {
            $old_path = $item['old_path'];
            if ($old_path !== $entry['path'] && ! in_array($old_path, get_post_meta($post->ID, '_lenremont_previous_path'), true)) add_post_meta($post->ID, '_lenremont_previous_path', $old_path);
            // Replace only exact known URL paths; retain the existing block markup and user edits.
            $content = strtr($post->post_content, $path_replacements);
            if ($entry['key'] === 'main') $content = str_replace(array('"data-page-path":"/"', 'data-page-path="/"'), array('"data-page-path":"' . $entry['path'] . '"', 'data-page-path="' . $entry['path'] . '"'), $content);
            $id = ($post->post_name === $entry['slug'] && $content === $post->post_content) ? $post->ID : wp_update_post(wp_slash(array('ID' => $post->ID, 'post_name' => $entry['slug'], 'post_content' => $content)), true);
        } else {
            $id = wp_insert_post(wp_slash(array('post_type' => 'page', 'post_status' => 'draft', 'post_title' => $entry['title'], 'post_name' => $entry['slug'], 'post_content' => '')), true);
        }
        if (is_wp_error($id)) WP_CLI::error($id->get_error_message());
        update_post_meta($id, '_wp_page_template', 'lenremont-landing');
        update_post_meta($id, '_lenremont_source', $entry['key']);
        $post = get_post($id);
    } elseif ($mode === 'publish') {
        if ($post->post_status !== 'publish') {
            $id = wp_update_post(array('ID' => $post->ID, 'post_status' => 'publish'), true);
            if (is_wp_error($id)) WP_CLI::error($id->get_error_message());
            $post = get_post($id);
        }
        if ($post->post_name !== $entry['slug']) WP_CLI::error('Unexpected slug after publication.');
    }
    $result[] = array('key' => $entry['key'], 'id' => $post ? $post->ID : null, 'previous_path' => $item['old_path'], 'path' => $entry['path'], 'status' => $post ? $post->post_status : 'create draft');
}
WP_CLI::line(wp_json_encode(array('time' => gmdate('c'), 'mode' => $mode, 'site' => home_url(), 'pages' => $result), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
