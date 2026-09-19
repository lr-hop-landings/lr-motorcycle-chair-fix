(function (wp, config) {
	'use strict';

	// Core/group uses an extra inner container when a classic theme disables
	// layout support. Enable the modern DOM only for a single reference landing.
	// This is editor state, not block attributes: no content migration or autosave.
	var previousLayoutSupport;
	var ownsLayoutSupport = false;
	function syncReferenceLayout() {
		var store = wp.data.select('core/block-editor');
		if (!store || !store.getSettings) return;
		var settings = store.getSettings();
		var blocks = store.getBlocks();
		var isReference = blocks.length === 1 && blocks[0].name === 'core/group' && /(?:^|\s)(?:lr-reference|lr-ai-page)(?:\s|$)/.test(blocks[0].attributes.className || '');
		if (isReference && settings.supportsLayout !== true) {
			if (!ownsLayoutSupport) previousLayoutSupport = settings.supportsLayout;
			ownsLayoutSupport = true;
			wp.data.dispatch('core/block-editor').updateSettings({ supportsLayout: true });
		} else if (!isReference && ownsLayoutSupport) {
			ownsLayoutSupport = false;
			wp.data.dispatch('core/block-editor').updateSettings({ supportsLayout: previousLayoutSupport });
		}
	}
	wp.data.subscribe(syncReferenceLayout, 'core/block-editor');
	syncReferenceLayout();

	var el = wp.element.createElement;
	var useState = wp.element.useState;
	var registerPlugin = wp.plugins.registerPlugin;
	var editorPackage = wp.editor || wp.editPost;
	var PluginSidebar = editorPackage && editorPackage.PluginSidebar;
	var PluginSidebarMoreMenuItem = editorPackage && editorPackage.PluginSidebarMoreMenuItem;
	var components = wp.components;
	var converter = window.LenremontPageConverter;

	if (!PluginSidebar || !PluginSidebarMoreMenuItem || !converter) {
		return;
	}

	function ImporterSidebar() {
		var sourceTypeState = useState('manifest');
		var sourceType = sourceTypeState[0];
		var setSourceType = sourceTypeState[1];
		var sourceState = useState('');
		var source = sourceState[0];
		var setSource = sourceState[1];
		var reportState = useState(null);
		var report = reportState[0];
		var setReport = reportState[1];
		var busyState = useState(false);
		var busy = busyState[0];
		var setBusy = busyState[1];
		var pendingState = useState(null);
		var pending = pendingState[0];
		var setPending = pendingState[1];
		var examples = config.examples && config.examples.length ? config.examples : [{ label: 'Главный лендинг', value: config.exampleUrl }];
		var exampleState = useState(examples[0].value);
		var seoEnabled = useState(true);
		var seoOverwrite = useState(false);
		var seoUndo = useState([]);
		var seoImporter = window.LenremontSeoImport;
		function seoPlan() {
			return seoEnabled[0] && sourceType === 'manifest' ? seoImporter.plan(JSON.parse(normalizeSource(source)).seo, document, seoOverwrite[0]) : null;
		}
		function applySeoPlan(plan) {
			if (!plan || !plan.total) return;
			var changes = seoImporter.apply(plan);
			if (changes.length) seoUndo[1](changes);
			notify(plan.missing.length ? 'warning' : 'success', 'SEO: заполнено ' + changes.length + ', сохранено без замены ' + plan.preserved.length + '. ' + (plan.missing.length ? 'Не найдены поля сайта: ' + plan.missing.join(', ') + '. ' : '') + 'Нажмите «Сохранить», чтобы записать значения.');
		}
		function applySeoOnly() {
			try {
				var plan = seoPlan();
				if (!plan || !plan.total) { notify('warning', 'В JSON нет поддерживаемых непустых полей seo.'); return; }
				applySeoPlan(plan);
			} catch (error) { notify('error', error.message); }
		}

		function notify(status, message) {
			wp.data.dispatch('core/notices').createNotice(status, message, {
				type: 'snackbar',
				isDismissible: true
			});
		}

		function normalizeSource(value) {
			return String(value || '').replace(/\{\{pluginUrl\}\}/g, String(config.pluginUrl || ''));
		}

		function parse() {
			var prepared = normalizeSource(source);
			if (!prepared.trim()) throw new Error('Добавьте JSON, HTML или блочную разметку.');
			if (sourceType === 'manifest') return converter.convertManifest(JSON.parse(prepared));
			if (sourceType === 'html') return converter.convertHtml(prepared);

			var parsed = wp.blocks.parse(prepared);
			if (!parsed.length) throw new Error('Блочная разметка не содержит распознаваемых блоков.');
			return {
				title: '',
				blocks: parsed,
				summary: { sections: parsed.length, blocks: converter.countBlocks(parsed), warnings: [] }
			};
		}

		function preview() {
			try {
				var result = parse();
				var plan = seoPlan();
				if (plan && plan.total) result.summary.warnings.push('SEO: к заполнению ' + plan.changes.length + ', без замены ' + plan.preserved.length + ', не найдено полей ' + plan.missing.length + '.');
				setReport(result.summary);
				notify('success', 'Источник успешно распознан.');
			} catch (error) {
				setReport(null);
				notify('error', error.message || 'Не удалось разобрать источник.');
			}
		}

		function commitBlocks(result) {
			try {
				var plan = seoPlan(); // Validate before changing any blocks.
				wp.data.dispatch('core/block-editor').resetBlocks(result.blocks);
				var currentTitle = wp.data.select('core/editor').getEditedPostAttribute('title');
				if (!currentTitle && result.title) wp.data.dispatch('core/editor').editPost({ title: result.title });
				setReport(result.summary);
				setPending(null);
				notify('success', 'Страница преобразована в ' + result.summary.blocks + ' блоков. Нажмите «Сохранить», чтобы записать изменения.');
				applySeoPlan(plan);
			} catch (error) {
				notify('error', error.message || 'Преобразование завершилось с ошибкой.');
			}
		}

		function applyBlocks() {
			try {
				var result = parse();
				var currentBlocks = wp.data.select('core/block-editor').getBlocks();
				if (currentBlocks.length) { setPending(result); return; }
				commitBlocks(result);
			} catch (error) {
				notify('error', error.message || 'Не удалось разобрать источник.');
			}
		}

		function loadExample() {
			setBusy(true);
			window.fetch(exampleState[0], { credentials: 'same-origin' })
				.then(function (response) {
					if (!response.ok) throw new Error('Не удалось загрузить пример.');
					return response.text();
				})
				.then(function (text) {
					setSourceType('manifest');
					setSource(text);
					setReport(null);
				})
				.catch(function (error) { notify('error', error.message); })
				.finally(function () { setBusy(false); });
		}

		function loadFile(event) {
			var file = event.target.files && event.target.files[0];
			if (!file) return;
			var reader = new window.FileReader();
			reader.onload = function () {
				setSource(String(reader.result || ''));
				if (/\.html?$/i.test(file.name)) setSourceType('html');
				if (/\.json$/i.test(file.name)) setSourceType('manifest');
				setReport(null);
			};
			reader.onerror = function () { notify('error', 'Не удалось прочитать файл.'); };
			reader.readAsText(file);
		}

		return el(
			wp.element.Fragment,
			null,
			pending && el(components.Modal, { title: 'Заменить содержимое страницы?', onRequestClose: function () { setPending(null); } },
				el('p', null, 'Будут вставлены ' + pending.summary.sections + ' секций. Замену блоков можно отменить кнопкой «Отменить» редактора. Для SEO есть отдельная кнопка отмены. Сохранение выполняется отдельно.'),
				el('div', { className: 'lr-importer-actions' },
					el(components.Button, { variant: 'secondary', onClick: function () { setPending(null); } }, 'Отмена'),
					el(components.Button, { variant: 'primary', onClick: function () { commitBlocks(pending); } }, 'Заменить содержимое')
				)
			),
			el(PluginSidebarMoreMenuItem, { target: 'lenremont-page-importer-sidebar' }, 'Импорт страницы Ленремонт'),
			el(
				PluginSidebar,
				{ name: 'lenremont-page-importer-sidebar', title: 'Импорт страницы', icon: 'migrate' },
				el('div', { className: 'lr-importer-panel' },
					el(components.Notice, { status: 'info', isDismissible: false }, 'Импорт происходит только в редакторе. Изменения попадут на сайт после сохранения страницы.'),
					el(components.SelectControl, {
						label: 'Формат источника',
						value: sourceType,
						options: [
							{ label: 'Lenremont JSON', value: 'manifest' },
							{ label: 'Семантический HTML', value: 'html' },
							{ label: 'Разметка Gutenberg', value: 'blocks' }
						],
						onChange: function (value) { setSourceType(value); setReport(null); }
					}),
					el(components.TextareaControl, {
						label: sourceType === 'manifest' ? 'JSON-манифест' : (sourceType === 'html' ? 'HTML страницы' : 'Блочная разметка'),
						value: source,
						rows: 14,
						onChange: function (value) { setSource(value); setReport(null); },
						placeholder: sourceType === 'manifest' ? '{ "title": "...", "sections": [] }' : '<main>...</main>'
					}),
					el(components.SelectControl, { label: 'Готовая страница', value: exampleState[0], options: examples, onChange: exampleState[1] }),
					el('label', { className: 'lr-importer-file' },
						el('span', null, 'Или выберите файл'),
						el('input', { type: 'file', accept: '.json,.html,.htm,.txt', onChange: loadFile })
					),
					el('div', { className: 'lr-importer-actions' },
						el(components.Button, { variant: 'secondary', onClick: loadExample, isBusy: busy, disabled: busy }, 'Загрузить пример'),
						el(components.Button, { variant: 'secondary', onClick: preview, disabled: !source.trim() }, 'Проверить')
					),
					report && el('div', { className: 'lr-importer-report' },
						el('strong', null, 'Результат проверки'),
						el('p', null, 'Секций: ' + report.sections + ' · блоков: ' + report.blocks),
						report.warnings && report.warnings.length ? el('ul', null, report.warnings.map(function (warning, index) {
							return el('li', { key: index }, warning);
						})) : null
					),
					sourceType === 'manifest' && el(components.CheckboxControl, { label: 'Заполнять SEO из JSON', checked: seoEnabled[0], onChange: seoEnabled[1] }),
					sourceType === 'manifest' && seoEnabled[0] && el(components.CheckboxControl, { label: 'Перезаписывать заполненные SEO-поля', checked: seoOverwrite[0], onChange: seoOverwrite[1], help: 'По умолчанию заполняются только пустые поля. Пустые значения JSON ничего не удаляют.' }),
					sourceType === 'manifest' && seoEnabled[0] && el(components.Button, { variant: 'secondary', onClick: applySeoOnly, disabled: !source.trim() }, 'Применить только SEO'),
					seoUndo[0].length > 0 && el(components.Button, { variant: 'tertiary', onClick: function () { var count = seoImporter.undo(seoUndo[0]); seoUndo[1]([]); notify('info', 'Отменено SEO-полей: ' + count + '. Последующие ручные правки сохранены.'); } }, 'Отменить последнее заполнение SEO'),
					el(components.Button, { variant: 'primary', onClick: applyBlocks, disabled: !source.trim(), className: 'lr-importer-submit' }, 'Преобразовать в блоки')
				)
			)
		);
	}

	registerPlugin('lenremont-page-importer', { render: ImporterSidebar, icon: 'migrate' });
})(window.wp, window.LenremontPageImporterConfig || {});
