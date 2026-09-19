(function () {
	'use strict';
	var root = document.querySelector('#hop-gutenberg.lr-reference-library');
	if (!root) return;
	root.querySelectorAll('.lr-demo-quiz').forEach(function (demo) {
		var steps = Array.from(demo.querySelectorAll('.lr-demo-step')), current = 0, busy = false;
		demo.addEventListener('click', function (event) {
			var button = event.target.closest('[data-cta]');
			if (!button || !demo.contains(button) || busy) return;
			var action = button.dataset.cta;
			if (!['demo-next', 'demo-back', 'demo-reset'].includes(action)) return;
			var next = action === 'demo-reset' ? 0 : Math.max(0, Math.min(steps.length - 1, current + (action === 'demo-next' ? 1 : -1)));
			if (next === current) return;
			busy = true;
			var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			var animation = !reduced && steps[current].animate ? steps[current].animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: 120, fill: 'forwards' }) : null;
			function change() {
				steps[current].hidden = true; if (animation) animation.cancel(); current = next; steps[current].hidden = false;
				var title = steps[current].querySelector('h2'); if (title) { title.tabIndex = -1; title.focus({ preventScroll: true }); }
				if (!reduced && steps[current].animate) steps[current].animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180 });
				busy = false;
			}
			if (animation) animation.finished.then(change, function () { busy = false; }); else change();
		});
	});
	var quiz = root.querySelector('#quiz-app');
	// Extracted sections may be assembled on any URL; never keep source-page attribution.
	if (quiz) quiz.dataset.pagePath = window.location.pathname;
	root.querySelectorAll('input[name="page_path"]').forEach(function (input) { input.value = window.location.pathname; });
	if (quiz) return; // Original quiz module owns all these interactions when present.
	var dialog = root.querySelector('#contact-dialog'), lastFocus, oldOverflow;
	if (dialog) {
		root.querySelectorAll('[data-contact], [data-intent], a[href="#quiz"], a[href="#estimate"]').forEach(function (button) {
			button.addEventListener('click', function (event) {
				event.preventDefault(); lastFocus = document.activeElement; oldOverflow = document.body.style.overflow;
				dialog.querySelector('#message').value = 'Здравствуйте! Хочу обсудить перетяжку сиденья.\nМодель техники:\nЧто нужно изменить:\nПодскажите, какие сведения нужны для предварительной оценки.';
				dialog.querySelector('#copy-status').textContent = '';
				dialog.showModal(); document.body.style.overflow = 'hidden'; dialog.querySelector('.close').focus();
			});
		});
		dialog.querySelector('.close').addEventListener('click', function () { dialog.close(); });
		dialog.addEventListener('close', function () { document.body.style.overflow = oldOverflow || ''; if (lastFocus) lastFocus.focus({ preventScroll: true }); });
		dialog.addEventListener('click', function (event) { if (event.target === dialog) { var box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close(); } });
		dialog.querySelector('#copy-message').addEventListener('click', async function () {
			var message = dialog.querySelector('#message'), status = dialog.querySelector('#copy-status');
			try { await navigator.clipboard.writeText(message.value); status.textContent = 'Текст скопирован. Откройте мессенджер и добавьте фотографии.'; }
			catch (_) { message.focus(); message.select(); status.textContent = 'Выделите текст и скопируйте вручную.'; }
		});
	}
	window.addEventListener('submit', function (event) {
		var form = event.target;
		if (!form.matches || !form.matches('.callback-form') || !root.contains(form) || event.defaultPrevented) return;
		event.preventDefault();
		var status = form.querySelector('[data-submit-status]'), fallback = form.querySelector('[data-submit-fallback]');
		if (status) { status.hidden = false; status.textContent = 'Отправка заявки сейчас недоступна. Свяжитесь с нами по телефону или в мессенджере.'; }
		if (fallback) fallback.hidden = false;
	});
})();
