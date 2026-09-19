(function (root, factory) {
	var api = factory();
	if (typeof module === 'object' && module.exports) module.exports = api;
	else root.LenremontNeutralLibrary = api;
})(typeof window !== 'undefined' ? window : this, function () {
	'use strict';
	function text(tag, value) { return { type: 'text', tag: tag, text: value, attributes: {} }; }
	function element(tag, attrs, children) { return { type: 'element', tag: tag, attributes: attrs, children: children }; }
	function quiz() {
		return element('div', { class: 'lr-demo-quiz' }, [0, 1, 2, 3].map(function (step) {
			var attrs = { class: 'lr-demo-step' }; if (step) attrs.hidden = 'hidden';
			var panel = element('div', attrs, [
				element('div', { class: 'quiz-head' }, [text('span', step < 3 ? 'Вопрос ' + (step + 1) + ' из 3' : 'Готово')]),
				text('h2', step < 3 ? 'Пример вопроса ' + (step + 1) : 'Спасибо за ваши ответы'),
				element('div', { class: 'choices' }, step < 3 ? [1, 2, 3].map(function (n) {
					return element('button', { type: 'button', class: 'choice', 'data-cta': 'demo-next' }, [element('span', { class: 'icon' }, [text('span', String(n))]), element('span', {}, [text('strong', 'Вариант ответа ' + n), text('small', 'Краткое пояснение к варианту')])]);
				}) : [text('p', 'Это демонстрационный квиз. Ответы не отправляются. Замените вопросы и настройте дальнейшее действие.')]),
				element('button', { type: 'button', class: 'back', 'data-cta': step ? 'demo-back' : 'demo-reset' }, [text('span', step ? 'Назад' : 'Начать заново')])
			]);
			panel.name = step < 3 ? 'Квиз — вопрос ' + (step + 1) : 'Квиз — результат';
			return panel;
		}));
	}
	function manifest(input, placeholder) {
		var copy = JSON.parse(JSON.stringify(input));
		function visit(node, context) {
			if (!node) return node;
			if (node.type === 'quiz') return quiz();
			if (node.type === 'widget') return null;
			var a = node.attributes || {}, tag = node.tag || '', cls = a.class || '';
			var role = tag === 'a' || tag === 'button' ? 'action' : tag === 'summary' ? 'question' : context;
			if (node.type === 'text') {
				var original = (node.text || '').trim();
				var value = tag === 'h1' ? 'Заголовок вашей услуги' : /^h[2-6]$/.test(tag) ? 'Заголовок раздела' : tag === 'p' ? 'Здесь будет описание вашей услуги. Расскажите о важных деталях, преимуществах и результате для клиента.' : role === 'question' ? 'Пример вопроса клиента?' : role === 'action' ? 'Подробнее' : original.length > 65 ? 'Добавьте описание, которое поможет посетителю разобраться в предложении и выбрать подходящий вариант.' : 'Краткое описание';
				if (/^\+?[\d\s()\-]{10,}$/.test(original)) value = '+7 (000) 000-00-00';
				else if (/₽|руб\.|рублей/.test(original)) value = 'от 0 000 ₽';
				else if (/^\d{1,2}$/.test(original) || /^[+→×]$/.test(original)) value = original;
				else if (/^(До|После)$/.test(original)) value = original;
				// Keep inline emphasis/line-break markup, replacing every text run.
				var part = 0;
				node.text = original.replace(/[^<>]+|<[^>]*>/g, function (chunk) {
					if (chunk.charAt(0) === '<') return chunk;
					if (!chunk.trim()) return chunk;
					return part++ ? ' ваш текст' : value;
				});
			}
			if (node.type === 'image') { a.src = placeholder; a.alt = 'Замените изображение'; }
			// Replace service-specific diagrams, but keep shared neutral UI icons.
			if (node.type === 'art' && ['art-88fb5e6b457a', 'art-1a8d77bafda7', 'art-d7cb9e587ecc'].includes(node.key)) node.key = 'art-509008042447';
			if (a.href && !a.href.startsWith('#')) { a.href = '#'; delete a.target; delete a.rel; }
			if (a.href === '#callback') a.href = '#';
			Object.keys(a).forEach(function (key) {
				if (['data-vehicle', 'data-vehicle-options', 'data-page-path', 'data-intent', 'data-contact', 'data-cta', 'data-lead-root'].includes(key)) delete a[key];
				if (key === 'title' || key === 'aria-label') a[key] = 'Элемент шаблона';
			});
			if (node.name) node.name = 'Раздел страницы';
			if (node.children) node.children = node.children.map(function (child) { return visit(child, role); }).filter(Boolean);
			return node;
		}
		copy.title = 'Название страницы'; copy.slug = 'page-example'; copy.path = '/page-example/'; copy.vehicle = ''; delete copy.seo; delete copy.source;
		copy.before = (copy.before || []).map(function (n) { return visit(n, ''); }).filter(Boolean);
		copy.after = [];
		copy.sections.forEach(function (s) { s.tree = visit(s.tree, ''); s.name = 'Раздел страницы'; });
		return copy;
	}
	return { manifest: manifest };
});
