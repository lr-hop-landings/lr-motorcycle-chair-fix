(function (root, factory) {
	var api = factory();
	if (typeof module === 'object' && module.exports) module.exports = api;
	else root.LenremontSeoImport = api;
})(typeof window !== 'undefined' ? window : this, function () {
	'use strict';
	// Actual legacy metabox fields on lenremont.ru. The site's existing handler
	// owns persistence, capabilities, nonces and integration with Yoast.
	var fields = {
		title: 'on_yoast_wpseo_title', description: 'on_yoast_wpseo_metadesc',
		breadcrumbsTitle: 'on_yoast_wpseo_bctitle', breadcrumbsUrl: 'on_yoast_wpseo_bctitle_url',
		canonical: 'on_yoast_wpseo_canonical', ogTitle: 'on_yoast_wpseo_opengraph-title',
		ogDescription: 'on_yoast_wpseo_opengraph-description', ogImageId: 'on_yoast_wpseo_opengraph-image-id'
	};
	function normalize(seo, baseUrl) {
		if (seo === undefined || seo === null) return {};
		if (typeof seo !== 'object' || Array.isArray(seo)) throw new Error('seo должен быть объектом.');
		var values = {};
		Object.keys(fields).forEach(function (key) {
			if (!Object.prototype.hasOwnProperty.call(seo, key)) return;
			var value = seo[key];
			if (key === 'ogImageId' && typeof value === 'number') value = String(value);
			if (typeof value !== 'string') throw new Error('seo.' + key + ': требуется строка.');
			value = value.trim();
			if (!value) return; // Never erase existing values, even in overwrite mode.
			if (value.length > 5000) throw new Error('seo.' + key + ': слишком длинное значение.');
			if (key === 'canonical' || key === 'breadcrumbsUrl') {
				if (!/^https?:\/\//i.test(value) && !/^\/(?!\/)/.test(value)) throw new Error('seo.' + key + ': нужен http(s) URL или путь от корня сайта.');
				var url = new URL(value, baseUrl);
				if (!/^https?:$/.test(url.protocol) || url.username || url.password) throw new Error('Недопустимый SEO URL.');
				value = url.href;
			} else if (key === 'ogImageId') {
				if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) throw new Error('seo.ogImageId: нужен ID изображения из медиатеки этого сайта.');
			} else value = value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
			if (value) values[key] = value;
		});
		return values;
	}
	function plan(seo, doc, overwrite) {
		var values = normalize(seo, doc.location.href);
		var result = { changes: [], preserved: [], missing: [], total: Object.keys(values).length };
		Object.keys(values).forEach(function (key) {
			var input = doc.getElementById(fields[key]);
			if (!input || input.disabled || input.readOnly || !input.closest('form')) { result.missing.push(key); return; }
			if (input.value === values[key] || (!overwrite && input.value.trim())) { result.preserved.push(key); return; }
			result.changes.push({ key: key, input: input, previous: input.value, value: values[key] });
		});
		return result;
	}
	function setValue(input, value) {
		input.value = value;
		var EventClass = input.ownerDocument.defaultView.Event;
		input.dispatchEvent(new EventClass('input', { bubbles: true }));
		input.dispatchEvent(new EventClass('change', { bubbles: true }));
	}
	function apply(result) {
		result.changes.forEach(function (change) {
			if (!change.input.isConnected || change.input.value !== change.previous) throw new Error('SEO-поля изменились. Повторите применение.');
		});
		result.changes.forEach(function (change) { setValue(change.input, change.value); });
		return result.changes;
	}
	function undo(changes) {
		var restored = 0;
		changes.forEach(function (change) {
			if (change.input.isConnected && change.input.value === change.value) { setValue(change.input, change.previous); restored++; }
		});
		return restored;
	}
	return { normalize: normalize, plan: plan, apply: apply, undo: undo, fields: fields };
});
