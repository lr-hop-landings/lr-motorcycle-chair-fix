(function () {
	'use strict';

	function initBeforeAfter(root) {
		root.querySelectorAll('[data-lr-before-after]').forEach(function (compare) {
			var range = compare.querySelector('.lr-before-after__range');
			if (!range || range.dataset.ready) return;
			range.dataset.ready = '1';
			range.addEventListener('input', function () {
				compare.style.setProperty('--lr-compare', range.value + '%');
			});
		});
	}

	function initQuiz(root) {
		root.querySelectorAll('[data-lr-quiz]').forEach(function (quiz) {
			if (quiz.dataset.ready) return;
			quiz.dataset.ready = '1';
			var question = quiz.querySelector('[data-lr-quiz-question]');
			var result = quiz.querySelector('[data-lr-quiz-result]');
			var answer = quiz.querySelector('[data-lr-quiz-answer]');
			var answerInput = quiz.querySelector('[data-lr-quiz-answer-input]');
			var flow;
			try { flow = JSON.parse(quiz.dataset.lrFlow || '{}'); } catch (error) { flow = {}; }
			if (Array.isArray(flow.branches) && flow.branches.length && Array.isArray(flow.vehicles) && Array.isArray(flow.methods)) {
				initQuizFlow(quiz, flow);
				return;
			}

			quiz.querySelectorAll('[data-lr-quiz-choice]').forEach(function (button) {
				button.addEventListener('click', function () {
					var choice = button.dataset.choice || button.textContent.trim();
					answer.textContent = choice;
					if (answerInput) answerInput.value = choice;
					question.hidden = true;
					result.hidden = false;
				});
			});

			var back = quiz.querySelector('[data-lr-quiz-back]');
			if (back) back.addEventListener('click', function () {
				result.hidden = true;
				question.hidden = false;
			});
		});
	}

	function initQuizFlow(quiz, flow) {
		var question = quiz.querySelector('[data-lr-quiz-question]');
		var result = quiz.querySelector('[data-lr-quiz-result]');
		var progress = quiz.querySelector('[data-lr-quiz-progress]');
		var heading = question.querySelector('h2');
		var intro = question.querySelector('.lr-interactive-card__intro');
		var choices = question.querySelector('.lr-choice-list');
		var initialTitle = heading.textContent;
		var initialIntro = intro ? intro.textContent : '';
		var step = 0;
		var selected = [null, null, null, null];
		var back = document.createElement('button');
		back.type = 'button';
		back.className = 'lr-text-button';
		back.textContent = '← Назад';
		question.appendChild(back);
		back.addEventListener('click', function () { step = Math.max(0, step - 1); render(true); });
		quiz.querySelector('[data-lr-quiz-back]').addEventListener('click', function () { step = 3; render(true); });

		function render(focus) {
			var branch = flow.branches[selected[0]];
			question.hidden = step === 4;
			result.hidden = step !== 4;
			progress.textContent = step < 4 ? 'Вопрос ' + (step + 1) + ' из 4' : 'Готово · все ответы учтены';
			if (step === 4) {
				var detail = branch.options[selected[1]];
				var method = flow.methods[selected[3]];
				var answer = quiz.querySelector('[data-lr-quiz-answer]');
				answer.textContent = detail.title;
				answer.tabIndex = -1;
				var recommendation = result.querySelector('.lr-quiz-recommendation');
				if (!recommendation) {
					recommendation = document.createElement('div');
					recommendation.className = 'lr-quiz-recommendation';
					answer.after(recommendation);
				}
				recommendation.replaceChildren();
				[flow.vehicles[selected[2]] + ' · ' + branch.label + ' · ' + detail.label, detail.advice, detail.factor].forEach(function (text) {
					var paragraph = document.createElement('p');
					paragraph.textContent = text;
					recommendation.appendChild(paragraph);
				});
				var form = result.querySelector('form');
				var values = { quiz_answer: branch.label, task_detail: detail.label, vehicle_type: flow.vehicles[selected[2]], contact_method: method };
				Object.keys(values).forEach(function (key) {
					var input = form.elements.namedItem(key);
					if (!input) { input = document.createElement('input'); input.type = 'hidden'; input.name = key; form.appendChild(input); }
					input.value = values[key];
				});
				form.querySelector('button[type="submit"]').textContent = method === 'Телефон' ? 'Жду звонка' : 'Свяжитесь со мной в ' + method;
				if (focus) answer.focus({ preventScroll: true });
				return;
			}
			var options = step === 0 ? flow.branches : step === 1 ? branch.options : step === 2 ? flow.vehicles : flow.methods;
			heading.textContent = [initialTitle, branch && branch.question, 'На какой технике установлено сиденье?', 'Как с вами связаться?'][step];
			heading.tabIndex = -1;
			if (intro) { intro.textContent = step === 0 ? initialIntro : ''; intro.hidden = step !== 0; }
			back.hidden = step === 0;
			choices.replaceChildren();
			options.forEach(function (option, index) {
				var button = document.createElement('button');
				button.type = 'button';
				button.className = 'lr-choice';
				button.setAttribute('aria-pressed', String(selected[step] === index));
				var label = document.createElement('span');
				label.textContent = typeof option === 'string' ? option : option.label;
				if (option.description) { var small = document.createElement('small'); small.textContent = option.description; label.appendChild(small); }
				var arrow = document.createElement('span'); arrow.textContent = '→'; arrow.setAttribute('aria-hidden', 'true');
				button.append(label, arrow);
				button.addEventListener('click', function () {
					if (step === 0 && selected[0] !== index) selected[1] = null;
					selected[step] = index;
					step++;
					render(true);
				});
				choices.appendChild(button);
			});
			if (focus) heading.focus({ preventScroll: true });
		}
		render(false);
	}

	function initForms(root) {
		root.querySelectorAll('[data-lr-lead-form]').forEach(function (form) {
			if (form.dataset.ready) return;
			form.dataset.ready = '1';
			form.addEventListener('submit', function (event) {
				event.preventDefault();
				if (!form.reportValidity()) return;
				var status = form.querySelector('[data-lr-form-status]');
				if (status) {
					status.hidden = false;
					status.textContent = 'Тестовый режим: форма заполнена корректно. Подключение к обработчику заявок выполняется отдельно.';
				}
			});
		});
	}

	function init(root) {
		initBeforeAfter(root);
		initQuiz(root);
		initForms(root);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function () { init(document); });
	} else {
		init(document);
	}
})();
