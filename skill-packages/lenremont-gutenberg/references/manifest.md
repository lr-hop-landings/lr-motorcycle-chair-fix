# Форматы данных

## Типовой JSON v1

Создать безопасный стартовый файл (без формы и отправки):

```text
node "<skill>/scripts/lr-wp.mjs" create-json --out "<project>/page.json" --title "Название услуги" --slug "service-example"
node "<skill>/scripts/lr-wp.mjs" validate --manifest "<project>/page.json"
```

`version: 1`, `title`, `theme`, `sections`. `slug` можно хранить как намерение, но назначать в WP отдельно. Типы секций: `hero`, `proof`, `links`, `cards`, `services`, `materials`, `pricing`, `process`, `portfolio`, `faq`, `contact`, `content`. Anchor секции — **`anchor`**, не `id`. Для `contact` укажите `form:false`, если реальная интеграция ещё не определена.

Секция `content.blocks`: `heading` (text, level), `paragraph` (text), `image` (src/url, alt), `buttons` (items с label/url), `list`, `separator`, `spacer`, `quote`, `details`, `cards`, `columns`, `quiz`, `beforeAfter`, `leadForm`. Точные поля проверяйте в `assets/converter.js` выбранной версии: `convertContentBlock`, `convertSection`, `wrapSection`. Не придумывайте новые типы без поддержки конвертера.

## Точный профиль v2

`version:2`, `profile:"astro-main-v1"`, `rootId:"hop-gutenberg"`, `before`, `sections:[{type:"reference",tree:…}]`, `after`. Узлы дерева: `element`, `text`, `image`, `art`, `widget`, `quiz`. HTML-атрибуты проходят allowlist `cleanAttributes` в `assets/reference-blocks.js`.

Пять полных примеров и `catalog.json` находятся в `assets/toolkit/wordpress-plugin/lenremont-page-importer/examples/`. Они сохраняют мототематику. `{{pluginUrl}}` заменяется адресом установленного плагина. Это не глобальная переменная и не абсолютный путь диска.

SVG (`art`) и виджеты выбираются из доверенных ресурсов плагина, не из произвольного HTML манифеста. Скрипты страницы в JSON не передавать. Конвертер ограничивает глубину/число узлов. Профиль основан на определённом макете; новый исходник может требовать отдельного экспортёра/профиля.

Нейтральная библиотека строится через `neutral-library.js` → `reference-library.js` → `section-blocks.js`, без изменения оригинальных JSON. Не экспортируйте результат одного `neutral-library.manifest()` как готовую независимую страницу: библиотечная обёртка и подключение демонстрационного runtime тоже необходимы.

## SEO

| JSON | Поле текущей интеграции |
|---|---|
| `title` | `on_yoast_wpseo_title` |
| `description` | `on_yoast_wpseo_metadesc` |
| `breadcrumbsTitle` | `on_yoast_wpseo_bctitle` |
| `breadcrumbsUrl` | `on_yoast_wpseo_bctitle_url` |
| `canonical` | `on_yoast_wpseo_canonical` |
| `ogTitle` | `on_yoast_wpseo_opengraph-title` |
| `ogDescription` | `on_yoast_wpseo_opengraph-description` |
| `ogImageId` | `on_yoast_wpseo_opengraph-image-id` |

Поля находятся внутри объекта `seo`. По умолчанию существующие непустые значения сохраняются. Overwrite должен быть явным. Пустые/отсутствующие значения ничего не удаляют; undo не должно затирать более позднюю ручную правку. Для SEO-only используйте соответствующую кнопку без замены содержимого.

Canonical/URL крошек — http(s) либо абсолютный путь от корня сайта. OG image ID принадлежит медиатеке **целевого** сайта. Не переносите ID между сайтами. Если метабокс отсутствует, сообщите о неподдерживаемой интеграции, не пишите наугад `_yoast_wpseo_*` в БД.

`validate` — структурная проверка и часть ссылок; она не запускает DOMParser браузера, не проверяет доступность медиа, SEO-поля или сериализацию Gutenberg. Отсутствующий якорь у динамического виджета надо проверить в его реальном HTML, а не автоматически удалять ссылку.
