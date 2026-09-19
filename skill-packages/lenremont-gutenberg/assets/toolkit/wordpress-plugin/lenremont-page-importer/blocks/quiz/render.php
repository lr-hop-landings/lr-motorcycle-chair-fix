<?php
/** @var array<string, mixed> $attributes */

if (! defined('ABSPATH')) {
	exit;
}

$title   = isset($attributes['title']) ? (string) $attributes['title'] : '';
$intro   = isset($attributes['intro']) ? (string) $attributes['intro'] : '';
$service = isset($attributes['service']) ? (string) $attributes['service'] : '';
$flow = isset($attributes['flow']) && is_array($attributes['flow']) ? $attributes['flow'] : array();
$options = isset($attributes['options']) && is_array($attributes['options'])
	? array_values(array_filter(array_map('strval', $attributes['options'])))
	: array();
?>
<section <?php echo get_block_wrapper_attributes(array('class' => 'lr-interactive-card lr-quiz')); ?> data-lr-quiz data-lr-flow="<?php echo esc_attr(wp_json_encode($flow)); ?>">
	<?php if (! empty($flow['branches'])) : ?>
		<p class="lr-quiz-progress" data-lr-quiz-progress aria-live="polite">Вопрос 1 из 4</p>
	<?php endif; ?>
	<div data-lr-quiz-question>
		<?php if ('' !== $title) : ?>
			<h2 class="lr-interactive-card__title"><?php echo esc_html($title); ?></h2>
		<?php endif; ?>
		<?php if ('' !== $intro) : ?>
			<p class="lr-interactive-card__intro"><?php echo esc_html($intro); ?></p>
		<?php endif; ?>
		<div class="lr-choice-list">
			<?php foreach ($options as $option) : ?>
				<button class="lr-choice" type="button" data-lr-quiz-choice data-choice="<?php echo esc_attr($option); ?>">
					<span><?php echo esc_html($option); ?></span><span aria-hidden="true">→</span>
				</button>
			<?php endforeach; ?>
		</div>
	</div>
	<div data-lr-quiz-result hidden>
		<p class="lr-eyebrow">Ваш выбор</p>
		<h3 data-lr-quiz-answer></h3>
		<p>Оставьте телефон — специалист уточнит детали и подскажет следующий шаг.</p>
		<form class="lr-lead-form" data-lr-lead-form data-service="<?php echo esc_attr($service); ?>">
			<label>Телефон<input type="tel" name="phone" autocomplete="tel" placeholder="+7 (___) ___-__-__" required></label>
			<input type="hidden" name="service" value="<?php echo esc_attr($service); ?>">
			<input type="hidden" name="quiz_answer" value="" data-lr-quiz-answer-input>
			<label class="lr-consent"><input type="checkbox" name="privacy_consent" value="1" required> <span>Согласен на обработку персональных данных по <a href="https://www.lenremont.ru/politika-obrabotki-personalnyh-dannyh.htm" target="_blank" rel="noopener noreferrer">политике конфиденциальности</a></span></label>
			<button class="lr-submit" type="submit">Обсудить задачу</button>
			<p class="lr-form-status" data-lr-form-status role="status" hidden></p>
		</form>
		<button class="lr-text-button" type="button" data-lr-quiz-back>Изменить ответ</button>
	</div>
</section>
