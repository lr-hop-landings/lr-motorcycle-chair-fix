<?php
/** Read-only local assertions for the real saved demo. */
if (wp_parse_url(home_url(), PHP_URL_HOST) !== 'testing-gutenberg.local') throw new RuntimeException('Local only');
$patterns = WP_Block_Patterns_Registry::get_instance()->get_all_registered();
$ours = array_filter($patterns, static function ($p) { return 0 === strpos($p['name'], 'lenremont/ai-'); });
if (count($ours) < 17) throw new RuntimeException('Expected at least 17 patterns');
$post = get_post(38);
if (! $post || 'draft' !== $post->post_status || '0.9.0' !== get_post_meta(38, '_lr_block_library_demo', true)) throw new RuntimeException('Wrong fixture');
$blocks = array_values(array_filter(parse_blocks($post->post_content), static function ($b) { return ! empty($b['blockName']); }));
if (count($blocks) !== 1 || 'hop-gutenberg' !== ($blocks[0]['attrs']['anchor'] ?? '') || count($blocks[0]['innerBlocks']) !== 12) throw new RuntimeException('Wrong root/section count');
if (false === strpos($post->post_content, 'Ваша услуга — страница из готовых блоков')) throw new RuntimeException('Edited heading not saved');
if (false === strpos($post->post_content, 'lr-ai-soft lr-ai-compact')) throw new RuntimeException('Section options not saved');
$html = do_blocks($post->post_content);
if (substr_count($html, 'id="hop-gutenberg"') !== 1) throw new RuntimeException('Duplicate root');
echo 'PASS ' . count($ours) . " patterns, saved draft 38, 12 sections, edited heading, section options, one root.\n";
