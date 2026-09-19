(function (root, factory) {
	if (typeof module === 'object' && module.exports) {
		module.exports = factory;
		return;
	}

	root.LenremontPageConverter = factory(root.wp.blocks, root);
})(typeof globalThis !== 'undefined' ? globalThis : window, function (blocksApi, environment) {
	'use strict';

	if (!blocksApi || typeof blocksApi.createBlock !== 'function') {
		throw new Error('Lenremont Page Converter requires wp.blocks.createBlock.');
	}

	var createBlock = blocksApi.createBlock;
	var env = environment || {};

	function string(value, fallback) {
		return typeof value === 'string' ? value : (fallback || '');
	}

	function array(value) {
		return Array.isArray(value) ? value : [];
	}

	function slug(value) {
		return string(value, 'default')
			.toLowerCase()
			.replace(/[^a-z0-9а-яё_-]+/gi, '-')
			.replace(/^-+|-+$/g, '') || 'default';
	}

	function safeUrl(value) {
		var candidate = string(value).trim();
		if (!candidate) return '';
		if (/[\u0000-\u001f\u007f]/.test(candidate)) return '';
		if (/^(https?:|mailto:|tel:|\/|#)/i.test(candidate)) return candidate;
		return '';
	}

	function sanitizeInline(value) {
		var source = string(value);
		if (!source || !env.DOMParser) return source.replace(/<[^>]*>/g, '');

		var document = new env.DOMParser().parseFromString(source, 'text/html');
		var allowed = ['A', 'STRONG', 'EM', 'B', 'I', 'BR', 'CODE', 'MARK', 'SUP', 'SUB', 'S', 'SPAN'];
		var output = document.createElement('div');

		// Build a clean fragment without ever removing the parser's html/body wrappers.
		function copy(sourceNode, target) {
			Array.prototype.forEach.call(sourceNode.childNodes, function (node) {
				if (node.nodeType === 3) {
					target.appendChild(document.createTextNode(node.textContent));
					return;
				}
				if (node.nodeType !== 1 || /^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED|SVG|MATH|TEMPLATE)$/.test(node.tagName)) return;
				if (allowed.indexOf(node.tagName) === -1) {
					copy(node, target);
					return;
				}
				var clean = document.createElement(node.tagName.toLowerCase());
				if (node.tagName === 'A') {
					var href = safeUrl(node.getAttribute('href'));
					if (href) clean.setAttribute('href', href);
					if (node.getAttribute('target') === '_blank') {
						clean.setAttribute('target', '_blank');
						clean.setAttribute('rel', 'noopener noreferrer');
					}
				}
				copy(node, clean);
				target.appendChild(clean);
			});
		}
		copy(document.body, output);

		return output.innerHTML;
	}

	function paragraph(content, className) {
		var attrs = { content: sanitizeInline(content) };
		if (className) attrs.className = className;
		return createBlock('core/paragraph', attrs);
	}

	function heading(content, level, className) {
		var attrs = {
			content: sanitizeInline(content),
			level: Math.max(1, Math.min(6, Number(level) || 2))
		};
		if (className) attrs.className = className;
		return createBlock('core/heading', attrs);
	}

	function image(item, className) {
		var attrs = {
			url: safeUrl(item && (item.url || item.src)),
			alt: string(item && item.alt),
			sizeSlug: string(item && item.sizeSlug, 'large'),
			linkDestination: 'none'
		};
		if (item && item.caption) attrs.caption = sanitizeInline(item.caption);
		if (className) attrs.className = className;
		return createBlock('core/image', attrs);
	}

	function button(item) {
		return createBlock('core/button', {
			text: sanitizeInline(item && (item.label || item.text)),
			url: safeUrl(item && (item.url || item.href)) || '#',
			className: string(item && item.className)
		});
	}

	function buttons(items, className) {
		return createBlock(
			'core/buttons',
			{ className: className || '', layout: { type: 'flex', flexWrap: 'wrap' } },
			array(items).map(button)
		);
	}

	function list(items, ordered) {
		return createBlock(
			'core/list',
			{ ordered: Boolean(ordered) },
			array(items).map(function (item) {
				return createBlock('core/list-item', { content: sanitizeInline(typeof item === 'string' ? item : item.text) });
			})
		);
	}

	function grid(children, className, minimumColumnWidth) {
		return createBlock(
			'core/group',
			{
				className: className || 'lr-card-grid',
				layout: { type: 'grid', minimumColumnWidth: minimumColumnWidth || '250px' }
			},
			children
		);
	}

	function card(item) {
		var inner = [];
		if (item.image) inner.push(image(item.image, 'lr-card__image'));
		if (item.eyebrow) inner.push(paragraph(item.eyebrow, 'lr-eyebrow'));
		if (item.title) inner.push(heading(item.title, 3, 'lr-card__title'));
		if (item.text) inner.push(paragraph(item.text, 'lr-card__text'));
		if (array(item.items).length) inner.push(list(item.items, false));
		if (item.link) inner.push(buttons([item.link]));
		return createBlock(
			'core/group',
			{ className: 'lr-card ' + string(item.className), layout: { type: 'constrained' } },
			inner
		);
	}

	function sectionHeader(section) {
		var blocks = [];
		if (section.eyebrow) blocks.push(paragraph(section.eyebrow, 'lr-eyebrow'));
		if (section.title) blocks.push(heading(section.title, section.headingLevel || 2, 'lr-section__title'));
		if (section.text) blocks.push(paragraph(section.text, 'lr-section__intro'));
		return blocks;
	}

	function wrapSection(type, children, section) {
		var width = string(section && section.width, 'wide');
		var container = createBlock(
			'core/group',
			{
				align: width === 'full' ? 'full' : 'wide',
				className: 'lr-container',
				layout: { type: 'default' }
			},
			children
		);

		return createBlock(
			'core/group',
			{
				align: 'full',
				anchor: string(section && section.anchor),
				className: 'lr-section lr-section--' + slug(type) + ' ' + string(section && section.className),
				layout: { type: 'default' },
				metadata: { name: string(section && section.title, 'Секция') }
			},
			[container]
		);
	}

	function convertContentBlock(item, warnings) {
		if (!item || typeof item !== 'object') return null;
		var type = string(item.type, 'paragraph');

		switch (type) {
			case 'heading':
				return heading(item.text || item.content, item.level || 2, item.className);
			case 'paragraph':
				return paragraph(item.text || item.content, item.className);
			case 'image':
				return image(item, item.className);
			case 'buttons':
				return buttons(item.items, item.className);
			case 'list':
				return list(item.items, item.ordered);
			case 'separator':
				return createBlock('core/separator', { className: string(item.className) });
			case 'spacer':
				return createBlock('core/spacer', { height: string(item.height, '32px') });
			case 'quote':
				return createBlock('core/quote', { value: sanitizeInline(item.text), citation: sanitizeInline(item.citation) });
			case 'details':
				return createBlock('core/details', { summary: sanitizeInline(item.summary || item.title) }, [paragraph(item.text)]);
			case 'cards':
				return grid(array(item.items).map(card), 'lr-card-grid ' + string(item.className), item.minimumColumnWidth);
			case 'columns':
				return createBlock(
					'core/columns',
					{ className: string(item.className), isStackedOnMobile: item.isStackedOnMobile !== false },
					array(item.items).map(function (column) {
						return createBlock('core/column', {}, array(column.blocks || column).map(function (child) {
							return convertContentBlock(child, warnings);
						}).filter(Boolean));
					})
				);
			case 'quiz':
				return createBlock('lenremont/quiz', {
					title: string(item.title, 'Что нужно вашему сиденью?'),
					intro: string(item.text || item.intro),
					service: string(item.service),
					options: array(item.options).map(String),
					flow: item.flow && typeof item.flow === 'object' && !Array.isArray(item.flow) ? item.flow : {}
				});
			case 'beforeAfter':
				return createBlock('lenremont/before-after', {
					title: string(item.title),
					beforeUrl: safeUrl(item.before && (item.before.url || item.before.src)),
					beforeAlt: string(item.before && item.before.alt, 'До ремонта'),
					afterUrl: safeUrl(item.after && (item.after.url || item.after.src)),
					afterAlt: string(item.after && item.after.alt, 'После ремонта')
				});
			case 'leadForm':
				return createBlock('lenremont/lead-form', {
					title: string(item.title),
					text: string(item.text),
					service: string(item.service),
					buttonLabel: string(item.buttonLabel, 'Жду звонка')
				});
			default:
				warnings.push('Неизвестный тип блока: ' + type);
				return item.text ? paragraph(item.text) : null;
		}
	}

	function convertSection(section, warnings) {
		var type = string(section && section.type, 'content');
		var inner = sectionHeader(section || {});

		if (type === 'hero') {
			var copy = [];
			if (section.eyebrow) copy.push(paragraph(section.eyebrow, 'lr-eyebrow'));
			copy.push(heading(section.title, 1, 'lr-hero__title'));
			if (section.text) copy.push(paragraph(section.text, 'lr-hero__intro'));
			if (array(section.buttons).length) copy.push(buttons(section.buttons, 'lr-hero__actions'));
			if (section.quiz) {
				var intro = createBlock('core/group', { className: 'lr-hero__intro-grid', layout: { type: 'default' } }, copy);
				var quizColumn = createBlock('core/column', { className: 'lr-hero__quiz', anchor: 'quiz' }, [convertContentBlock(Object.assign({ type: 'quiz' }, section.quiz), warnings)]);
				var heroColumns = [quizColumn];
				if (section.image) heroColumns.push(createBlock('core/column', { className: 'lr-hero__media' }, [image(section.image)]));
				var heroInner = [intro, createBlock('core/columns', { className: 'lr-hero__grid', isStackedOnMobile: true }, heroColumns)];
				if (section.phone) heroInner.push(createBlock('core/group', { className: 'lr-hero__phone', layout: { type: 'default' } }, [
					paragraph('Также можете позвонить нам по телефону'),
					buttons([section.phone])
				]));
				return wrapSection(type, heroInner, section);
			}

			var columns = [createBlock('core/column', { className: 'lr-hero__content' }, copy)];
			if (section.image) columns.push(createBlock('core/column', { className: 'lr-hero__media' }, [image(section.image)]));
			return wrapSection(type, [createBlock('core/columns', { className: 'lr-hero__grid', verticalAlignment: 'center' }, columns)], section);
		}

		if (type === 'cards' || type === 'proof' || type === 'services' || type === 'materials' || type === 'pricing' || type === 'process' || type === 'links') {
			inner.push(grid(array(section.items).map(card), 'lr-card-grid lr-card-grid--' + slug(type), section.minimumColumnWidth));
			return wrapSection(type, inner, section);
		}

		if (type === 'portfolio') {
			inner.push(grid(array(section.items).map(function (item) {
				return createBlock('core/group', { className: 'lr-portfolio-card', layout: { type: 'constrained' } }, [
					item.eyebrow ? paragraph(item.eyebrow, 'lr-eyebrow') : null,
					convertContentBlock(Object.assign({ type: 'beforeAfter' }, item), warnings),
					item.text ? paragraph(item.text) : null,
					item.link ? buttons([item.link]) : null
				].filter(Boolean));
			}), 'lr-portfolio-grid', '420px'));
			return wrapSection(type, inner, section);
		}

		if (type === 'faq') {
			inner.push(createBlock('core/group', { className: 'lr-faq-list', layout: { type: 'constrained' } }, array(section.items).map(function (item) {
				return createBlock('core/details', { summary: sanitizeInline(item.question || item.title) }, [paragraph(item.answer || item.text)]);
			})));
			return wrapSection(type, inner, section);
		}

		if (type === 'contact') {
			if (array(section.buttons).length) inner.push(buttons(section.buttons));
			if (section.form !== false) {
				inner.push(convertContentBlock({
					type: 'leadForm',
					title: section.formTitle || section.title,
					text: section.formText || section.text,
					service: section.service,
					buttonLabel: section.buttonLabel
				}, warnings));
			}
			return wrapSection(type, inner, section);
		}

		array(section.blocks).forEach(function (block) {
			var converted = convertContentBlock(block, warnings);
			if (converted) inner.push(converted);
		});

		return wrapSection(type, inner, section);
	}

	function countBlocks(blocks) {
		return array(blocks).reduce(function (total, block) {
			return total + 1 + countBlocks(block.innerBlocks);
		}, 0);
	}

	function convertManifest(manifest) {
		if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
			throw new Error('Корневое значение JSON должно быть объектом.');
		}
		if (!Array.isArray(manifest.sections)) {
			throw new Error('В манифесте отсутствует массив sections.');
		}
		if (manifest.profile === 'astro-main-v1') return convertReference(manifest);

		var warnings = [];
		var sections = manifest.sections.map(function (section) {
			return convertSection(section, warnings);
		});
		var theme = typeof manifest.theme === 'string' ? manifest.theme : (manifest.theme && manifest.theme.slug);
		var root = createBlock(
			'core/group',
			{
				align: 'full',
				anchor: 'hop-gutenberg',
				className: 'lr-imported-page lr-theme-' + slug(theme || 'default'),
				layout: { type: 'default' }
			},
			sections
		);

		return {
			title: string(manifest.title),
			blocks: [root],
			summary: {
				sections: sections.length,
				blocks: countBlocks([root]),
				warnings: warnings
			}
		};
	}

	function convertReference(manifest) {
		var reference = env.LenremontReferenceBlocks;
		if (!reference) throw new Error('Для точного переноса обновите плагин до версии 0.4.0.');
		var total = 0;
		function node(item, depth) {
			if (!item || typeof item !== 'object' || depth > 35 || ++total > 2500) throw new Error('Недопустимая структура исходного лендинга.');
			var attributes = reference.cleanAttributes(item.attributes || {});
			var tag = item.tag;
			if (item.type === 'art') return createBlock('lenremont/art', { asset: string(item.key) });
			if (item.type === 'widget') return createBlock('lenremont/reference-widget', { widget: string(item.key) });
			if (item.type === 'quiz') return createBlock('lenremont/reference-quiz', { attributes: attributes });
			if (item.type === 'image') return createBlock('lenremont/picture', { attributes: attributes });
			if (item.type === 'text') {
				if (item.raw === true) return createBlock('lenremont/text', { tag: 'span', raw: true, text: string(item.text).replace(/\s+/g, ' '), attributes: attributes });
				// HTML source newlines are whitespace, not RichText hard line breaks.
				var content = sanitizeInline(string(item.text).replace(/\s+/g, ' ').trim());
				if (tag === 'p' || /^h[1-6]$/.test(tag)) {
					var attrs = { content: content, className: attributes.class || '', anchor: attributes.id || '' };
					if (tag !== 'p') attrs.level = Number(tag.slice(1));
					return createBlock(tag === 'p' ? 'core/paragraph' : 'core/heading', attrs);
				}
				if (!reference.textTags.includes(tag)) throw new Error('Недопустимый текстовый элемент: ' + tag);
				return createBlock('lenremont/text', { tag: tag, text: content, attributes: attributes });
			}
			if (item.type !== 'element' || !reference.tags.includes(tag)) throw new Error('Недопустимый элемент: ' + tag);
			var children = array(item.children).map(function (child) { return node(child, depth + 1); });
			var metadata = item.name ? { name: string(item.name) } : undefined;
			if (['div', 'section', 'article', 'main', 'header', 'footer', 'aside', 'nav'].includes(tag) && Object.keys(attributes).every(function (key) { return key === 'class' || key === 'id'; })) {
				return createBlock('core/group', { tagName: tag, className: attributes.class || '', anchor: attributes.id || '', layout: { type: 'default' }, metadata: metadata }, children);
			}
			return createBlock('lenremont/element', { tag: tag, attributes: attributes, metadata: metadata }, children);
		}
		var sections = manifest.sections.map(function (section) { return node(section.tree, 0); });
		var content = array(manifest.before).map(function (item) { return node(item, 0); });
		content.push(createBlock('core/group', { tagName: 'main', anchor: 'top', layout: { type: 'default' } }, sections));
		content = content.concat(array(manifest.after).map(function (item) { return node(item, 0); }));
		var root = createBlock('core/group', { align: 'full', anchor: 'hop-gutenberg', className: 'lr-reference lr-imported-page-reference', layout: { type: 'default' } }, content);
		return { title: string(manifest.title), blocks: [root], summary: { sections: sections.length, blocks: countBlocks([root]), warnings: [] } };
	}

	function nodeClass(node) {
		if (!node || !node.getAttribute) return '';
		return string(node.getAttribute('class'))
			.split(/\s+/)
			.filter(function (name) { return /^[a-z0-9_-]+$/i.test(name); })
			.slice(0, 8)
			.join(' ');
	}

	function convertHtmlNode(node, warnings) {
		if (!node) return [];
		if (node.nodeType === 3) {
			var text = string(node.textContent).trim();
			return text ? [paragraph(text)] : [];
		}
		if (node.nodeType !== 1) return [];

		var tag = node.tagName.toLowerCase();
		var className = nodeClass(node);
		if (/^h[1-6]$/.test(tag)) return [heading(node.innerHTML, Number(tag.charAt(1)), className)];
		if (tag === 'p') return [paragraph(node.innerHTML, className)];
		if (tag === 'img') return [image({ src: node.getAttribute('src'), alt: node.getAttribute('alt') }, className)];
		if (tag === 'ul' || tag === 'ol') {
			return [list(Array.prototype.map.call(node.children, function (child) { return child.innerHTML; }), tag === 'ol')];
		}
		if (tag === 'hr') return [createBlock('core/separator', { className: className })];
		if (tag === 'blockquote') return [createBlock('core/quote', { value: sanitizeInline(node.innerHTML) })];
		if (tag === 'details') {
			var summary = node.querySelector(':scope > summary');
			var body = Array.prototype.filter.call(node.childNodes, function (child) { return child !== summary; })
				.map(function (child) { return child.textContent || ''; }).join(' ').trim();
			return [createBlock('core/details', { summary: sanitizeInline(summary ? summary.innerHTML : 'Подробнее') }, [paragraph(body)])];
		}
		if ((tag === 'a' || tag === 'button') && string(node.textContent).trim()) {
			return [buttons([{ label: node.textContent.trim(), url: tag === 'a' ? node.getAttribute('href') : '#' }])];
		}
		if (tag === 'table') {
			var bodyRows = Array.prototype.map.call(node.querySelectorAll('tr'), function (row) {
				return {
					cells: Array.prototype.map.call(row.children, function (cell) {
						return { content: sanitizeInline(cell.innerHTML), tag: cell.tagName.toLowerCase() };
					})
				};
			});
			return [createBlock('core/table', { body: bodyRows, className: className })];
		}

		var children = [];
		Array.prototype.forEach.call(node.childNodes, function (child) {
			children = children.concat(convertHtmlNode(child, warnings));
		});

		if (tag === 'section' || tag === 'article' || tag === 'main' || tag === 'header' || tag === 'footer' || tag === 'div') {
			return [createBlock('core/group', {
				className: ('lr-html-' + tag + ' ' + className).trim(),
				layout: { type: 'constrained' }
			}, children)];
		}

		return children;
	}

	function convertHtml(source) {
		if (!env.DOMParser) throw new Error('В этом браузере недоступен DOMParser.');
		var document = new env.DOMParser().parseFromString(string(source), 'text/html');
		document.querySelectorAll('script, style, iframe, object, embed, form').forEach(function (node) { node.remove(); });
		var warnings = ['HTML-конвертация переносит структуру и контент, но не переносит произвольные CSS и JavaScript.'];
		var converted = [];
		Array.prototype.forEach.call(document.body.childNodes, function (node) {
			converted = converted.concat(convertHtmlNode(node, warnings));
		});
		var root = createBlock('core/group', {
			align: 'full',
			anchor: 'hop-gutenberg',
			className: 'lr-imported-page lr-theme-default lr-imported-from-html',
			layout: { type: 'default' }
		}, converted);

		return {
			title: string(document.title),
			blocks: [root],
			summary: { sections: converted.length, blocks: countBlocks([root]), warnings: warnings }
		};
	}

	return {
		convertManifest: convertManifest,
		convertHtml: convertHtml,
		countBlocks: countBlocks
	};
});
