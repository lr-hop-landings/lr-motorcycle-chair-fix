<?php
/** @var array<string, mixed> $attributes */

if (! defined('ABSPATH')) {
	exit;
}

$title   = isset($attributes['title']) ? (string) $attributes['title'] : '';
$text    = isset($attributes['text']) ? (string) $attributes['text'] : '';
$service = isset($attributes['service']) ? (string) $attributes['service'] : '';
$button  = isset($attributes['buttonLabel']) ? (string) $attributes['buttonLabel'] : 'Отправить';
?>
<section <?php echo get_block_wrapper_attributes(array('class' => 'lr-interactive-card lr-contact-form')); ?>>
	<?php if ('' !== $title) : ?>
		<h2 class="lr-interactive-card__title"><?php echo esc_html($title); ?></h2>
	<?php endif; ?>
	<?php if ('' !== $text) : ?>
		<p class="lr-interactive-card__intro"><?php echo esc_html($text); ?></p>
	<?php endif; ?>
	<form class="lr-lead-form" data-lr-lead-form data-service="<?php echo esc_attr($service); ?>">
		<label>Имя<input type="text" name="name" autocomplete="name"></label>
		<label>Телефон<input type="tel" name="phone" autocomplete="tel" placeholder="+7 (___) ___-__-__" required></label>
		<input type="hidden" name="service" value="<?php echo esc_attr($service); ?>">
		<label class="lr-consent"><input type="checkbox" name="privacy_consent" value="1" required> <span>Согласен на обработку персональных данных</span></label>
		<button class="lr-submit" type="submit"><?php echo esc_html($button); ?></button>
		<p class="lr-form-status" data-lr-form-status role="status" hidden></p>
	</form>
</section>
