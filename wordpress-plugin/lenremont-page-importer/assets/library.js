(function (root, factory) {
	var api = factory();
	if (typeof module === 'object' && module.exports) module.exports = api;
	else { root.LenremontLibrary = api; root.wp.domReady(function () { api.register(root.wp, root.LenremontLibraryConfig || []); }); }
})(typeof window !== 'undefined' ? window : this, function () {
	'use strict';
	function hasClass(block, name) { return (' ' + (block.attributes.className || '') + ' ').indexOf(' ' + name + ' ') !== -1; }
	function walk(blocks, fn) { blocks.forEach(function (block) { fn(block); walk(block.innerBlocks || [], fn); }); }
	function prepare(blocks, existing) {
		var used = new Set(), renamed = {};
		walk(existing, function (b) { if (b.attributes.anchor) used.add(b.attributes.anchor); });
		walk(blocks, function (b) {
			var anchor = b.attributes.anchor;
			if (!anchor) return;
			var next = anchor, i = 2;
			while (used.has(next)) next = anchor + '-' + i++;
			used.add(next);
			if (next !== anchor) { renamed[anchor] = next; b.attributes.anchor = next; }
		});
		walk(blocks, function (b) {
			var url = b.attributes.url;
			if (typeof url === 'string' && renamed[url.slice(1)] && url.charAt(0) === '#') b.attributes.url = '#' + renamed[url.slice(1)];
		});
		return blocks;
	}
	function classVariant(classes, choices, value) {
		return (classes || '').split(/\s+/).filter(function (c) { return c && choices.indexOf(c) === -1; }).concat(value ? [value] : []).join(' ');
	}
	function register(wp, patterns) {
		if (!wp || !wp.editor || !wp.editor.PluginSidebar) return;
		var source = window.LenremontReferenceLibrary;
		if (source) {
			var sourcePatterns = source.build(wp, window.LenremontPageConverter, window.LenremontReferenceLibraryConfig);
			if (window.LenremontSectionBlocks) {
				window.LenremontSectionBlocks.register(wp, sourcePatterns);
				sourcePatterns = window.LenremontSectionBlocks.decorate(wp, sourcePatterns);
			}
			patterns = sourcePatterns.concat(patterns);
		}
		var el = wp.element.createElement, c = wp.components, be = wp.blockEditor;
		function notify(status, text) { wp.data.dispatch('core/notices').createNotice(status, text, { type: 'snackbar' }); }
		function insert(pattern) {
			if (pattern.source) { source.insert(wp, pattern, notify, patterns); return; }
			var store = wp.data.select('core/block-editor'), dispatch = wp.data.dispatch('core/block-editor');
			var all = store.getBlocks(), roots = [], incompatible = false;
			walk(all, function (b) {
				if (hasClass(b, 'lr-ai-page')) roots.push(b);
				else if (b.attributes.anchor === 'hop-gutenberg' || hasClass(b, 'lr-reference') || hasClass(b, 'lr-imported-page')) incompatible = true;
			});
			if (incompatible || roots.length > 1) { notify('warning', 'Используйте отдельную страницу с одним контейнером Ленремонт. Импортированный лендинг не изменён.'); return; }
			var isPage = pattern.categories.indexOf('lr-ai-pages') !== -1;
			if (isPage && roots.length) { notify('warning', 'Контейнер уже есть. Добавляйте отдельные секции, а не вторую страницу.'); return; }
			var blocks = wp.blocks.parse(pattern.content);
			var invalid = false;
			walk(blocks, function (b) { if (b.isValid === false) invalid = true; });
			if (invalid || !blocks.length) { notify('error', 'Заготовка не прошла проверку Gutenberg. Содержимое не изменено.'); return; }
			prepare(blocks, all);
			if (!roots.length) {
				if (!isPage) blocks = [wp.blocks.createBlock('core/group', { className: 'lr-ai-page', anchor: 'hop-gutenberg', align: 'full', layout: { type: 'default' }, metadata: { name: 'Страница Ленремонт' } }, blocks)];
				else blocks[0].attributes.align = 'full';
				if (!blocks.every(function (b) { return store.canInsertBlockType(b.name); })) { notify('warning', 'Вставка запрещена настройками редактора.'); return; }
				dispatch.insertBlocks(blocks, all.length);
			} else {
				var page = roots[0], parent = page.clientId, index = page.innerBlocks.length;
				var selected = store.getSelectedBlockClientId();
				var parents = selected ? store.getBlockParents(selected) : [];
				var isInside = selected === page.clientId || parents.indexOf(page.clientId) !== -1;
				if (isInside && pattern.categories.indexOf('lr-ai-elements') !== -1) {
					var candidates = [selected].concat(parents.slice().reverse());
					var group = candidates.map(function (id) { return store.getBlock(id); }).find(function (b) { return b && b.name === 'core/group'; });
					if (group) { parent = group.clientId; index = group.innerBlocks.length; }
				} else if (isInside && selected !== page.clientId) {
					var child = page.innerBlocks.find(function (b) { return b.clientId === selected || parents.indexOf(b.clientId) !== -1; });
					if (child) index = page.innerBlocks.indexOf(child) + 1;
				}
				if (!blocks.every(function (b) { return store.canInsertBlockType(b.name, parent); })) { notify('warning', 'Выбранная группа заблокирована для вставки.'); return; }
				dispatch.insertBlocks(blocks, index, parent);
			}
			notify('success', 'Добавлено: ' + pattern.title.replace('Ленремонт · ', '') + '. Сохраните страницу после редактирования.');
		}
		function Library() {
			var query = wp.element.useState(''), category = wp.element.useState('lr-ai-sections'), preview = wp.element.useState(null), collection = wp.element.useState('source');
			var postType = wp.data.useSelect(function (select) { return select('core/editor').getCurrentPostType(); }, []);
			if (postType !== 'page') return null;
			var filtered = patterns.filter(function (p) { return Boolean(p.source) === (collection[0] === 'source') && p.categories.indexOf(category[0]) !== -1 && (p.title + ' ' + p.description).toLowerCase().indexOf(query[0].toLowerCase()) !== -1; });
			return el(wp.element.Fragment, null,
				el(wp.editor.PluginSidebarMoreMenuItem, { target: 'lenremont-library', icon: 'screenoptions' }, 'Библиотека Ленремонт'),
				el(wp.editor.PluginSidebar, { name: 'lenremont-library', title: 'Библиотека Ленремонт', icon: 'screenoptions' },
					el('div', { className: 'lr-library-panel' },
						el(c.SelectControl, { label: 'Коллекция', value: collection[0], options: [{ label: 'Нейтральные секции — текст-рыба', value: 'source' }, { label: 'Ранние универсальные заготовки', value: 'generic' }], onChange: function (value) { collection[1](value); category[1]('lr-ai-sections'); query[1](''); } }),
						el('p', null, collection[0] === 'source' ? 'Нейтральные секции с текстом-рыбой и изображениями-заглушками. Исходные стили и адаптив сохранены. Контейнер создаётся автоматически.' : 'Ранние универсальные заготовки. Не смешивайте две коллекции на одной странице.'),
						el(c.SelectControl, { label: 'Раздел библиотеки', value: category[0], options: [{ label: 'Секции', value: 'lr-ai-sections' }].concat(collection[0] === 'source' ? [] : [{ label: 'Элементы', value: 'lr-ai-elements' }], [{ label: 'Страницы', value: 'lr-ai-pages' }]), onChange: category[1] }),
						el(c.TextControl, { label: 'Найти заготовку', value: query[0], onChange: query[1] }),
						el('p', { className: 'lr-library-help' }, category[0] === 'lr-ai-elements' ? 'Элемент добавится внутрь выбранной группы. Для карточки выберите сетку.' : 'Секция добавится после выбранной секции или в конец контейнера. Перемещайте секции в «Обзоре документа».'),
						filtered.length ? filtered.map(function (p) { return el('article', { key: p.name, className: 'lr-library-item' },
							el('h3', null, p.title.replace('Ленремонт · ', '')),
							el('p', null, p.description),
							el(c.Button, { variant: 'secondary', onClick: function () { insert(p); }, 'aria-label': 'Добавить: ' + p.title.replace('Ленремонт · ', '') }, 'Добавить'),
							el(c.Button, { variant: 'tertiary', onClick: function () { preview[1](p); }, 'aria-label': 'Посмотреть: ' + p.title.replace('Ленремонт · ', '') }, 'Посмотреть'));
						}) : el('p', { role: 'status' }, 'Ничего не найдено.'),
						el('p', { className: 'lr-library-help' }, collection[0] === 'source' ? 'Один Hero с квизом и один слайдер на странице. Квиз демонстрационный, без отправки ответов. Замените текст-рыбу, изображения, цены и ссылки; настройте обработку заявок перед публикацией.' : 'Заготовки независимы: изменения на одной странице не меняют остальные. Перед публикацией замените примеры и проверьте контакты.'))),
				preview[0] && el(c.Modal, { title: preview[0].title, onRequestClose: function () { preview[1](null); }, className: 'lr-library-preview' },
					el(be.BlockPreview, { blocks: preview[0].source ? source.preview(wp, preview[0], patterns) : preview[0].categories.indexOf('lr-ai-pages') !== -1 ? wp.blocks.parse(preview[0].content) : [wp.blocks.createBlock('core/group', { className: 'lr-ai-page', layout: { type: 'default' } }, wp.blocks.parse(preview[0].content))], viewportWidth: 1280 }),
					el(c.Button, { variant: 'primary', onClick: function () { insert(preview[0]); preview[1](null); } }, 'Добавить на страницу')));
		}
		wp.plugins.registerPlugin('lenremont-library', { render: Library, icon: 'screenoptions' });
		wp.hooks.addFilter('editor.BlockEdit', 'lenremont/library-settings', function (BlockEdit) {
			return function (props) {
				var classes = props.attributes.className || '';
				if (props.name !== 'core/group' || !hasClass(props, 'lr-ai-section')) return el(BlockEdit, props);
				return el(wp.element.Fragment, null, el(BlockEdit, props), props.isSelected && el(be.InspectorControls, null,
					el(c.PanelBody, { title: 'Секция Ленремонт' },
						el(c.SelectControl, { label: 'Цветовая схема', value: hasClass(props, 'lr-ai-dark') ? 'lr-ai-dark' : hasClass(props, 'lr-ai-soft') ? 'lr-ai-soft' : '', options: [{ label: 'Светлая', value: '' }, { label: 'Серая', value: 'lr-ai-soft' }, { label: 'Тёмная', value: 'lr-ai-dark' }], onChange: function (value) { props.setAttributes({ className: classVariant(classes, ['lr-ai-dark', 'lr-ai-soft'], value) }); } }),
						el(c.SelectControl, { label: 'Вертикальные отступы', value: hasClass(props, 'lr-ai-compact') ? 'lr-ai-compact' : hasClass(props, 'lr-ai-spacious') ? 'lr-ai-spacious' : '', options: [{ label: 'Обычные', value: '' }, { label: 'Компактные', value: 'lr-ai-compact' }, { label: 'Большие', value: 'lr-ai-spacious' }], onChange: function (value) { props.setAttributes({ className: classVariant(classes, ['lr-ai-compact', 'lr-ai-spacious'], value) }); } }),
						el('p', null, 'Если выбран собственный цвет в настройках Gutenberg, он имеет приоритет.'))));
			};
		});
	}
	return { prepare: prepare, classVariant: classVariant, register: register };
});
