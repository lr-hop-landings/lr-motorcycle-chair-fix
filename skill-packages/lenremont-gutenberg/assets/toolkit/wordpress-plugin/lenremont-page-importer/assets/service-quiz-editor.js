(function (wp) {
	'use strict';
	var el = wp.element.createElement, c = wp.components, be = wp.blockEditor;
	wp.blocks.registerBlockType('lenremont/service-quiz', {
		edit: function (props) {
			var a = props.attributes, questions = (Array.isArray(a.questions) ? a.questions : []).slice(0, 8).map(function (q) {
				return { title: q && typeof q.title === 'string' ? q.title : '', options: q && Array.isArray(q.options) ? q.options.slice(0, 12).filter(function (s) { return typeof s === 'string'; }) : [] };
			});
			function change(index, patch) { props.setAttributes({ questions: questions.map(function (q, i) { return i === index ? Object.assign({}, q, patch) : q; }) }); }
			function field(key, label, area) { return el(area ? c.TextareaControl : c.TextControl, { label: label, value: a[key], onChange: function (value) { var patch = {}; patch[key] = value; props.setAttributes(patch); } }); }
			return el(wp.element.Fragment, null,
				el(be.InspectorControls, null,
					el(c.PanelBody, { title: 'Квиз: содержание и оформление' },
						field('title', 'Заголовок квиза'), field('intro', 'Описание', true), field('service', 'Услуга в заявке'),
						field('resultTitle', 'Заголовок результата'), field('buttonLabel', 'Кнопка заявки'),
						el(c.SelectControl, { label: 'Варианты ответов', value: a.variant, options: [{ label: 'Строки', value: 'list' }, { label: 'Две колонки', value: 'cards' }], onChange: function (variant) { props.setAttributes({ variant: variant }); } }),
						el('p', null, '1–8 вопросов, 2–12 ответов на каждый. Отправкой управляет HTML On Page Lead Capture на сайте.')),
					questions.map(function (q, i) { return el(c.PanelBody, { key: i, title: 'Вопрос ' + (i + 1), initialOpen: i === 0 },
						el(c.TextControl, { label: 'Текст вопроса ' + (i + 1), value: q.title, onChange: function (title) { change(i, { title: title }); } }),
						el(c.TextareaControl, { label: 'Ответы на вопрос ' + (i + 1), help: 'Каждый ответ с новой строки.', value: (q.options || []).join('\n'), onChange: function (value) { change(i, { options: value.split(/\r?\n/).slice(0, 12) }); } }),
						el(c.Button, { variant: 'secondary', disabled: i === 0, onClick: function () { var next = questions.slice(); next[i] = next[i - 1]; next[i - 1] = q; props.setAttributes({ questions: next }); } }, 'Выше'),
						el(c.Button, { variant: 'tertiary', isDestructive: true, disabled: questions.length <= 1, onClick: function () { props.setAttributes({ questions: questions.filter(function (_, n) { return n !== i; }) }); } }, 'Удалить вопрос'));
					}),
					el(c.PanelBody, { title: 'Добавление вопросов' }, el(c.Button, { variant: 'secondary', disabled: questions.length >= 8, onClick: function () { props.setAttributes({ questions: questions.concat([{ title: 'Новый вопрос', options: ['Ответ 1', 'Ответ 2'] }]) }); } }, 'Добавить вопрос'))),
				el('div', be.useBlockProps({ className: 'lr-ai-quiz lr-ai-quiz--' + a.variant }),
					el('h2', null, a.title), el('p', { className: 'lr-ai-muted' }, a.intro),
					el('p', { className: 'lr-ai-quiz-progress' }, 'Вопрос 1 из ' + questions.length),
					el('h3', null, questions[0] && questions[0].title),
					el('div', { className: 'lr-ai-quiz-options' }, ((questions[0] || {}).options || []).map(function (text, i) { return el('span', { key: i, className: 'lr-ai-quiz-option' }, text); })),
					questions.some(function (q) { return !q.title.trim() || (q.options || []).filter(function (s) { return s.trim(); }).length < 2; }) ? el(c.Notice, { status: 'warning', isDismissible: false }, 'Заполните название и минимум два ответа для каждого вопроса. Неполные вопросы не выводятся на сайте.') : null,
					el('p', { className: 'lr-ai-small lr-ai-muted' }, 'Предпросмотр первого вопроса. Настройки всех вопросов — справа; прохождение — в просмотре страницы.')));
		},
		save: function () { return null; }
	});
})(window.wp);
