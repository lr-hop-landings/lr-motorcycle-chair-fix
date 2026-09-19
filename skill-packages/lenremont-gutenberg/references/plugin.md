# Поддержка плагина

## Карта исходников

Все пути — от `wordpress-plugin/lenremont-page-importer` в рабочей копии.

- `lenremont-page-importer.php`: bootstrap, имя/автор/версия. Сохранить `Lenremont - Gutenberg Page Importer`, Author `Goraie`.
- `includes/class-plugin.php`: hooks, регистрация блоков/паттернов/шаблонов, условная загрузка assets, compatibility classic themes. Версия cache-busting здесь должна совпадать с заголовком.
- `assets/converter.js`, `editor.js`: конвертация и панель импорта; `seo-import.js`: DOM-адаптер SEO.
- `assets/reference-blocks.js`, `blocks/art`, `blocks/reference-widget`: примитивы точного профиля и доверенные динамические ресурсы. Изменение `save()` может инвалидировать старый контент; нужен compatible save/deprecated/migration и тест реального сохранения.
- `assets/neutral-library.js`: обезличивание только копии манифеста; сохранение структуры/CSS, замена картинок/контактов, демоквиз.
- `assets/reference-library.js`: коллекция, общий корень, проверка конфликтов, вставка; `assets/section-blocks.js`: 17 контейнерных блоков, InnerBlocks и preview; `patterns/source-sections.php`: стандартные паттерны-seeds; `assets/library.js`: отдельная панель библиотеки.
- `assets/reference-library-runtime.js`: библиотечный runtime, демоквиз, совместимость старых библиотечных страниц. Новые нейтральные страницы без оригинального reference-quiz не должны запускать исходный сценарий мотосидений.
- `assets/reference/original.css`, `interaction-0/1/2.js`: экспортированный точный профиль, локальный Swiper, квиз/контакты, callback. Бандлы не универсальный API.
- `assets/reference-adapter.css`, `frontend.css`, `canvas.css`, `editor-content.css`: локальные resets, типовой JSON, собственный шаблон, редактор.
- `assets/design-system.css`, `patterns/design-system.php`, `blocks/service-quiz`: ранняя универсальная коллекция. Не смешивать её токены с точным профилем.

## CSS и редактор

Frontend-селекторы точного профиля ограничены `#hop-gutenberg.lr-reference`; типового импорта — `#hop-gutenberg`; универсальной коллекции — своим `lr-ai-page`. Базовые сбросы должны оставаться локальными. Индивидуальные цвета Gutenberg `.has-text-color` сохраняются. Не удалять `cs-inline-css`; конфликты `!important` исправлять точечно по реальному computed style.

Gutenberg использует другие DOM ID, iframe и дополнительные контейнеры. Загруженного CSS недостаточно: проверять selector matching, ширину layout и фактические стили. `editor-content.css` производный; переносимый builder добавляет `wordpress-plugin/editor-overrides.css`, поэтому локальные поправки не теряются. После изменения CSS запускайте `build-editor` в **рабочей копии**, затем полный тест и визуальную проверку. Не редактируйте только generated-файл.

Классические обёртки групп удаляются только для помеченного поддерева. Нельзя фильтровать HTML/CSS всего сайта или массово переписывать post_content ради совместимости темы.

## Скрипты, формы и безопасность

Обработчики ограничивать своим корнем, инициализация повторобезопасна. Проверять несколько вставок, reload и страницы без соответствующего блока. Swiper уже локален; не подключать вторую CDN-копию. Новые интерактивы загружать условно. Поддерживать клавиатуру, фокус, блокировку повторных нажатий и reduced motion.

Не принимать произвольный JS/PHP/CSS из JSON. Сохранять allowlist атрибутов, проверку URL, escape/sanitize и ограничения структуры. Новая серверная запись требует capabilities и nonce/аутентификации; nonce не заменяет проверку прав. Не добавлять собственный обработчик заявок поверх существующего без явной задачи.

Менять шаблоны новых вставок, а не все старые экземпляры. Проверять отсутствие автоматической dirty-state после открытия сохранённой страницы. При релизе повышать обе версии; сам снимок 0.13.0 в скилле не является доказательством совместимости с произвольным production.
