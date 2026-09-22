(function (root, factory) {
	var api = factory();
	if (typeof module === 'object' && module.exports) module.exports = api;
	else root.LenremontSectionBlocks = api;
})(typeof window !== 'undefined' ? window : this, function () {
	'use strict';
	function blockName(pattern) { return pattern.name.replace('lenremont/source-', 'lenremont/section-'); }
	function template(blocks) { return blocks.map(function (b) { return [b.name, b.attributes, template(b.innerBlocks || [])]; }); }
	function walk(blocks, fn) { blocks.forEach(function (b) { fn(b); walk(b.innerBlocks || [], fn); }); }
	function hasClass(b, name) { return (' ' + (b.attributes.className || '') + ' ').includes(' ' + name + ' '); }
	function without(blocks, clientId) { return blocks.filter(function (b) { return b.clientId !== clientId; }).map(function (b) { return Object.assign({}, b, { innerBlocks: without(b.innerBlocks || [], clientId) }); }); }
	function register(wp, patterns) {
		var el = wp.element.createElement, be = wp.blockEditor;
		var empty = patterns.find(function (p) { return p.name === 'lenremont/source-empty'; });
		var sprite = wp.blocks.parse(empty.content)[0].innerBlocks[0];
		var spriteHtml = (window.LenremontReferenceAssets.art || {})[sprite.attributes.asset] || '';
		var icons = { hero: 'cover-image', vehicles: 'grid-view', workshops: 'location', benefits: 'awards', workshop: 'admin-tools', portfolio: 'images-alt2', solutions: 'layout', materials: 'format-image', prices: 'list-view', process: 'editor-ol', faq: 'editor-help', contact: 'phone' };
		var categories = wp.blocks.getCategories();
		if (!categories.some(function (c) { return c.slug === 'lenremont-sections'; })) wp.blocks.setCategories([{ slug: 'lenremont-sections', title: 'Ленремонт — готовые секции' }].concat(categories));
		function position(clientId, defaults) {
			var store = wp.data.select('core/block-editor'), dispatch = wp.data.dispatch('core/block-editor');
			var block = store.getBlock(clientId);
			if (!block) return ''; // BlockPreview has its own isolated store.
			if (window.LenremontReferenceLibrary.conflict(block.innerBlocks.length ? block.innerBlocks : defaults, without(store.getBlocks(), clientId))) {
				var warning = 'Эта секция или другой вариант Hero уже есть. Сначала уберите ненужный вариант.';
				if (store.wasBlockJustInserted(clientId) && store.canRemoveBlock(clientId)) {
					// Reject only the newly inserted duplicate, never an existing saved block.
					dispatch.removeBlock(clientId, false);
					wp.data.dispatch('core/notices').createNotice('warning', warning, { type: 'snackbar' });
				}
				return warning;
			}
			var roots = [], incompatible = false;
			walk(store.getBlocks(), function (b) {
				if (hasClass(b, 'lr-reference-library')) roots.push(b);
				else if (hasClass(b, 'lr-reference') || hasClass(b, 'lr-ai-page') || hasClass(b, 'lr-imported-page') || b.attributes.anchor === 'hop-gutenberg') incompatible = true;
			});
			if (incompatible || roots.length > 1) return 'Эти секции предназначены для новой страницы или сборки из исходных секций. Не смешивайте их с другим контейнером.';
			var parent = store.getBlockRootClientId(clientId);
			if (!roots.length) {
				if (parent || !store.canInsertBlockType('core/group')) return 'Добавьте секцию на верхнем уровне новой страницы.';
				var root = wp.blocks.parse(empty.content)[0], copy = wp.blocks.cloneBlock(block);
				root.innerBlocks.find(function (b) { return b.attributes.tagName === 'main'; }).innerBlocks = [copy];
				dispatch.replaceBlocks([clientId], [root]);
				dispatch.selectBlock(copy.clientId);
				return '';
			}
			var main = roots[0].innerBlocks.find(function (b) { return b.attributes.tagName === 'main'; });
			if (!main) return 'В контейнере отсутствует группа «Секции страницы».';
			if (parent === main.clientId) return '';
			if (!store.canMoveBlocks([clientId]) || !store.canInsertBlockType(block.name, main.clientId)) return 'Переместите секцию в группу «Секции страницы»; сейчас вставка туда заблокирована.';
			dispatch.moveBlocksToPosition([clientId], parent, main.clientId, main.innerBlocks.length);
			return '';
		}
		patterns.filter(function (p) { return p.categories.includes('lr-ai-sections'); }).forEach(function (pattern) {
			var name = blockName(pattern), children = wp.blocks.parse(pattern.content), initial = template(children);
			if (wp.blocks.getBlockType(name)) return;
			var slug = pattern.name.replace('lenremont/source-', '');
			wp.blocks.registerBlockType(name, {
				apiVersion: 3, title: pattern.title, description: pattern.description,
				category: 'lenremont-sections', icon: icons[slug.split('-')[0]] || 'layout', keywords: ['ленремонт', 'секция', 'лендинг'],
				attributes: { preview: { type: 'boolean', default: false } },
				supports: { html: false, customClassName: false, multiple: false, reusable: false },
				example: { attributes: { preview: true } },
				edit: function (p) {
					var notice = wp.element.useState('');
					// Native pattern thumbnails use an isolated editor, without our page root.
					var isPreview = p.attributes.preview || !wp.data.select('core/block-editor').getBlock(p.clientId);
					var props = be.useBlockProps({ className: 'lr-source-section-editor' + (isPreview ? ' lr-reference' : '') });
					var inner = be.useInnerBlocksProps(props, { template: initial, templateLock: false, renderAppender: false });
					wp.element.useEffect(function () { if (!p.attributes.preview) notice[1](position(p.clientId, children)); }, [p.clientId, p.attributes.preview]);
					return el(wp.element.Fragment, null,
						el(be.InspectorControls, null, el(wp.components.PanelBody, { title: 'Готовая секция Ленремонт' }, el('p', null, 'Перемещайте секцию целиком. Тексты и фотографии меняются во вложенных блоках. Квиз и слайдер — по одному на странице.'))),
						notice[0] ? el(wp.components.Notice, { status: 'warning', isDismissible: false }, notice[0]) : null,
						isPreview ? el('div', inner, el(wp.element.RawHTML, null, spriteHtml), inner.children) : el('div', inner)
					);
				},
				save: function () { return el(be.InnerBlocks.Content); }
			});
		});
	}
	function decorate(wp, patterns) {
		function wrap(b) {
			var key = (b.attributes.metadata || {}).lrSourceSection;
			if (!key) return b;
			var slug = key === 'hero' ? 'hero-main' : key;
			return wp.blocks.createBlock('lenremont/section-' + slug, { metadata: { name: b.attributes.metadata.name } }, [b]);
		}
		return patterns.map(function (p) {
			var blocks = wp.blocks.parse(p.content);
			if (p.categories.includes('lr-ai-sections')) blocks = [wp.blocks.createBlock(blockName(p), { metadata: { name: p.title.replace('Ленремонт · ', '') } }, blocks)];
			else if (p.name === 'lenremont/source-page') blocks[0].innerBlocks.find(function (b) { return b.attributes.tagName === 'main'; }).innerBlocks = blocks[0].innerBlocks.find(function (b) { return b.attributes.tagName === 'main'; }).innerBlocks.map(wrap);
			return Object.assign({}, p, { content: wp.blocks.serialize(blocks) });
		});
	}
	return { register: register, decorate: decorate, blockName: blockName, template: template, without: without };
});
