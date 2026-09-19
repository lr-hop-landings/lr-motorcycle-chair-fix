<?php
/** Read-only tests; run via wp eval-file on the named local site. */
if (wp_parse_url(home_url(), PHP_URL_HOST) !== 'testing-gutenberg.local') throw new RuntimeException('Local only');
$check = static function ($condition, $message) { if (! $condition) throw new RuntimeException($message); echo "PASS $message\n"; };
$patterns = require LENREMONT_PAGE_IMPORTER_DIR . 'patterns/design-system.php';
$check(count($patterns) === 37, '37 library patterns');
foreach ($patterns as $slug => $pattern) $check('' !== do_blocks($pattern['content']), 'render ' . $slug);
$html = do_blocks('<!-- wp:lenremont/service-quiz /-->');
$check(substr_count($html, 'data-lr-service-step=') === 3, 'three default questions');
$check(strpos($html, 'data-hop-lead-form') !== false && strpos($html, 'data-lead-root') !== false, 'HOP contract');
$check(strpos($html, 'data-lead-success hidden') !== false, 'success hidden until external handler');
$check(wp_script_is('lenremont-service-quiz-view', 'enqueued'), 'view script enqueued on render');
$hostile = get_comment_delimited_block_content('lenremont/service-quiz', array('title' => '<script>alert(1)</script>', 'variant' => '" onmouseover="alert(1)', 'questions' => array(array('title' => 'Question', 'options' => array('0', '<img src=x onerror=alert(1)>Text', array('bad'))), array('title' => 'Invalid', 'options' => array('One')), 'bad')), '');
$safe = do_blocks($hostile);
$check(strpos($safe, '<script>') === false && strpos($safe, '<img ') === false && strpos($safe, 'onmouseover') === false, 'escaped malformed external attributes');
$check(substr_count($safe, 'data-lr-service-step=') === 1 && strpos($safe, '>0</button>') !== false, 'incomplete questions filtered; zero answer preserved');
$many = get_comment_delimited_block_content('lenremont/service-quiz', array('questions' => array_fill(0, 20, array('title' => 'Q', 'options' => array_fill(0, 20, 'Option')))), '');
$bounded = do_blocks($many);
$check(substr_count($bounded, 'data-lr-service-step=') === 8 && substr_count($bounded, 'data-lr-service-option') === 96, 'bounded questions and options');
