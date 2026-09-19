<?php
/** Dynamic quiz; escaping here also protects manifests authored outside Gutenberg. */
if (! defined('ABSPATH')) exit;
$text = static function ($value): string { return is_scalar($value) ? sanitize_text_field((string) $value) : ''; };
$questions = array();
foreach (array_slice(is_array($attributes['questions'] ?? null) ? $attributes['questions'] : array(), 0, 8) as $item) {
	if (! is_array($item)) continue;
	$title = $text($item['title'] ?? '');
	$options = array_values(array_filter(array_map($text, array_slice(is_array($item['options'] ?? null) ? $item['options'] : array(), 0, 12)), static function ($s) { return '' !== $s; }));
	if ($title && count($options) >= 2) $questions[] = array('title' => $title, 'options' => $options);
}
$variant = 'cards' === ($attributes['variant'] ?? '') ? 'cards' : 'list';
$service = $text($attributes['service'] ?? '');
?>
<div <?php echo get_block_wrapper_attributes(array('class' => 'lr-ai-quiz lr-ai-quiz--' . $variant)); ?> data-lr-service-quiz data-lead-root>
	<h2><?php echo esc_html($text($attributes['title'] ?? '')); ?></h2>
	<p class="lr-ai-muted"><?php echo esc_html($text($attributes['intro'] ?? '')); ?></p>
	<?php if ($questions) : ?>
	<div data-lr-service-ui hidden>
		<p class="lr-ai-quiz-progress" data-lr-service-progress role="status"></p>
		<div data-lr-service-panels>
		<?php foreach ($questions as $index => $question) : ?>
			<div data-lr-service-step="<?php echo (int) $index; ?>" hidden>
				<h3 tabindex="-1"><?php echo esc_html($question['title']); ?></h3>
				<div class="lr-ai-quiz-options">
				<?php foreach ($question['options'] as $option) : ?>
					<button type="button" class="lr-ai-quiz-option" data-lr-service-option aria-pressed="false"><?php echo esc_html($option); ?></button>
				<?php endforeach; ?>
				</div>
			</div>
		<?php endforeach; ?>
		<div data-lr-service-result hidden>
			<h3 tabindex="-1"><?php echo esc_html($text($attributes['resultTitle'] ?? '')); ?></h3>
			<dl class="lr-ai-quiz-summary" data-lr-service-summary></dl>
			<p>Оставьте телефон, чтобы обсудить задачу. Ответы не являются расчётом стоимости.</p>
			<form data-hop-lead-form data-lr-service-form>
				<input type="hidden" name="service_name" value="<?php echo esc_attr($service); ?>">
				<input type="hidden" name="cta_source" value="library-service-quiz">
				<input type="hidden" name="task_type" value="">
				<input type="hidden" name="task_detail" value="">
				<input type="hidden" name="page_path" value="">
				<input type="hidden" name="contact_method" value="Телефон">
				<label class="lr-ai-quiz-phone">Телефон<input type="tel" name="phone" autocomplete="tel" inputmode="tel" placeholder="+7 (___) ___-__-__" required></label>
				<label class="lr-ai-quiz-consent"><input type="checkbox" name="privacy_consent" value="1" required><span>Согласен на обработку персональных данных по <a href="https://www.lenremont.ru/politika-obrabotki-personalnyh-dannyh.htm" target="_blank" rel="noopener noreferrer">политике конфиденциальности</a></span></label>
				<button type="submit" class="lr-ai-quiz-submit"><?php echo esc_html($text($attributes['buttonLabel'] ?? 'Связаться со мной')); ?></button>
				<p data-lr-service-status role="status" hidden></p>
			</form>
			<div data-lead-success hidden role="status">Заявка отправлена. Мы свяжемся с вами.</div>
		</div>
		</div>
		<div class="lr-ai-quiz-nav"><button type="button" data-lr-service-back hidden>Назад</button><button type="button" data-lr-service-reset hidden>Начать заново</button></div>
	</div>
	<?php endif; ?>
	<p data-lr-service-fallback>Можно обсудить задачу по телефону: <a href="tel:+78123444444">+7 (812) 344-44-44</a>.</p>
</div>
