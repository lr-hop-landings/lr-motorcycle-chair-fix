(function () {
	'use strict';
	function init() {
		document.querySelectorAll('.lr-ai-page [data-lr-service-quiz]').forEach(function (quiz) {
			var ui = quiz.querySelector('[data-lr-service-ui]');
			if (!ui || quiz.dataset.lrReady) return;
			quiz.dataset.lrReady = '1';
			var steps = Array.from(quiz.querySelectorAll('[data-lr-service-step]')), result = quiz.querySelector('[data-lr-service-result]');
			var panels = quiz.querySelector('[data-lr-service-panels]'), back = quiz.querySelector('[data-lr-service-back]'), reset = quiz.querySelector('[data-lr-service-reset]');
			var form = quiz.querySelector('form'), status = quiz.querySelector('[data-lr-service-status]');
			var selected = [], step = 0, busy = false;
			var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
			function render(focus) {
				steps.forEach(function (panel, i) { panel.hidden = i !== step; });
				result.hidden = step !== steps.length;
				back.hidden = step === 0; reset.hidden = step === 0;
				quiz.querySelector('[data-lr-service-progress]').textContent = step < steps.length ? 'Вопрос ' + (step + 1) + ' из ' + steps.length : 'Ответы учтены: ' + steps.length + ' из ' + steps.length;
				if (step === steps.length) {
					var summary = quiz.querySelector('[data-lr-service-summary]'); summary.replaceChildren();
					steps.forEach(function (panel, i) { var dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = panel.querySelector('h3').textContent; dd.textContent = selected[i]; summary.append(dt, dd); });
					form.elements.task_type.value = selected[0] || '';
					form.elements.task_detail.value = steps.map(function (p, i) { return p.querySelector('h3').textContent + ': ' + selected[i]; }).join('\n');
					form.elements.page_path.value = window.location.pathname;
				}
				if (focus) (step < steps.length ? steps[step] : result).querySelector('h3').focus({ preventScroll: true });
			}
			function move(next) {
				if (busy) return;
				busy = true; quiz.setAttribute('aria-busy', 'true');
				// Keep feedback visible briefly, then fade out and restore the new panel.
				window.setTimeout(function () {
					panels.classList.add('lr-ai-quiz-changing');
					window.setTimeout(function () {
						step = next; render(true); panels.classList.remove('lr-ai-quiz-changing');
						busy = false; quiz.removeAttribute('aria-busy');
					}, reduced.matches ? 0 : 150);
				}, reduced.matches ? 0 : 180);
			}
			steps.forEach(function (panel, i) {
				panel.querySelectorAll('[data-lr-service-option]').forEach(function (button) {
					button.addEventListener('click', function () {
						if (busy || i !== step) return;
						selected[i] = button.textContent;
						panel.querySelectorAll('[data-lr-service-option]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === button)); });
						move(step + 1);
					});
				});
			});
			back.addEventListener('click', function () { if (step > 0) move(step - 1); });
			reset.addEventListener('click', function () {
				if (busy) return;
				selected = []; form.reset(); status.hidden = true;
				form.elements.phone.setCustomValidity('');
				quiz.querySelector('[data-lead-success]').hidden = true;
				quiz.querySelectorAll('[aria-pressed]').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
				move(0);
			});
			var phone = form.elements.phone;
			phone.addEventListener('input', function () { phone.setCustomValidity(''); });
			form.addEventListener('submit', function (event) {
				var digits = phone.value.replace(/\D/g, '');
				if (digits.length === 10) digits = '7' + digits;
				if (digits.length === 11 && digits.charAt(0) === '8') digits = '7' + digits.slice(1);
				phone.setCustomValidity(/^7\d{10}$/.test(digits) ? '' : 'Введите российский номер: +7 и 10 цифр.');
				if (!form.reportValidity()) { event.preventDefault(); event.stopPropagation(); return; }
				phone.value = '+' + digits;
				status.hidden = true;
				// Valid submit bubbles to the site's delegated HOP handler unchanged.
			});
			ui.hidden = false; quiz.querySelector('[data-lr-service-fallback]').hidden = true; render(false);
		});
	}
	// No handler in a standalone preview: never navigate with personal data or fake success.
	window.addEventListener('submit', function (event) {
		var form = event.target;
		if (!form.matches || !form.matches('[data-lr-service-form]') || event.defaultPrevented) return;
		event.preventDefault();
		var status = form.querySelector('[data-lr-service-status]');
		status.hidden = false; status.textContent = 'Отправка здесь не подключена. Позвоните: +7 (812) 344-44-44.';
	});
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
