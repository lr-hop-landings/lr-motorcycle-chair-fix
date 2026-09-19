<?php
/** Native, unsynced Gutenberg pattern definitions. No database writes. */
declare(strict_types=1);

if (! defined('ABSPATH')) {
	exit;
}

$block = static function (string $name, array $attributes, string $html): string {
	return get_comment_delimited_block_content('core/' . $name, $attributes, $html);
};
$group = static function (string $classes, string $content, string $anchor = '', string $name = '') use ($block): string {
	$attributes = array('className' => $classes, 'layout' => array('type' => 'default'));
	$is_page = 'lr-ai-page' === $classes;
	if ($is_page) $attributes['align'] = 'full';
	if (! $name && false !== strpos($classes, 'lr-ai-grid')) $name = 'Сетка карточек';
	if ($name) $attributes['metadata'] = array('name' => $name);
	if ($anchor) $attributes['anchor'] = $anchor;
	return $block('group', $attributes, '<div' . ($anchor ? ' id="' . esc_attr($anchor) . '"' : '') . ' class="wp-block-group ' . ($is_page ? 'alignfull ' : '') . esc_attr($classes) . '">' . $content . '</div>');
};
$p = static function (string $text, string $classes = '') use ($block): string {
	return $block('paragraph', $classes ? array('className' => $classes) : array(), '<p' . ($classes ? ' class="' . esc_attr($classes) . '"' : '') . '>' . esc_html($text) . '</p>');
};
$h = static function (string $text, int $level = 2) use ($block): string {
	return $block('heading', array('level' => $level), '<h' . $level . ' class="wp-block-heading">' . esc_html($text) . '</h' . $level . '>');
};
$button = static function (string $text, string $url, string $variant = '') use ($block): string {
	$class = 'lr-ai-button' . ($variant ? ' lr-ai-button--' . $variant : '');
	return $block('button', array('className' => $class), '<div class="wp-block-button ' . esc_attr($class) . '"><a class="wp-block-button__link wp-element-button" href="' . esc_url($url) . '">' . esc_html($text) . '</a></div>');
};
$buttons = static function (string $content) use ($block): string {
	return $block('buttons', array('className' => 'lr-ai-buttons'), '<div class="wp-block-buttons lr-ai-buttons">' . $content . '</div>');
};
$section = static function (string $title, string $content, string $variant = '', string $anchor = '', string $name = '') use ($group, $h): string {
	return $group('lr-ai-section' . ($variant ? ' lr-ai-' . $variant : ''), $group('lr-ai-container lr-ai-stack', ($title ? $h($title) : '') . $content, '', 'Содержимое секции'), $anchor, $name ?: ($title ?: 'Первый экран'));
};
$card = static function (string $title, string $text, string $extra = '') use ($group, $h, $p): string {
	return $group('lr-ai-card lr-ai-stack', $h($title, 3) . $p($text) . $extra, '', $title);
};

$parts = array();
$parts['hero'] = $section('', $group('lr-ai-grid lr-ai-grid--two lr-ai-hero-grid',
	$group('lr-ai-stack', $p('Ленремонт · Ваша услуга', 'lr-ai-eyebrow') . $h('Название услуги и понятный результат', 1)
		. $p('Расскажите, кому подходит услуга и какую задачу вы решаете. Укажите только подтверждённые условия.', 'lr-ai-lead')
		. $buttons($button('Обсудить задачу', '#lr-ai-contact') . $button('Как проходит работа', '#lr-ai-process', 'outline')))
	. $group('lr-ai-card lr-ai-stack', $block('image', array('className' => 'lr-ai-media'), '<figure class="wp-block-image lr-ai-media"><img alt=""/></figure>') . $p('Добавьте фотографию услуги через блок «Изображение».', 'lr-ai-small lr-ai-muted'))), 'dark');

$parts['advantages'] = $section('Почему обращаются к нам', $group('lr-ai-grid',
	$card('Преимущество 1', 'Добавьте конкретное преимущество и подтверждение.')
	. $card('Преимущество 2', 'Объясните, что это даёт клиенту.')
	. $card('Преимущество 3', 'Укажите фактическое условие вашей услуги.')));

$parts['services'] = $section('Что мы делаем', $group('lr-ai-grid',
	$card('Услуга 1', 'Опишите состав работ.', $buttons($button('Обсудить услугу', '#lr-ai-contact')))
	. $card('Услуга 2', 'Укажите подходящую задачу клиента.', $buttons($button('Обсудить услугу', '#lr-ai-contact')))
	. $card('Услуга 3', 'Опишите результат работы.', $buttons($button('Обсудить услугу', '#lr-ai-contact')))), 'soft');

$parts['prices'] = $section('Стоимость работ', $p('Укажите актуальные цены, состав работ и условия расчёта.', 'lr-ai-muted')
	. $group('lr-ai-grid',
		$card('Работа 1', 'Что входит в стоимость.', $p('Укажите цену', 'lr-ai-price'))
		. $card('Работа 2', 'Какие материалы учитываются.', $p('Укажите цену', 'lr-ai-price'))
		. $card('Работа 3', 'Когда потребуется отдельная оценка.', $p('Укажите цену', 'lr-ai-price'))));

$parts['process'] = $section('Как проходит работа', $group('lr-ai-grid lr-ai-grid--four',
	$card('01 · Обращение', 'Как передать описание задачи.')
	. $card('02 · Оценка', 'Как определяются объём и стоимость.')
	. $card('03 · Выполнение', 'Как согласуются работы и сроки.')
	. $card('04 · Результат', 'Как принимается работа.')), 'dark', 'lr-ai-process');

$quote = $block('quote', array('className' => 'lr-ai-review'), '<blockquote class="wp-block-quote lr-ai-review">'
	. $p('Место для подлинного отзыва клиента. Перед публикацией замените текст и укажите источник.')
	. '<cite>Имя клиента · источник отзыва</cite></blockquote>');
$parts['reviews'] = $section('Отзывы клиентов', $group('lr-ai-grid lr-ai-grid--two', $group('lr-ai-card', $quote) . $group('lr-ai-card', $quote)), 'soft');

$faq = '';
foreach (array('Как узнать стоимость?', 'Какие сроки выполнения?', 'Какие условия гарантии?') as $question) {
	$faq .= $block('details', array('className' => 'lr-ai-faq'), '<details class="wp-block-details lr-ai-faq"><summary>' . esc_html($question) . '</summary>'
		. $p('Добавьте точный ответ для этой услуги. Не указывайте неподтверждённые обещания.') . '</details>');
}
$parts['faq'] = $section('Частые вопросы', $group('lr-ai-stack', $faq));
$parts['contact'] = $section('Обсудим вашу задачу', $p('Расскажите, что нужно сделать. Добавьте сюда подтверждённые контакты или подключённую форму сайта.', 'lr-ai-lead')
	. $buttons($button('Позвонить: +7 (812) 344-44-44', 'tel:+78123444444')), 'dark', 'lr-ai-contact');

$image = $block('image', array('className' => 'lr-ai-media'), '<figure class="wp-block-image lr-ai-media"><img alt=""/></figure>');
$parts['text-image'] = $section('Подробнее об услуге', $group('lr-ai-grid lr-ai-grid--two lr-ai-hero-grid',
	$group('lr-ai-stack', $p('Расскажите, с какими задачами работаете и кому подходит услуга.') . $p('Добавьте важные детали: материалы, ограничения и порядок согласования.'))
	. $group('lr-ai-stack', $image . $p('Замените изображение и заполните альтернативный текст.', 'lr-ai-small lr-ai-muted'))));
$parts['gallery'] = $section('Примеры работ', $p('Добавьте реальные фотографии и подписи. Карточки можно дублировать.', 'lr-ai-muted')
	. $group('lr-ai-grid', $group('lr-ai-card lr-ai-stack', $image . $h('Работа 1', 3) . $p('Задача и результат.'))
		. $group('lr-ai-card lr-ai-stack', $image . $h('Работа 2', 3) . $p('Материалы и особенности.'))
		. $group('lr-ai-card lr-ai-stack', $image . $h('Работа 3', 3) . $p('Что было сделано.'))), 'soft');
$parts['cta'] = $section('Нужна помощь с выбором?', $p('Опишите следующий шаг для клиента.', 'lr-ai-lead')
	. $buttons($button('Связаться с нами', '#lr-ai-contact')), 'dark');
$parts['text'] = $section('Что важно знать', $group('lr-ai-prose lr-ai-stack', $p('Добавьте полезную информацию об услуге. Разбейте длинный текст на короткие абзацы.')
	. $h('Дополнительная информация', 3) . $p('Здесь можно описать условия, ограничения или рекомендации.')));

$titles = array('hero' => 'Первый экран', 'advantages' => 'Преимущества', 'services' => 'Карточки услуг', 'prices' => 'Цены', 'process' => 'Этапы работы', 'reviews' => 'Отзывы', 'faq' => 'Вопросы и ответы', 'contact' => 'Контакты', 'text-image' => 'Текст с изображением', 'gallery' => 'Галерея работ', 'cta' => 'Призыв к действию', 'text' => 'Текстовая секция');
$descriptions = array(
	'hero' => 'Заголовок, описание, две кнопки и фотография. Обычно используется один раз в начале страницы.',
	'advantages' => 'Три карточки преимуществ. Меняйте тексты, добавляйте или удаляйте карточки.',
	'services' => 'Три услуги с описаниями и кнопками. Настройте ссылки на услуги или контакты.',
	'prices' => 'Карточки стоимости и условий. Укажите реальные цены перед публикацией.',
	'process' => 'Четыре этапа работы на тёмном фоне. Количество этапов можно изменить.',
	'reviews' => 'Две карточки отзывов. Замените примеры подлинными отзывами с источниками.',
	'faq' => 'Три раскрывающихся вопроса. Можно дублировать вопросы или добавлять их из раздела «Элементы».',
	'contact' => 'Заголовок, описание и кнопка звонка. Проверьте номер и при необходимости добавьте форму сайта.',
	'text-image' => 'Две колонки: текст и заменяемая фотография. На телефоне располагаются друг под другом.',
	'gallery' => 'Три фотографии с подписями. Заменяйте изображения через медиатеку Gutenberg.',
	'cta' => 'Короткий призыв к действию с кнопкой. По умолчанию ведёт к секции контактов.',
	'text' => 'Заголовок, абзацы и подзаголовок с удобной шириной чтения.',
);
$patterns = array();
$patterns['ai-page'] = array(
	'title' => 'Ленремонт · Страница услуги',
	'description' => 'Начните с этой страницы, затем замените тексты и изображение. Удалите неподходящие секции. Все данные-примеры нужно проверить до публикации.',
	'categories' => array('lr-ai-pages'),
	'content' => $group('lr-ai-page', implode("\n", array_intersect_key($parts, array_flip(array('hero', 'advantages', 'services', 'prices', 'process', 'reviews', 'faq', 'contact')))), 'hop-gutenberg', 'Страница Ленремонт'),
	'viewportWidth' => 1280,
);
foreach ($parts as $slug => $content) {
	$patterns['ai-' . $slug] = array(
		'title' => 'Ленремонт · ' . $titles[$slug],
		'description' => $descriptions[$slug],
		'categories' => array('lr-ai-sections'),
		'content' => $content,
		'viewportWidth' => 1280,
		'keywords' => array($titles[$slug], 'Ленремонт', 'секция'),
	);
}
$patterns['ai-buttons'] = array(
	'title' => 'Ленремонт · Кнопки',
	'description' => 'Основная и контурная кнопки. Выберите группу для вставки и настройте ссылки.',
	'categories' => array('lr-ai-elements'),
	'content' => $buttons($button('Основное действие', '#lr-ai-contact') . $button('Второе действие', '#lr-ai-process', 'outline')),
);
$patterns['ai-card'] = array(
	'title' => 'Ленремонт · Карточка', 'description' => 'Вставьте в выбранную сетку или секцию. Измените заголовок и описание.',
	'categories' => array('lr-ai-elements'), 'content' => $card('Заголовок карточки', 'Короткое описание.'),
);
$patterns['ai-faq-item'] = array(
	'title' => 'Ленремонт · Один вопрос', 'description' => 'Отдельный раскрывающийся вопрос для секции FAQ.',
	'categories' => array('lr-ai-elements'), 'content' => $block('details', array('className' => 'lr-ai-faq'), '<details class="wp-block-details lr-ai-faq"><summary>Ваш вопрос</summary>' . $p('Ваш ответ.') . '</details>'),
);
$patterns['ai-empty-page'] = array(
	'title' => 'Ленремонт · Пустая страница', 'description' => 'Один контейнер для сборки страницы. Добавляйте секции через «Библиотека Ленремонт».',
	'categories' => array('lr-ai-pages'), 'content' => $group('lr-ai-page', '', 'hop-gutenberg', 'Страница Ленремонт'),
);
return array_merge($patterns, require __DIR__ . '/library-variants.php');
