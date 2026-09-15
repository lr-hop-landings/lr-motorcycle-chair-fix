const branches = {
    restore: { label: 'Восстановить обивку', description: 'Трещины, разрывы, потёртости', icon: 'needle', question: 'Что случилось с обивкой?', options: [
            { label: 'Разрыв или трещины', title: 'Начните с оценки обивки', advice: 'Покажите повреждение и всё сиденье. По одному крупному плану трудно понять размер и расположение швов.', factor: 'На стоимость влияют материал, размер и пошив чехла. Состояние под ним может потребовать осмотра.' },
            { label: 'Потёрлась или выцвела', title: 'Рассмотрите замену чехла', advice: 'Если нынешняя посадка устраивает, сообщите об этом. Это поможет отдельно обсуждать обновление внешнего вида.', factor: 'На стоимость влияют материал и сложность чехла. Необходимость других работ определяется отдельно.' },
            { label: 'Не знаю, что под чехлом', title: 'Сначала оценим состояние', advice: 'Не нужно разбирать сиденье ради первого обращения. Начните с внешних фотографий и опишите, что заметили.', factor: 'По внешнему виду нельзя точно определить состояние наполнителя. Для этого может потребоваться осмотр.' }
        ] },
    design: { label: 'Изменить дизайн', description: 'Новый цвет, фактура или строчка', icon: 'spark', question: 'Что хотите поменять?', options: [
            { label: 'Цвет или фактуру', title: 'Начните с материала и цвета', advice: 'Приложите фото техники целиком: так проще обсуждать сочетание. Оттенок на экране может отличаться от образца.', factor: 'На стоимость влияют выбранный материал, число сочетаний и конструкция чехла.' },
            { label: 'Строчку или сочетание материалов', title: 'Покажите детали дизайна', advice: 'Отметьте на примере понравившийся шов, рисунок или сочетание. Это точнее, чем название стиля.', factor: 'На стоимость влияют число деталей, схема швов и выбранные материалы.' },
            { label: 'Есть пример, хочу похоже', title: 'Используйте пример как ориентир', advice: 'Пришлите референс вместе с вашим сиденьем сверху и сбоку. Обсудим, как дизайн подходит его форме.', factor: 'Возможность исполнения и стоимость зависят от конструкции вашего сиденья и выбранных деталей.' }
        ] },
    comfort: { label: 'Разобраться с посадкой', description: 'Скользко, жёстко или неудобно', icon: 'seat', question: 'Что мешает в поездке?', options: [
            { label: 'Скольжу по сиденью', title: 'Уточните, когда скользите', advice: 'Опишите условия: при торможении, с пассажиром или постоянно. Укажите экипировку. Это помогает обсудить поверхность и форму.', factor: 'Сначала нужно определить объём изменений. Один новый материал не гарантирует нужный результат.' },
            { label: 'Не устраивает жёсткость', title: 'Опишите ощущения в поездке', advice: 'Укажите, через какое время появляется неудобство и где оно ощущается. Мягче не всегда означает удобнее.', factor: 'Работа с наполнителем отличается от замены обивки. Возможность изменений оценивается по сиденью.' },
            { label: 'Не подходит форма или высота', title: 'Начните с вида сбоку', advice: 'Приложите боковой вид сиденья и напишите, что хотите изменить: высоту, наклон или место посадки.', factor: 'Возможные изменения зависят от конструкции. Конкретное изменение высоты определяется после оценки.' },
            { label: 'Пока трудно описать', title: 'Начните с одной ситуации', advice: 'Расскажите, в какой поездке стало неудобно и что хотелось изменить. Подбирать материал самостоятельно не нужно.', factor: 'Для выбора решения сначала потребуется уточнить проблему. Стоимость зависит от подходящего объёма работ.' }
        ] }
};
const vehicles = ['Мотоцикл', 'Скутер', 'Квадроцикл или багги', 'Другая техника'];
const contactMethods = ['Телефон', 'MAX', 'Telegram', 'VK'];
const initialState = { step: 0, intent: null, detail: null, vehicle: null, method: null, phone: '', profile: '', consent: false };
const state = { ...initialState };
let analysisTimers = [];
const app = document.getElementById('quiz-app'), dialog = document.getElementById('contact-dialog');
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const icon = n => `<svg aria-hidden="true"><use href="#${n}"/></svg>`;
function optionButton(label, index, selected, description = '', symbol = '') {
    return `<button class="choice" type="button" data-choice="${index}" aria-pressed="${selected}">${symbol ? `<span class="icon">${icon(symbol)}</span>` : ''}<span><strong>${label}</strong>${description ? `<small>${description}</small>` : ''}</span><svg class="arrow" aria-hidden="true"><use href="#arrow"/></svg></button>`;
}
function render(focus = true) {
    const current = branches[state.intent];
    const count = state.step === 4 ? 'Анализ ответов' : state.step >= 5 ? 'Готово · все ответы учтены' : `Вопрос ${state.step + 1} из 4`;
    let body = '';
    if (state.step === 0) {
        body = `<h2 id="question-title" tabindex="-1">Что нужно вашему сиденью?</h2><div class="choices">${Object.entries(branches).map(([key, v]) => optionButton(v.label, key, state.intent === key, v.description, v.icon)).join('')}</div>`;
    }
    if (state.step === 1) {
        body = `<h2 id="question-title" tabindex="-1">${current.question}</h2><div class="choices">${current.options.map((v, i) => optionButton(v.label, i, state.detail === i)).join('')}</div><div class="quiz-foot"><button class="text-link" type="button" data-back>← Назад</button><span class="small muted">Выберите ответ, чтобы продолжить</span></div>`;
    }
    if (state.step === 2) {
        body = `<h2 id="question-title" tabindex="-1">На какой технике установлено сиденье?</h2><div class="choices">${vehicles.map((v, i) => optionButton(v, i, state.vehicle === i)).join('')}</div><div class="quiz-foot"><button class="text-link" type="button" data-back>← Назад</button></div><p class="small muted" style="margin-top:10px">Далее выберем удобный способ связи.</p>`;
    }
    if (state.step === 3) {
        body = `<h2 id="question-title" tabindex="-1">Как с вами связаться?</h2><p class="quiz-step-note">Выберите, где удобнее обсудить ваше сиденье со специалистом.</p><div class="choices">${contactMethods.map((method, index) => optionButton(method, index, state.method === index, index === 0 ? 'Позвонить по телефону' : 'Написать в ' + method, index === 0 ? 'phone' : '')).join('')}</div><div class="quiz-foot"><button class="text-link" type="button" data-back>← Назад</button><span class="small muted">После выбора подготовим результат</span></div>`;
    }
    if (state.step === 4) {
        body = `<div class="quiz-analysis" aria-busy="true"><span class="quiz-analysis__spinner" aria-hidden="true"></span><h2 id="question-title" tabindex="-1">Подбираем решение<br>для вашего сиденья</h2><p class="muted">Сопоставляем ваши ответы с возможными вариантами работ.</p><ol class="quiz-analysis__steps" aria-live="polite"><li data-analysis-item>Уточняем задачу</li><li data-analysis-item>Учитываем технику и пожелания</li><li data-analysis-item>Готовим рекомендацию</li></ol></div><div class="quiz-foot"><button class="text-link" type="button" data-back>← Изменить способ связи</button></div>`;
    }
    if (state.step === 5) {
        const result = current.options[state.detail];
        const method = contactMethods[state.method];
        body = `<section class="quiz-recommendation" aria-labelledby="question-title"><span class="result-label">РЕКОМЕНДАЦИЯ ПО ВАШИМ ОТВЕТАМ</span><h2 id="question-title" tabindex="-1">${result.title}</h2><div class="quiz-summary"><strong>${escapeHtml(vehicles[state.vehicle])}</strong><span>${escapeHtml(current.label)} · ${escapeHtml(current.options[state.detail].label)}</span></div><p class="result-body">${result.advice}</p><p class="result-note"><strong>Что влияет на оценку:</strong> ${result.factor}</p></section><div class="quiz-lead-intro"><h3>Обсудим ваше сиденье?</h3><p class="quiz-step-note">${state.method === 0 ? 'Оставьте номер — специалист позвонит, уточнит детали и обсудит предварительную стоимость.' : `Оставьте номер для связи в ${method}. Специалист уточнит детали и обсудит предварительную стоимость.`}</p></div><form class="quiz-lead-form" data-hop-lead-form method="post" novalidate><label for="quiz-phone">Номер телефона</label><input id="quiz-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" maxlength="24" required aria-describedby="quiz-phone-error"><p id="quiz-phone-error" class="quiz-field-error" hidden></p>${state.method === 2 || state.method === 3 ? `<label for="quiz-profile">${state.method === 2 ? 'Имя пользователя или ссылка в Telegram' : 'Ссылка на профиль VK'} <span class="muted">· необязательно</span></label><input id="quiz-profile" name="contact_profile" autocomplete="off" maxlength="200" placeholder="${state.method === 2 ? '@username' : 'vk.ru/username'}"><p class="small muted">Поможет найти вас, если профиль недоступен по номеру.</p>` : ''}<label class="quiz-consent"><input name="privacy_consent" type="checkbox" value="1" required><span>Согласен на обработку персональных данных по <a href="https://www.lenremont.ru/politika-obrabotki-personalnyh-dannyh.htm" target="_blank" rel="noopener noreferrer">политике конфиденциальности</a></span></label><p class="quiz-field-error" id="quiz-consent-error" hidden>Подтвердите согласие на обработку персональных данных.</p><button class="btn" type="submit">${state.method === 0 ? 'Жду звонка' : `Свяжитесь со мной в ${method}`} ${icon('arrow')}</button><p class="quiz-submit-status" role="status" hidden></p><div class="quiz-submit-fallback" hidden><a class="text-link" href="tel:+78123444444">Позвонить +7 (812) 344-44-44</a><button class="text-link" type="button" data-prepare>Отправить ответы в мессенджере ↗</button></div></form><div data-lead-success hidden role="status"><span class="result-label">ЗАЯВКА ПОЛУЧЕНА</span><h3>Спасибо! Будем на связи</h3><p>Вы выбрали: ${method}. Специалист получит ваши ответы вместе с заявкой.</p></div><div class="quiz-foot"><button class="text-link" type="button" data-back>Изменить ответы</button><button class="text-link" type="button" data-reset>Начать заново</button></div>`;
    }
    app.hidden = false;
    app.innerHTML = `<div class="quiz-head"><span aria-live="polite">${count}</span><span class="progress" aria-hidden="true">${[0, 1, 2, 3].map(i => `<i class="${i <= state.step ? 'active' : ''}"></i>`).join('')}</span></div><div class="enter">${body}</div>`;
    app.querySelectorAll('[data-choice]').forEach(b => b.addEventListener('click', () => {
        if (state.step === 0) {
            if (state.intent !== b.dataset.choice)
                state.detail = null;
            state.intent = b.dataset.choice;
            state.step = 1;
            render();
        }
        else if (state.step === 1) {
            state.detail = Number(b.dataset.choice);
            state.step = 2;
            render();
        }
        else if (state.step === 2) {
            state.vehicle = Number(b.dataset.choice);
            state.step = 3;
            render();
        }
        else if (state.step === 3) {
            state.method = Number(b.dataset.choice);
            startAnalysis();
        }
    }));
    app.querySelector('[data-back]')?.addEventListener('click', () => { clearAnalysis(); state.step = state.step >= 4 ? 3 : state.step - 1; render(); });
    app.querySelector('[data-reset]')?.addEventListener('click', () => { clearAnalysis(); Object.assign(state, initialState); render(); });
    app.querySelector('[data-prepare]')?.addEventListener('click', openContact);
    setupLeadForm();
    if (focus) {
        document.getElementById('question-title').focus({ preventScroll: true });
        document.getElementById('quiz').scrollIntoView({ block: 'start', behavior: 'instant' });
    }
}
function clearAnalysis() {
    analysisTimers.forEach(window.clearTimeout);
    analysisTimers = [];
}
function startAnalysis() {
    clearAnalysis();
    state.step = 4;
    render();
    app.querySelector('[data-analysis-item]').classList.add('is-current');
    [600, 1200].forEach((delay, index) => {
        analysisTimers.push(window.setTimeout(() => {
            const items = app.querySelectorAll('[data-analysis-item]');
            items[index]?.classList.replace('is-current', 'is-complete');
            items[index + 1]?.classList.add('is-current');
        }, delay));
    });
    analysisTimers.push(window.setTimeout(() => {
        clearAnalysis();
        state.step = 5;
        render();
    }, 1800));
}
function normalizePhone(value) {
    if (!/^[+\d\s()-]+$/.test(value)) return null;
    const digits = value.replace(/\D/g, '');
    if (digits.length === 10) return '+7' + digits;
    if (digits.length === 11 && /^[78]/.test(digits)) return '+7' + digits.slice(1);
    return null;
}
function leadPayload() {
    return {
        service_name: 'Перетяжка сиденья мототехники',
        cta_source: 'hero_quiz',
        vehicle_type: vehicles[state.vehicle],
        task_type: branches[state.intent].label,
        task_detail: branches[state.intent].options[state.detail].label,
        contact_method: contactMethods[state.method],
        contact_profile: state.profile.trim(),
        phone: normalizePhone(state.phone),
        privacy_consent: state.consent,
    };
}
function setupLeadForm() {
    const form = app.querySelector('.quiz-lead-form');
    if (!form) return;
    const phone = form.elements.namedItem('phone');
    const profile = form.elements.namedItem('contact_profile');
    const consent = form.elements.namedItem('privacy_consent');
    const phoneError = form.querySelector('#quiz-phone-error');
    const consentError = form.querySelector('#quiz-consent-error');
    phone.value = state.phone;
    consent.checked = state.consent;
    if (profile) {
        profile.value = state.profile;
        profile.addEventListener('input', () => { state.profile = profile.value; });
    }
    phone.addEventListener('input', () => {
        state.phone = phone.value;
        phone.removeAttribute('aria-invalid');
        phoneError.hidden = true;
    });
    phone.addEventListener('blur', () => {
        const normalized = normalizePhone(phone.value);
        if (normalized) {
            const digits = normalized.slice(2);
            phone.value = `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`;
            state.phone = phone.value;
        }
    });
    consent.addEventListener('change', () => {
        state.consent = consent.checked;
        consent.removeAttribute('aria-invalid');
        consentError.hidden = true;
    });
    for (const [name, value] of Object.entries(leadPayload())) {
        if (form.elements.namedItem(name)) continue;
        const hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = name;
        hidden.value = String(value ?? '');
        form.append(hidden);
    }
    form.addEventListener('submit', event => {
        state.phone = phone.value;
        state.consent = consent.checked;
        if (profile) state.profile = profile.value;
        const validPhone = Boolean(normalizePhone(state.phone));
        phoneError.textContent = 'Введите номер полностью: +7 (___) ___-__-__.';
        phoneError.hidden = validPhone;
        phone.setAttribute('aria-invalid', String(!validPhone));
        consentError.hidden = state.consent;
        consent.setAttribute('aria-invalid', String(!state.consent));
        if (!validPhone || !state.consent) {
            event.preventDefault();
            event.stopImmediatePropagation();
            (validPhone ? consent : phone).focus();
            return;
        }
        // Let HTML On Page Lead Capture receive the original submit event.
        // Keep the controls enabled so its FormData includes every answer.
        phone.value = normalizePhone(state.phone);
        state.phone = phone.value;
    });
}
// Prevent native navigation only when no delegated handler claimed the submission.
window.addEventListener('submit', event => {
    const form = event.target;
    if (!form.matches?.('#quiz-app [data-hop-lead-form]') || event.defaultPrevented) return;
    event.preventDefault();
    const status = form.querySelector('.quiz-submit-status');
    status.hidden = false;
    status.textContent = 'Отправка заявки сейчас недоступна. Свяжитесь с нами по телефону или в мессенджере.';
    form.querySelector('.quiz-submit-fallback').hidden = false;
});

function messageText() {
    const b = branches[state.intent];
    if (!b)
        return 'Здравствуйте! Хочу обсудить перетяжку сиденья.\nМодель техники: \nЧто хочу изменить: \nПодскажите, что нужно для предварительной оценки. Фотографии приложу в сообщении.';
    return `Здравствуйте! Хочу обсудить перетяжку сиденья.\nТехника: ${state.vehicle === null ? 'уточню в сообщении' : vehicles[state.vehicle]}.\nЗадача: ${b.label}.${state.detail === null ? '' : '\nПодробности: ' + b.options[state.detail].label + '.'}${state.method === null ? '' : '\nСпособ связи: ' + contactMethods[state.method] + '.'}${normalizePhone(state.phone) ? '\nТелефон: ' + normalizePhone(state.phone) : ''}${state.profile.trim() ? '\nПрофиль: ' + state.profile.trim() : ''}\nПодскажите, какой вариант возможен и что нужно для предварительной оценки. Фотографии приложу в сообщении.`;
}
let contactTrigger = null;
let previousOverflow = '';
function openContact(event) { event?.preventDefault(); contactTrigger = document.activeElement; document.getElementById('message').value = messageText(); document.getElementById('copy-status').textContent = ''; previousOverflow = document.body.style.overflow; dialog.showModal(); document.body.style.overflow = 'hidden'; dialog.querySelector('.close').focus(); }
dialog.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { document.body.style.overflow = previousOverflow; contactTrigger?.focus({ preventScroll: true }); });
dialog.addEventListener('click', event => { if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)
        dialog.close();
} });
document.querySelectorAll('[data-contact]').forEach(a => a.addEventListener('click', openContact));
document.querySelectorAll('[data-intent]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); clearAnalysis(); if (state.intent !== a.dataset.intent)
    state.detail = null; state.intent = a.dataset.intent; state.step = 1; render(); }));
document.querySelectorAll('a[href="#quiz"], a[href="#estimate"]').forEach(link => link.addEventListener('click', event => {
    if (link.hasAttribute('data-intent'))
        return;
    event.preventDefault();
    document.getElementById('quiz').scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    document.getElementById('question-title').focus({ preventScroll: true });
}));
document.getElementById('copy-message').addEventListener('click', async () => { const msg = document.getElementById('message'); try {
    await navigator.clipboard.writeText(msg.value);
    document.getElementById('copy-status').textContent = 'Текст скопирован. Откройте мессенджер и добавьте фотографии.';
}
catch (e) {
    msg.focus();
    msg.select();
    document.getElementById('copy-status').textContent = 'Не удалось скопировать. Выделите текст и скопируйте вручную.';
} });
render(false);
