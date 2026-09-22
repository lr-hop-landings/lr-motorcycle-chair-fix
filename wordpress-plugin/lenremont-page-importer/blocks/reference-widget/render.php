<?php
/** Render only templates shipped with this plugin; never markup from the JSON. */
if (! defined('ABSPATH')) { exit; }
$widget = $attributes['widget'] ?? '';
if ($widget === 'dynamic-map' && function_exists('do_shortcode')) {
    echo do_shortcode('[lenremont_workshops_map]');
    return;
}
if (! in_array($widget, array('contact-dialog', 'callback', 'callback-motocikly', 'callback-skutery', 'callback-kvadrocikly', 'callback-baggi', 'callback-pitbajki', 'callback-enduro', 'callback-choppery', 'callback-mototurizm', 'mobile-bar'), true)) { return; }
$template = __DIR__ . '/templates/' . $widget . '.html';
if (is_readable($template)) { readfile($template); }
