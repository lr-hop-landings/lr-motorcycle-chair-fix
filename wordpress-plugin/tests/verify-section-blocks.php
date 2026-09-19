<?php
if (wp_parse_url(home_url(), PHP_URL_HOST) !== 'testing-gutenberg.local' || is_multisite()) throw new RuntimeException('Local only.');
$posts = get_posts(array('post_type'=>'page', 'post_status'=>'draft', 'meta_key'=>'_lr_block_library_demo', 'meta_value'=>'0.12.0'));
if (count($posts) !== 1) throw new RuntimeException('Missing unique test draft.');
$post = $posts[0];
$roots = array_values(array_filter(parse_blocks($post->post_content), static function($b) { return !empty($b['blockName']); }));
if (count($roots) !== 1 || ($roots[0]['attrs']['anchor'] ?? '') !== 'hop-gutenberg') throw new RuntimeException('Invalid root.');
$main = array_values(array_filter($roots[0]['innerBlocks'], static function($b) { return ($b['attrs']['tagName'] ?? '') === 'main'; }))[0];
$expected = array('hero-main','prices','faq','contact');
foreach ($main['innerBlocks'] as $i=>$block) {
    if ($block['blockName'] !== 'lenremont/section-' . ($expected[$i] ?? '') || count($block['innerBlocks']) !== 1) throw new RuntimeException('Unexpected section or missing content.');
    if (!WP_Block_Type_Registry::get_instance()->is_registered($block['blockName'])) throw new RuntimeException('Unregistered section.');
}
if (count($main['innerBlocks']) !== 4) throw new RuntimeException('Wrong section count.');
$html = do_blocks($post->post_content);
foreach (array('hop-gutenberg','hero-title','quiz-app','cost','faq','contact','contact-dialog','callback') as $id) {
    if (substr_count($html, 'id="'.$id.'"') !== 1) throw new RuntimeException('ID count: '.$id);
}
if (strpos($html, 'lr-source-section-editor') !== false) throw new RuntimeException('Editor wrapper leaked.');
foreach (array('element','text','art','picture','reference-widget','reference-quiz','quiz','before-after','lead-form') as $name) {
    if (WP_Block_Type_Registry::get_instance()->get_registered('lenremont/'.$name)->supports['inserter'] !== false) throw new RuntimeException('Helper visible.');
}
echo "PASS four standalone sections, saved children, one root, unique IDs, no frontend wrapper, helpers hidden.\n";
