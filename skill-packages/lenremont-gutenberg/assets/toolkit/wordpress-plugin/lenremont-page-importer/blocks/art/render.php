<?php
if (! defined('ABSPATH')) { exit; }
$art = json_decode((string) file_get_contents(LENREMONT_PAGE_IMPORTER_DIR . 'assets/reference/art.json'), true);
$key = $attributes['asset'] ?? '';
// SVG markup is a trusted build asset. An import can only select an existing key.
if (is_string($key) && isset($art[$key])) { echo $art[$key]; }
