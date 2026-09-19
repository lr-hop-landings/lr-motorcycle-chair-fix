<?php
/** @var array<string, mixed> $attributes */

if (! defined('ABSPATH')) {
	exit;
}

$title      = isset($attributes['title']) ? (string) $attributes['title'] : '';
$before_url = isset($attributes['beforeUrl']) ? esc_url($attributes['beforeUrl']) : '';
$after_url  = isset($attributes['afterUrl']) ? esc_url($attributes['afterUrl']) : '';
$before_alt = isset($attributes['beforeAlt']) ? (string) $attributes['beforeAlt'] : '';
$after_alt  = isset($attributes['afterAlt']) ? (string) $attributes['afterAlt'] : '';
?>
<figure <?php echo get_block_wrapper_attributes(array('class' => 'lr-before-after')); ?> data-lr-before-after style="--lr-compare: 50%;">
	<?php if ('' !== $title) : ?>
		<figcaption><?php echo esc_html($title); ?></figcaption>
	<?php endif; ?>
	<div class="lr-before-after__stage">
		<?php if ('' !== $after_url) : ?>
			<img class="lr-before-after__image" src="<?php echo esc_url($after_url); ?>" alt="<?php echo esc_attr($after_alt); ?>">
		<?php endif; ?>
		<?php if ('' !== $before_url) : ?>
			<div class="lr-before-after__before"><img class="lr-before-after__image" src="<?php echo esc_url($before_url); ?>" alt="<?php echo esc_attr($before_alt); ?>"></div>
		<?php endif; ?>
		<span class="lr-before-after__label lr-before-after__label--before">До</span>
		<span class="lr-before-after__label lr-before-after__label--after">После</span>
		<span class="lr-before-after__divider" aria-hidden="true"></span>
		<input class="lr-before-after__range" type="range" min="0" max="100" value="50" aria-label="Сравнить фотографии до и после">
	</div>
</figure>
