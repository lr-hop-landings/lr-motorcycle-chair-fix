<?php
// Read-only verification of local demo drafts created for 0.11.0.
if ( wp_parse_url( home_url(), PHP_URL_HOST ) !== 'testing-gutenberg.local' || is_multisite() ) {
    WP_CLI::error( 'Local single-site test only.' );
}
foreach ( array( '0.11.0' => 13, '0.11.0-partial' => 3 ) as $marker => $expected ) {
    $posts = get_posts( array( 'post_type' => 'page', 'post_status' => 'draft', 'meta_key' => '_lr_block_library_demo', 'meta_value' => $marker ) );
    if ( count( $posts ) !== 1 ) WP_CLI::error( 'Missing unique demo: ' . $marker );
    $post = $posts[0];
    $blocks = array_values( array_filter( parse_blocks( $post->post_content ), static function ( $b ) { return ! empty( $b['blockName'] ); } ) );
    $root = $blocks[0];
    if ( count( $blocks ) !== 1 || ( $root['attrs']['anchor'] ?? '' ) !== 'hop-gutenberg' || strpos( $root['attrs']['className'] ?? '', 'lr-reference-library' ) === false ) WP_CLI::error( 'Invalid root.' );
    $main = array_values( array_filter( $root['innerBlocks'], static function ( $b ) { return ( $b['attrs']['tagName'] ?? '' ) === 'main'; } ) );
    if ( count( $main ) !== 1 || count( $main[0]['innerBlocks'] ) !== $expected ) WP_CLI::error( 'Section count mismatch.' );
    $html = do_blocks( $post->post_content );
    foreach ( array( 'hop-gutenberg', 'contact-dialog', 'callback' ) as $id ) {
        if ( substr_count( $html, 'id="' . $id . '"' ) !== 1 ) WP_CLI::error( 'Missing or duplicate ID: ' . $id );
    }
    if ( has_block( 'lenremont/reference-quiz', $post ) !== ( $expected === 13 ) ) WP_CLI::error( 'Unexpected quiz presence.' );
    WP_CLI::log( 'PASS draft ' . $post->ID . ': ' . $expected . ' sections, one root and shared dialogs.' );
}
