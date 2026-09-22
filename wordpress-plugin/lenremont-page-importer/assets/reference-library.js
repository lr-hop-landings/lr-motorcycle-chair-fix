(function (root, factory) {
	var api = factory();
	if (typeof module === 'object' && module.exports) module.exports = api;
	else root.LenremontReferenceLibrary = api;
})(typeof window !== 'undefined' ? window : this, function () {
	'use strict';
	function walk(blocks, fn) { blocks.forEach(function (b) { fn(b); walk(b.innerBlocks || [], fn); }); }
	function hasClass(b, name) { return (' ' + (b.attributes.className || '') + ' ').includes(' ' + name + ' '); }
	function ids(blocks) {
		var result = new Set();
		walk(blocks, function (b) { var a = b.attributes; if (a.anchor) result.add(a.anchor); if (a.attributes && a.attributes.id) result.add(a.attributes.id); });
		return result;
	}
	function conflict(incoming, existing) {
		var taken = ids(existing), keys = new Set(), found = false;
		walk(existing, function (b) { var key = (b.attributes.metadata || {}).lrSourceSection; if (key) keys.add(key); });
		walk(incoming, function (b) {
			var a = b.attributes;
			if ((a.anchor && taken.has(a.anchor)) || (a.attributes && a.attributes.id && taken.has(a.attributes.id)) || keys.has((a.metadata || {}).lrSourceSection)) found = true;
		});
		return found;
	}
	function build(wp, converter, config) {
		if (!config || !config.main || !converter) return [];
		var definitions = [
			['hero-main', 'Первый экран + квиз / вариант 1', 'Первый экран с текстом-рыбой, демонстрационным квизом и местом для изображения.'],
			['vehicles', 'Карточки услуг', 'Цветные карточки с текстом-рыбой и настраиваемыми ссылками.'],
			['workshops', 'Мастерские на карте', 'Карта и список мастерских. Для карты требуется отдельный динамический блок.'],
			['benefits', 'Преимущества / короткая полоса', 'Четыре преимущества в исходной компактной компоновке.'],
			['workshop', 'Как проходит работа', 'Фоторепортаж из мастерской с краткими пояснениями.'],
			['portfolio', 'Портфолио / до и после', 'Слайдер с местами для изображений и сравнением до/после.'],
			['solutions', 'Варианты работ', 'Карточки вариантов услуги с текстом-рыбой.'],
			['materials', 'Материалы и отделка', 'Сравнение покрытий, критерии выбора и переход к подбору.'],
			['prices', 'Цены', 'Оформленный блок стоимости из лендинга. Проверьте актуальность значений.'],
			['process', 'Этапы работы', 'Пять этапов на тёмном фоне с исходной типографикой.'],
			['faq', 'Вопросы и ответы', 'Готовые раскрывающиеся вопросы в исходном оформлении.'],
			['contact', 'Контакты / финальный блок', 'Голубая секция с кнопками и местами для ваших контактных изображений.']
		];
		function converted(manifest) {
			var root = converter.convertManifest(window.LenremontNeutralLibrary.manifest(manifest, config.placeholder)).blocks[0];
			// Shared dialog lives once at page level, including pages without a Hero.
			walk([root], function (b) { b.innerBlocks = (b.innerBlocks || []).filter(function (child) { return child.name !== 'lenremont/reference-widget' || child.attributes.widget !== 'contact-dialog'; }); });
			return root;
		}
		var original = converted(config.main), main = original.innerBlocks.find(function (b) { return b.name === 'core/group' && b.attributes.tagName === 'main'; });
		var sprite = original.innerBlocks.find(function (b) { return b.name === 'lenremont/art'; });
		function pattern(slug, title, description, blocks, page) {
			return { name: 'lenremont/source-' + slug, title: 'Ленремонт · ' + title, description: description, source: true, categories: [page ? 'lr-ai-pages' : 'lr-ai-sections'], content: wp.blocks.serialize(blocks), viewportWidth: 1280 };
		}
		function section(block, definition) {
			block.attributes.metadata = Object.assign({}, block.attributes.metadata, { name: definition[1], lrSourceSection: definition[0].startsWith('hero-') ? 'hero' : definition[0] });
			return pattern(definition[0], definition[1], definition[2], [block]);
		}
		var patterns = main.innerBlocks.map(function (b, i) { return section(b, definitions[i]); });
		(config.heroes || []).forEach(function (entry, index) {
			var root = converted(entry.manifest), content = root.innerBlocks.find(function (b) { return b.name === 'core/group' && b.attributes.tagName === 'main'; });
			patterns.push(section(content.innerBlocks[0], ['hero-' + entry.key, 'Первый экран + квиз / вариант ' + (index + 2), 'Нейтральный макет с текстом-рыбой. Используйте только один первый экран.']));
		});
		function wrap(sections) {
			var children = [wp.blocks.cloneBlock(sprite), wp.blocks.createBlock('core/group', { tagName: 'main', anchor: 'top', layout: { type: 'default' }, metadata: { name: 'Секции страницы' } }, sections)];
			return wp.blocks.createBlock('core/group', { align: 'full', anchor: 'hop-gutenberg', className: 'lr-reference lr-imported-page-reference lr-reference-library', layout: { type: 'default' }, metadata: { name: 'Страница из исходных блоков Ленремонта' } }, children);
		}
		patterns.push(pattern('page', 'Нейтральная страница / все секции', 'Полная сборка из 12 секций с текстом-рыбой. Замените содержимое и настройте ссылки.', [wrap(main.innerBlocks)], true));
		patterns.push(pattern('empty', 'Нейтральная страница / пустой контейнер', 'Начните с пустой страницы, затем добавляйте нужные секции.', [wrap([])], true));
		return patterns;
	}
	function insert(wp, pattern, notify, patterns) {
		var store = wp.data.select('core/block-editor'), dispatch = wp.data.dispatch('core/block-editor'), all = store.getBlocks(), roots = [], incompatible = false;
		walk(all, function (b) {
			if (hasClass(b, 'lr-reference-library')) roots.push(b);
			else if (hasClass(b, 'lr-reference')) incompatible = true;
			else if (hasClass(b, 'lr-ai-page') || hasClass(b, 'lr-imported-page') || b.attributes.anchor === 'hop-gutenberg') incompatible = true;
		});
		if (incompatible || roots.length > 1) { notify('warning', 'Для исходных секций создайте новую страницу. Уже импортированный лендинг и универсальные заготовки не изменены.'); return; }
		var pagePattern = pattern.categories.includes('lr-ai-pages'), blocks = wp.blocks.parse(pattern.content), invalid = false;
		walk(blocks, function (b) { if (b.isValid === false) invalid = true; });
		if (invalid) { notify('error', 'Исходная секция не прошла проверку Gutenberg.'); return; }
		if (pagePattern && roots.length) { notify('warning', 'Контейнер уже есть. Добавляйте отдельные секции.'); return; }
		if (!roots.length) {
			if (!pagePattern) {
				var empty = wp.blocks.parse(patterns.find(function (p) { return p.name === 'lenremont/source-empty'; }).content)[0];
				empty.innerBlocks.find(function (b) { return b.name === 'core/group' && b.attributes.tagName === 'main'; }).innerBlocks = blocks;
				blocks = [empty];
			}
			if (!blocks.every(function (b) { return store.canInsertBlockType(b.name); })) { notify('warning', 'Вставка запрещена настройками редактора.'); return; }
			dispatch.insertBlocks(blocks, all.length);
		} else {
			var root = roots[0], main = root.innerBlocks.find(function (b) { return b.name === 'core/group' && b.attributes.tagName === 'main'; });
			if (!main) { notify('warning', 'Не найдена группа «Секции страницы». Содержимое не изменено.'); return; }
			if (conflict(blocks, all)) { notify('warning', 'Эта секция или её вариант уже есть. Не добавляйте второй Hero, квиз или слайдер; сначала уберите ненужный вариант.'); return; }
			var selected = store.getSelectedBlockClientId(), parents = selected ? store.getBlockParents(selected) : [], index = main.innerBlocks.length;
			var current = main.innerBlocks.find(function (b) { return b.clientId === selected || parents.includes(b.clientId); });
			if (current) index = main.innerBlocks.indexOf(current) + 1;
			if (!blocks.every(function (b) { return store.canInsertBlockType(b.name, main.clientId); })) { notify('warning', 'Группа заблокирована для вставки.'); return; }
			dispatch.insertBlocks(blocks, index, main.clientId);
		}
		notify('success', 'Добавлена исходная секция. Сохраните страницу.');
	}
	function preview(wp, pattern, patterns) {
		if (pattern.categories.includes('lr-ai-pages')) return wp.blocks.parse(pattern.content);
		var root = wp.blocks.parse(patterns.find(function (p) { return p.name === 'lenremont/source-empty'; }).content)[0];
		return [wp.blocks.createBlock('core/group', { className: 'lr-reference', layout: { type: 'default' } }, [root.innerBlocks[0]].concat(wp.blocks.parse(pattern.content)))];
	}
	return { build: build, insert: insert, conflict: conflict, preview: preview };
});
