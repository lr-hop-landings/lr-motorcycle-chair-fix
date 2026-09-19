(function (wp) {
	'use strict';

	var el = wp.element.createElement;
	var registerBlockType = wp.blocks.registerBlockType;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var MediaUpload = wp.blockEditor.MediaUpload;
	var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
	var PanelBody = wp.components.PanelBody;
	var TextControl = wp.components.TextControl;
	var TextareaControl = wp.components.TextareaControl;
	var Button = wp.components.Button;

	function previewShell(props, children, className) {
		return el('div', useBlockProps({ className: className || 'lr-interactive-card lr-block-preview' }), children);
	}

	registerBlockType('lenremont/quiz', {
		apiVersion: 3,
		title: 'Квиз Ленремонт',
		category: 'widgets',
		icon: 'forms',
		attributes: {
			title: { type: 'string', default: 'Что нужно вашему сиденью?' },
			intro: { type: 'string', default: 'Выберите задачу — подскажем, с чего начать.' },
			service: { type: 'string', default: 'Перетяжка сиденья' },
			flow: { type: 'object', default: {} },
			options: { type: 'array', default: ['Восстановить обивку', 'Изменить дизайн', 'Разобраться с посадкой'] }
		},
		edit: function (props) {
			var attributes = props.attributes;
			var optionsText = (attributes.options || []).join('\n');
			return el(wp.element.Fragment, null,
				el(InspectorControls, null,
					el(PanelBody, { title: 'Настройки квиза', initialOpen: true },
						el(TextControl, { label: 'Заголовок', value: attributes.title, onChange: function (value) { props.setAttributes({ title: value }); } }),
						el(TextareaControl, {
							label: 'Варианты — по одному на строке',
							value: optionsText,
							onChange: function (value) { props.setAttributes({ options: value.split(/\r?\n/).map(function (item) { return item.trim(); }).filter(Boolean) }); }
						}),
						el(TextControl, { label: 'Услуга', value: attributes.service, onChange: function (value) { props.setAttributes({ service: value }); } })
					)
				),
				previewShell(props, [
					el('span', { className: 'lr-editor-badge', key: 'badge' }, attributes.flow && attributes.flow.branches ? 'Вопрос 1 из 4' : 'Интерактивный квиз'),
					el('h3', { key: 'title' }, attributes.title),
					el('p', { key: 'intro' }, attributes.intro),
					el('div', { className: 'lr-choice-list', key: 'options' }, (attributes.options || []).map(function (option, index) {
						return el('span', { className: 'lr-choice', key: index }, option, el('span', { 'aria-hidden': true }, '→'));
					}))
				])
			);
		},
		save: function () { return null; }
	});

	function mediaControl(label, url, onSelect) {
		return el('div', { className: 'lr-media-control' },
			el('strong', null, label),
			url ? el('img', { src: url, alt: '' }) : null,
			el(MediaUploadCheck, null,
				el(MediaUpload, {
					onSelect: onSelect,
					allowedTypes: ['image'],
					render: function (renderProps) {
						return el(Button, { variant: 'secondary', onClick: renderProps.open }, url ? 'Заменить' : 'Выбрать');
					}
				})
			)
		);
	}

	registerBlockType('lenremont/before-after', {
		apiVersion: 3,
		title: 'До и после',
		category: 'media',
		icon: 'image-flip-horizontal',
		attributes: {
			title: { type: 'string', default: 'Результат работы' },
			beforeUrl: { type: 'string', default: '' },
			beforeAlt: { type: 'string', default: 'До ремонта' },
			afterUrl: { type: 'string', default: '' },
			afterAlt: { type: 'string', default: 'После ремонта' }
		},
		edit: function (props) {
			var attributes = props.attributes;
			return el(wp.element.Fragment, null,
				el(InspectorControls, null,
					el(PanelBody, { title: 'Фотографии', initialOpen: true },
						el(TextControl, { label: 'Подпись', value: attributes.title, onChange: function (value) { props.setAttributes({ title: value }); } }),
						mediaControl('До', attributes.beforeUrl, function (media) { props.setAttributes({ beforeUrl: media.url, beforeAlt: media.alt || 'До ремонта' }); }),
						mediaControl('После', attributes.afterUrl, function (media) { props.setAttributes({ afterUrl: media.url, afterAlt: media.alt || 'После ремонта' }); })
					)
				),
				previewShell(props, [
					el('span', { className: 'lr-editor-badge', key: 'badge' }, 'Сравнение до/после'),
					el('h3', { key: 'title' }, attributes.title),
					el('div', { className: 'lr-before-after-editor', key: 'images' },
						attributes.beforeUrl ? el('img', { src: attributes.beforeUrl, alt: attributes.beforeAlt }) : el('span', null, 'Фото «До»'),
						attributes.afterUrl ? el('img', { src: attributes.afterUrl, alt: attributes.afterAlt }) : el('span', null, 'Фото «После»')
					)
				], 'lr-block-preview')
			);
		},
		save: function () { return null; }
	});

	registerBlockType('lenremont/lead-form', {
		apiVersion: 3,
		title: 'Форма заявки Ленремонт',
		category: 'widgets',
		icon: 'phone',
		attributes: {
			title: { type: 'string', default: 'Обсудим вашу задачу?' },
			text: { type: 'string', default: 'Оставьте телефон — специалист уточнит детали и предварительно оценит работу.' },
			service: { type: 'string', default: 'Перетяжка сиденья' },
			buttonLabel: { type: 'string', default: 'Жду звонка' }
		},
		edit: function (props) {
			var attributes = props.attributes;
			return el(wp.element.Fragment, null,
				el(InspectorControls, null,
					el(PanelBody, { title: 'Настройки формы', initialOpen: true },
						el(TextControl, { label: 'Заголовок', value: attributes.title, onChange: function (value) { props.setAttributes({ title: value }); } }),
						el(TextareaControl, { label: 'Описание', value: attributes.text, onChange: function (value) { props.setAttributes({ text: value }); } }),
						el(TextControl, { label: 'Услуга', value: attributes.service, onChange: function (value) { props.setAttributes({ service: value }); } }),
						el(TextControl, { label: 'Текст кнопки', value: attributes.buttonLabel, onChange: function (value) { props.setAttributes({ buttonLabel: value }); } })
					)
				),
				previewShell(props, [
					el('span', { className: 'lr-editor-badge', key: 'badge' }, 'Форма заявки'),
					el('h3', { key: 'title' }, attributes.title),
					el('p', { key: 'text' }, attributes.text),
					el('div', { className: 'lr-form-preview', key: 'form' },
						el('span', null, 'Имя'), el('span', null, 'Телефон'), el('strong', null, attributes.buttonLabel)
					)
				])
			);
		},
		save: function () { return null; }
	});
})(window.wp);
