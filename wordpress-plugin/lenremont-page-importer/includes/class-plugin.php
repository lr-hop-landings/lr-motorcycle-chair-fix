<?php

declare(strict_types=1);

namespace Lenremont\PageImporter;

final class Plugin {
	private const VERSION = '0.14.0';

	private static ?self $instance = null;

	public static function instance(): self {
		if (null === self::$instance) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	private function __construct() {}

	public function register_hooks(): void {
		add_action('init', array($this, 'register_blocks'));
		add_action('init', array($this, 'register_design_patterns'), 20);
		add_action('enqueue_block_editor_assets', array($this, 'enqueue_editor_assets'));
		add_action('enqueue_block_assets', array($this, 'enqueue_canvas_assets'));
		add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_assets'), 100);
		add_filter('render_block', array($this, 'ensure_landing_root_id'), 10, 2);
		add_filter('render_block_data', array($this, 'mark_reference_tree'), 20);
		add_filter('render_block_core/group', array($this, 'restore_reference_structure'), 11, 2);
		add_filter('get_block_templates', array($this, 'normalize_registered_template_keys'));
		add_action('template_redirect', array($this, 'redirect_previous_landing_path'), 1);
	}

	/** Runtime-only marker: never changes saved blocks or unrelated page groups. */
	public function mark_reference_tree(array $block): array {
		if (! empty($block['_lr_reference_tree'])) return $block;
		if ('core/group' !== ($block['blockName'] ?? '') || ! preg_match('/(?:^|\s)(?:lr-reference|lr-ai-page)(?:\s|$)/', $block['attrs']['className'] ?? '')) return $block;
		$mark = static function (array $node) use (&$mark): array {
			$node['_lr_reference_tree'] = true;
			$node['innerBlocks'] = array_map($mark, $node['innerBlocks'] ?? array());
			return $node;
		};
		return $mark($block);
	}

	/** Undo only the compatibility wrapper Core adds for classic themes. */
	public function restore_reference_structure(string $html, array $block): string {
		if (empty($block['_lr_reference_tree'])) return $html;
		// An explicitly saved legacy wrapper belongs to the author; leave it intact.
		if (false !== strpos($block['innerHTML'] ?? '', 'wp-block-group__inner-container')) return $html;
		$tag = preg_quote($block['attrs']['tagName'] ?? 'div', '~');
		$pattern = '~^(\s*<' . $tag . '\b[^>]*>)\s*(<div\s+class="[^"]*\bwp-block-group__inner-container\b[^"]*">)(.*)</div>\s*(</' . $tag . '>\s*)$~s';
		if (! preg_match($pattern, $html, $parts)) return $html;
		$outer = new \WP_HTML_Tag_Processor($parts[1]);
		$inner = new \WP_HTML_Tag_Processor($parts[2]);
		if (! $outer->next_tag() || ! $inner->next_tag()) return $html;
		foreach ($inner->class_list() as $class) {
			if (false !== strpos($class, 'is-layout-')) $outer->add_class($class);
		}
		return $outer->get_updated_html() . $parts[3] . $parts[4];
	}

	/**
	 * Keep pages imported with older plugin versions compatible with the
	 * isolated stylesheet until they are saved again in Gutenberg.
	 */
	public function ensure_landing_root_id(string $block_content, array $block): string {
		if ('core/group' !== ($block['blockName'] ?? '')) {
			return $block_content;
		}

		$class_name = (string) ($block['attrs']['className'] ?? '');
		if (! preg_match('/(?:^|\\s)(?:lr-reference|lr-imported-page)(?:\\s|$)/', $class_name)) {
			return $block_content;
		}

		$processor = new \WP_HTML_Tag_Processor($block_content);
		if ($processor->next_tag()) {
			$processor->set_attribute('id', 'hop-gutenberg');
			return $processor->get_updated_html();
		}

		return $block_content;
	}

	public function redirect_previous_landing_path(): void {
		if (! is_404() || ! in_array($_SERVER['REQUEST_METHOD'] ?? '', array('GET', 'HEAD'), true)) return;
		$path = rawurldecode((string) wp_parse_url(wp_unslash($_SERVER['REQUEST_URI'] ?? ''), PHP_URL_PATH));
		$pages = get_posts(array('post_type' => 'page', 'post_status' => 'publish', 'posts_per_page' => 1, 'meta_key' => '_lenremont_previous_path', 'meta_value' => $path));
		if ($pages && has_block('lenremont/reference-quiz', $pages[0])) {
			wp_safe_redirect(get_permalink($pages[0]), 301, 'Lenremont Page Importer');
			exit;
		}
	}

	public function normalize_registered_template_keys(array $templates): array {
		// Core's editor reads index 0, but plugin-registered templates retain a
		// string key in get_block_templates() on the tested WordPress version.
		return isset($templates['lenremont-page-importer//lenremont-landing']) ? array_values($templates) : $templates;
	}

	public function enqueue_canvas_assets(): void {
		// Small scoped CSS also covers patterns in synced blocks, templates and archives.
		// WordPress loads enqueue_block_assets styles inside the editor iframe too.
		wp_enqueue_style('lenremont-design-system');
		if (is_admin()) {
			wp_enqueue_style('lenremont-page-importer');
			wp_enqueue_style('lenremont-page-importer-canvas', LENREMONT_PAGE_IMPORTER_URL . 'assets/canvas.css', array('lenremont-page-importer'), self::VERSION);
			wp_enqueue_style('lenremont-reference-original');
			wp_enqueue_style('lenremont-editor-content', LENREMONT_PAGE_IMPORTER_URL . 'assets/editor-content.css', array('lenremont-page-importer-canvas', 'lenremont-reference-original'), self::VERSION);
		}
	}

	public function register_blocks(): void {
		wp_register_style('lenremont-design-system', LENREMONT_PAGE_IMPORTER_URL . 'assets/design-system.css', array(), self::VERSION);
		wp_register_style('lenremont-reference-adapter', LENREMONT_PAGE_IMPORTER_URL . 'assets/reference-adapter.css', array(), self::VERSION);
		wp_register_style('lenremont-reference-original', LENREMONT_PAGE_IMPORTER_URL . 'assets/reference/original.css', array('lenremont-reference-adapter'), self::VERSION);
		wp_register_script('lenremont-reference-blocks', LENREMONT_PAGE_IMPORTER_URL . 'assets/reference-blocks.js', array('wp-blocks', 'wp-block-editor', 'wp-element', 'wp-components'), self::VERSION, true);
		$object = array('type' => 'object', 'default' => array());
		$string = array('type' => 'string', 'default' => '');
		foreach (array(
			'element' => array('tag' => array('type' => 'string', 'default' => 'div'), 'attributes' => $object),
			'text' => array('tag' => array('type' => 'string', 'default' => 'span'), 'raw' => array('type' => 'boolean', 'default' => false), 'text' => $string, 'attributes' => $object),
			'picture' => array('attributes' => $object),
			'reference-quiz' => array('attributes' => $object),
			'art' => array('asset' => $string),
			'reference-widget' => array('widget' => $string),
		) as $name => $attributes) {
			$args = array('api_version' => 3, 'attributes' => $attributes, 'editor_script' => 'lenremont-reference-blocks', 'supports' => array('inserter' => false));
			if (in_array($name, array('art', 'reference-widget'), true)) {
				$args['render_callback'] = static function ($attributes) use ($name): string {
					ob_start();
					include LENREMONT_PAGE_IMPORTER_DIR . 'blocks/' . $name . '/render.php';
					return (string) ob_get_clean();
				};
			}
			register_block_type('lenremont/' . $name, $args);
		}
		foreach (array('hero-main', 'hero-motocikly', 'hero-skutery', 'hero-kvadrocikly', 'hero-baggi', 'hero-pitbajki', 'hero-enduro', 'hero-choppery', 'hero-mototurizm', 'vehicles', 'workshops', 'benefits', 'workshop', 'portfolio', 'solutions', 'materials', 'prices', 'process', 'faq', 'contact', 'messengers', 'logistics', 'quality') as $section) {
			register_block_type('lenremont/section-' . $section, array('api_version' => 3, 'supports' => array('html' => false, 'customClassName' => false, 'multiple' => false, 'reusable' => false)));
		}
		wp_register_style(
			'lenremont-page-importer',
			LENREMONT_PAGE_IMPORTER_URL . 'assets/frontend.css',
			array('lenremont-reference-adapter'),
			self::VERSION
		);

		wp_register_script(
			'lenremont-page-importer-blocks',
			LENREMONT_PAGE_IMPORTER_URL . 'assets/blocks.js',
			array('wp-blocks', 'wp-block-editor', 'wp-components', 'wp-element', 'wp-i18n'),
			self::VERSION,
			true
		);

		wp_register_script(
			'lenremont-page-importer-interactions',
			LENREMONT_PAGE_IMPORTER_URL . 'assets/interactions.js',
			array(),
			self::VERSION,
			true
		);

		wp_register_script('lenremont-service-quiz-editor', LENREMONT_PAGE_IMPORTER_URL . 'assets/service-quiz-editor.js', array('wp-blocks', 'wp-block-editor', 'wp-components', 'wp-element'), self::VERSION, true);
		wp_register_script('lenremont-service-quiz-view', LENREMONT_PAGE_IMPORTER_URL . 'assets/service-quiz.js', array(), self::VERSION, true);
		foreach (array('quiz', 'before-after', 'lead-form', 'service-quiz') as $block) {
			register_block_type(LENREMONT_PAGE_IMPORTER_DIR . 'blocks/' . $block);
		}

		if (function_exists('register_block_template')) {
			register_block_template('lenremont-page-importer//lenremont-landing', array(
				'title' => 'Ленремонт — полный лендинг',
				'description' => 'Содержимое страницы на всю ширину, без дополнительной шапки, заголовка и подвала темы.',
				'post_types' => array('page'),
				'content' => '<!-- wp:group {"tagName":"main","align":"full","className":"lr-page-canvas","layout":{"type":"default"}} --><main class="wp-block-group alignfull lr-page-canvas"><!-- wp:post-content {"align":"full","layout":{"type":"default"}} /--></main><!-- /wp:group -->',
			));
		}
	}

	public function register_design_patterns(): void {
		register_block_pattern_category('lenremont-source-sections', array('label' => 'Ленремонт — готовые секции'));
		foreach ((require LENREMONT_PAGE_IMPORTER_DIR . 'patterns/source-sections.php') as $slug => $title) {
			register_block_pattern('lenremont/section-' . $slug, array(
				'title' => 'Ленремонт · ' . $title,
				'description' => 'Нейтральная секция с текстом-рыбой. Замените тексты, изображения и ссылки перед публикацией.',
				'categories' => array('lenremont-source-sections'),
				'keywords' => array('ленремонт', 'секция', 'лендинг'),
				'postTypes' => array('page'),
				'viewportWidth' => 1280,
				'inserter' => true,
				'content' => '<!-- wp:lenremont/section-' . $slug . ' /-->',
			));
		}
		foreach (array('pages' => 'Ленремонт · Страницы', 'sections' => 'Ленремонт · Секции', 'elements' => 'Ленремонт · Элементы') as $slug => $label) {
			register_block_pattern_category('lr-ai-' . $slug, array('label' => $label));
		}
		$patterns = require LENREMONT_PAGE_IMPORTER_DIR . 'patterns/design-system.php';
		foreach ($patterns as $slug => $pattern) {
			// Keep legacy patterns for compatibility and the secondary library panel,
			// without mixing their empty placeholders into the native section inserter.
			$pattern['inserter'] = false;
			register_block_pattern('lenremont/' . $slug, $pattern);
		}
	}

	public function enqueue_editor_assets(): void {
		if (! current_user_can('edit_pages')) {
			return;
		}
		wp_enqueue_script('lenremont-neutral-library', LENREMONT_PAGE_IMPORTER_URL . 'assets/neutral-library.js', array(), self::VERSION, true);
		wp_enqueue_script('lenremont-reference-library', LENREMONT_PAGE_IMPORTER_URL . 'assets/reference-library.js', array('lenremont-page-converter', 'lenremont-neutral-library'), self::VERSION, true);
		$read_manifest = static function (string $file): array {
			$raw = str_replace('{{pluginUrl}}', untrailingslashit(LENREMONT_PAGE_IMPORTER_URL), (string) file_get_contents(LENREMONT_PAGE_IMPORTER_DIR . 'examples/' . $file));
			return json_decode($raw, true) ?: array();
		};
		$reference_library = array('placeholder' => LENREMONT_PAGE_IMPORTER_URL . 'assets/placeholder.svg', 'main' => $read_manifest('main-motorcycle-seats.json'), 'heroes' => array());
		foreach (array('motocikly' => 'мотоциклы', 'skutery' => 'скутеры', 'kvadrocikly' => 'квадроциклы', 'baggi' => 'багги', 'pitbajki' => 'питбайки', 'enduro' => 'эндуро', 'choppery' => 'чопперы и круизеры', 'mototurizm' => 'туринговые мотоциклы') as $key => $label) {
			$manifest = $read_manifest($key . '.json');
			$manifest['sections'] = array_slice($manifest['sections'] ?? array(), 0, 1);
			$reference_library['heroes'][] = array('key' => $key, 'label' => $label, 'manifest' => $manifest);
		}
		wp_add_inline_script('lenremont-reference-library', 'window.LenremontReferenceLibraryConfig = ' . wp_json_encode($reference_library) . ';', 'before');
		wp_enqueue_script('lenremont-section-blocks', LENREMONT_PAGE_IMPORTER_URL . 'assets/section-blocks.js', array('lenremont-reference-library', 'wp-blocks', 'wp-block-editor', 'wp-data', 'wp-element', 'wp-components'), self::VERSION, true);
		wp_enqueue_script('lenremont-block-library', LENREMONT_PAGE_IMPORTER_URL . 'assets/library.js', array('lenremont-section-blocks', 'wp-dom-ready', 'wp-blocks', 'wp-block-editor', 'wp-components', 'wp-element', 'wp-data', 'wp-editor', 'wp-plugins', 'wp-notices', 'wp-hooks'), self::VERSION, true);
		$library = array();
		foreach ((require LENREMONT_PAGE_IMPORTER_DIR . 'patterns/design-system.php') as $slug => $pattern) {
			$library[] = array_merge($pattern, array('name' => 'lenremont/' . $slug));
		}
		wp_add_inline_script('lenremont-block-library', 'window.LenremontLibraryConfig = ' . wp_json_encode($library) . ';', 'before');
		wp_enqueue_style('lenremont-block-library-editor', LENREMONT_PAGE_IMPORTER_URL . 'assets/library-editor.css', array('wp-edit-blocks'), self::VERSION);
		wp_enqueue_script('lenremont-reference-blocks');
		wp_register_script('lenremont-seo-import', LENREMONT_PAGE_IMPORTER_URL . 'assets/seo-import.js', array(), self::VERSION, true);
		$art_path = LENREMONT_PAGE_IMPORTER_DIR . 'assets/reference/art.json';
		$art = is_readable($art_path) ? json_decode((string) file_get_contents($art_path), true) : array();
		wp_add_inline_script('lenremont-reference-blocks', 'window.LenremontReferenceAssets = ' . wp_json_encode(array(
			'art' => $art,
			'choices' => array(
				array('label' => 'Восстановить обивку', 'description' => 'Трещины, разрывы, потёртости', 'icon' => 'needle'),
				array('label' => 'Изменить дизайн', 'description' => 'Новый цвет, фактура или строчка', 'icon' => 'spark'),
				array('label' => 'Разобраться с посадкой', 'description' => 'Скользко, жёстко или неудобно', 'icon' => 'seat'),
			),
		)) . ';', 'before');

		wp_enqueue_script(
			'lenremont-page-converter',
			LENREMONT_PAGE_IMPORTER_URL . 'assets/converter.js',
			array('wp-blocks', 'lenremont-reference-blocks'),
			self::VERSION,
			true
		);

		wp_enqueue_script(
			'lenremont-page-importer-editor',
			LENREMONT_PAGE_IMPORTER_URL . 'assets/editor.js',
			array(
				'lenremont-page-converter',
				'lenremont-seo-import',
				'wp-blocks',
				'wp-components',
				'wp-data',
				'wp-edit-post',
				'wp-editor',
				'wp-element',
				'wp-i18n',
				'wp-notices',
				'wp-plugins',
			),
			self::VERSION,
			true
		);

		$catalog = json_decode((string) file_get_contents(LENREMONT_PAGE_IMPORTER_DIR . 'examples/catalog.json'), true);
		$manifest_version = '?v=' . rawurlencode((string) filemtime(LENREMONT_PAGE_IMPORTER_DIR . 'examples/catalog.json'));
		$examples = array_map(static function (array $page) use ($manifest_version): array {
			return array('label' => $page['title'], 'value' => LENREMONT_PAGE_IMPORTER_URL . 'examples/' . $page['example'] . $manifest_version);
		}, $catalog ?: array());
		wp_add_inline_script(
			'lenremont-page-importer-editor',
			'window.LenremontPageImporterConfig = ' . wp_json_encode(
				array(
					'exampleUrl' => LENREMONT_PAGE_IMPORTER_URL . 'examples/main-motorcycle-seats.json' . $manifest_version,
					'examples' => $examples,
					'pluginUrl'  => untrailingslashit(LENREMONT_PAGE_IMPORTER_URL),
				)
			) . ';',
			'before'
		);

		wp_enqueue_style(
			'lenremont-page-importer-editor',
			LENREMONT_PAGE_IMPORTER_URL . 'assets/editor.css',
			array('wp-edit-blocks', 'lenremont-page-importer'),
			self::VERSION
		);
	}

	public function enqueue_frontend_assets(): void {
		if (! is_singular()) {
			return;
		}

		$post = get_queried_object();
		if (! $post instanceof \WP_Post) {
			return;
		}

		$content = (string) $post->post_content;
		if (false !== strpos($content, 'lr-reference')) {
			wp_enqueue_style('lenremont-reference-original');
			$is_library = false !== strpos($content, 'lr-reference-library');
			if ($is_library) wp_enqueue_script('lenremont-reference-library-runtime', LENREMONT_PAGE_IMPORTER_URL . 'assets/reference-library-runtime.js', array(), self::VERSION, true);
			for ($i = 0; $i < 4; $i++) {
				if ($is_library && 0 === $i && ! has_block('lenremont/reference-quiz', $post)) continue;
				wp_enqueue_script_module('lenremont-reference-' . $i, LENREMONT_PAGE_IMPORTER_URL . 'assets/reference/interaction-' . $i . '.js', array(), self::VERSION);
			}
			return;
		}
		$uses_imported_page = false !== strpos($content, 'lr-imported-page');
		$uses_plugin_block  = has_block('lenremont/quiz', $post)
			|| has_block('lenremont/before-after', $post)
			|| has_block('lenremont/lead-form', $post);

		if ($uses_imported_page || $uses_plugin_block) {
			wp_enqueue_style('lenremont-page-importer');
		}
	}
}
