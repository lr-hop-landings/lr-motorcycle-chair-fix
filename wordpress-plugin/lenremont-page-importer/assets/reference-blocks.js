(function (root, factory) {
	var api = factory();
	if (typeof module === 'object' && module.exports) { module.exports = api; return; }
	root.LenremontReferenceBlocks = api;
	if (root.wp && root.wp.blockEditor) api.register(root.wp, root.LenremontReferenceAssets || {});
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
	'use strict';
	var tags = ['div', 'section', 'article', 'main', 'header', 'footer', 'nav', 'aside', 'figure', 'a', 'button', 'ol', 'ul', 'li', 'details', 'summary', 'span', 'strong', 'p', 'label', 'input'];
	var textTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'span', 'figcaption', 'small', 'summary'];
	var fields = ['id', 'class', 'title', 'role', 'href', 'target', 'rel', 'type', 'min', 'max', 'value', 'tabindex', 'width', 'height', 'alt', 'src', 'loading', 'fetchpriority', 'hidden', 'disabled', 'data-case-card', 'data-case-swiper', 'data-case-prev', 'data-case-next', 'data-materials-swiper', 'data-intent', 'data-contact', 'data-cta', 'data-lead-root', 'data-vehicle', 'data-vehicle-options', 'data-page-path'];
	function url(value) {
		return typeof value === 'string' && !/[\u0000-\u0020\u007f\\]/.test(value) && /^(https?:|tel:|mailto:|\/|#)/i.test(value) ? value : '';
	}
	function cleanAttributes(input) {
		var out = {};
		Object.keys(input || {}).forEach(function (name) {
			var value = input[name];
			if (typeof value !== 'string' || value.length > 16000) return;
			if (name === 'style') {
				var declarations = value.split(';').filter(function (item) {
					return /^\s*(--vehicle-color|--blue|--cyan|--soft|--compare-position|margin-top|margin-bottom)\s*:\s*[-#(),.%\w\s]+$/.test(item) && !/url|expression|javascript/i.test(item);
				});
				if (declarations.length) out.style = declarations.join(';');
				return;
			}
			if (fields.indexOf(name) === -1 && !/^aria-[a-z-]+$/.test(name)) return;
			if (name === 'href' || name === 'src') value = url(value);
			if (name === 'type' && !/^(button|range)$/.test(value)) return;
			out[name] = value;
		});
		if (out.target === '_blank') out.rel = 'noopener noreferrer';
		return out;
	}
	function propsFor(input) {
		var attrs = cleanAttributes(input), props = {};
		Object.keys(attrs).forEach(function (key) {
			var value = attrs[key];
			if (key === 'class') key = 'className';
			if (key === 'tabindex') key = 'tabIndex';
			if (key === 'fetchpriority') key = 'fetchPriority';
			if (key === 'hidden' || key === 'disabled') value = true;
			if (key === 'style') {
				value = {};
				attrs.style.split(';').forEach(function (item) {
					var colon = item.indexOf(':'), name = item.slice(0, colon).trim();
					if (!name.startsWith('--')) name = name.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); });
					value[name] = item.slice(colon + 1).trim();
				});
			}
			props[key] = value;
		});
		return props;
	}
	function register(wp, assets) {
		var el = wp.element.createElement, be = wp.blockEditor, c = wp.components;
		var shared = { apiVersion: 3, category: 'design', supports: { html: false, customClassName: false, inserter: false } };
		function inspector(children) { return el(be.InspectorControls, null, el(c.PanelBody, { title: 'Исходный лендинг' }, children)); }
		wp.blocks.registerBlockType('lenremont/element', Object.assign({}, shared, {
			title: 'Элемент лендинга', icon: 'layout',
			attributes: { tag: { type: 'string', default: 'div' }, attributes: { type: 'object', default: {} } },
			edit: function (p) {
				var tag = tags.includes(p.attributes.tag) ? p.attributes.tag : 'div';
				var props = propsFor(p.attributes.attributes);
				var blockProps = be.useBlockProps(Object.assign({}, props, { onClick: tag === 'a' ? function (e) { e.preventDefault(); } : undefined }));
				var inner = be.useInnerBlocksProps(blockProps);
				var href = p.attributes.attributes.href;
				return el(wp.element.Fragment, null,
					inspector(href !== undefined ? el(c.TextControl, { label: 'Ссылка', value: href, onChange: function (v) { p.setAttributes({ attributes: Object.assign({}, p.attributes.attributes, { href: url(v) }) }); } }) : el('p', null, 'Содержимое редактируется во вложенных блоках.')),
					tag === 'input' ? el('div', blockProps, el('input', Object.assign({}, props, { disabled: true }))) : el(tag === 'a' || tag === 'button' ? 'div' : tag, inner)
				);
			},
			save: function (p) {
				var tag = tags.includes(p.attributes.tag) ? p.attributes.tag : 'div';
				var props = propsFor(p.attributes.attributes);
				return tag === 'input' ? el('input', props) : el(tag, props, el(be.InnerBlocks.Content));
			}
		}));
		wp.blocks.registerBlockType('lenremont/text', Object.assign({}, shared, {
			title: 'Подпись лендинга', icon: 'editor-textcolor',
			attributes: { tag: { type: 'string', default: 'span' }, raw: { type: 'boolean', default: false }, text: { type: 'string', default: '' }, attributes: { type: 'object', default: {} } },
			edit: function (p) {
				var raw = p.attributes.raw;
				var value = raw ? p.attributes.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : p.attributes.text;
				return el(be.RichText, Object.assign({}, be.useBlockProps(propsFor(p.attributes.attributes)), { tagName: textTags.includes(p.attributes.tag) ? p.attributes.tag : 'span', value: value, allowedFormats: raw ? [] : undefined, onChange: function (v) { p.setAttributes({ text: raw ? new window.DOMParser().parseFromString(v, 'text/html').body.textContent : v }); } }));
			},
			save: function (p) {
				// A React text node stays a text node; no extra flex item wrapper.
				if (p.attributes.raw) return p.attributes.text;
				return el(be.RichText.Content, Object.assign({}, propsFor(p.attributes.attributes), { tagName: textTags.includes(p.attributes.tag) ? p.attributes.tag : 'span', value: p.attributes.text }));
			}
		}));
		wp.blocks.registerBlockType('lenremont/picture', Object.assign({}, shared, {
			title: 'Изображение лендинга', icon: 'format-image', category: 'media',
			attributes: { attributes: { type: 'object', default: {} } },
			edit: function (p) {
				var a = p.attributes.attributes;
				return el(wp.element.Fragment, null, inspector([
					el(c.TextControl, { key: 'alt', label: 'Описание изображения', value: a.alt || '', onChange: function (v) { p.setAttributes({ attributes: Object.assign({}, a, { alt: v }) }); } }),
					el(be.MediaUploadCheck, { key: 'media' }, el(be.MediaUpload, { allowedTypes: ['image'], onSelect: function (media) { p.setAttributes({ attributes: Object.assign({}, a, { src: media.url, alt: media.alt || '', width: String(media.width), height: String(media.height) }) }); }, render: function (media) { return el(c.Button, { variant: 'secondary', onClick: media.open }, 'Заменить изображение'); } }))
				]), el('img', be.useBlockProps(propsFor(a))));
			},
			save: function (p) { return el('img', propsFor(p.attributes.attributes)); }
		}));
		wp.blocks.registerBlockType('lenremont/art', Object.assign({}, shared, {
			title: 'Иконка / схема', icon: 'art', attributes: { asset: { type: 'string', default: '' } },
			edit: function (p) { return el('div', be.useBlockProps({ className: 'lr-art-editor' }), el(wp.element.RawHTML, null, assets.art && assets.art[p.attributes.asset] || 'Иконка')); },
			save: function () { return null; }
		}));
		wp.blocks.registerBlockType('lenremont/reference-widget', Object.assign({}, shared, {
			title: 'Окно / мобильная панель', icon: 'welcome-widgets-menus', attributes: { widget: { type: 'string', default: '' } },
			edit: function (p) { var key = /^callback(?:-(motocikly|skutery|kvadrocikly|baggi|pitbajki|enduro|choppery|mototurizm))?$/.test(p.attributes.widget) ? 'callback' : p.attributes.widget; return el('div', be.useBlockProps({ className: 'lr-widget-editor' }), ({ 'contact-dialog': 'Окно подготовки сообщения', callback: 'Окно обратного звонка', 'mobile-bar': 'Мобильная панель: звонок и подбор решения' })[key] || 'Элемент интерфейса'); },
			save: function () { return null; }
		}));
		wp.blocks.registerBlockType('lenremont/reference-quiz', Object.assign({}, shared, {
			title: 'Исходный квиз — 4 шага', icon: 'forms', attributes: { attributes: { type: 'object', default: {} } },
			edit: function (p) {
				var steps = p.attributes.attributes['data-vehicle'] ? [0,1,2] : [0,1,2,3];
				return el('div', be.useBlockProps(), el('div', { className: 'quiz-head' }, el('span', null, 'Вопрос 1 из ' + steps.length), el('div', { className: 'progress' }, steps.map(function (i) { return el('i', { key: i, className: i === 0 ? 'active' : '' }); }))), el('h2', null, 'Что нужно вашему сиденью?'), el('div', { className: 'choices' }, (assets.choices || []).map(function (choice) { return el('div', { key: choice.label, className: 'choice' }, el('span', { className: 'icon' }, el('svg', null, el('use', { href: '#' + choice.icon }))), el('span', null, el('strong', null, choice.label), el('small', null, choice.description)), el('svg', { className: 'arrow' }, el('use', { href: '#arrow' }))); })));
			},
			save: function (p) { return el('div', propsFor(p.attributes.attributes)); }
		}));
	}
	return { cleanAttributes: cleanAttributes, propsFor: propsFor, tags: tags, textTags: textTags, register: register };
});
