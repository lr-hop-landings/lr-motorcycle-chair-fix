<?php
/** Render only templates shipped with this plugin; never markup from the JSON. */
if (! defined('ABSPATH')) { exit; }
$widget = $attributes['widget'] ?? '';
if (! in_array($widget, array('contact-dialog', 'callback', 'callback-motocikly', 'callback-skutery', 'callback-kvadrocikly', 'callback-baggi', 'mobile-bar'), true)) { return; }
$template = __DIR__ . '/templates/' . $widget . '.html';
if (is_readable($template)) { readfile($template); }
