# Design QA — Hero split

- Source visual truth: `C:\Users\User\AppData\Local\Temp\codex-clipboard-02509e73-c1ae-468c-9c2d-adb9801bbf97.png`
- Implementation capture: `D:\works\projects\lr-motorcycle-chair-fix\hero-split-qa.png`
- Combined comparison: `D:\works\projects\lr-motorcycle-chair-fix\hero-comparison-qa.png`
- Source pixels: `504 × 336`; implementation capture: `1280 × 720`; both normalized to a shared 420 px height in the comparison image. The implementation capture includes the browser viewport below the Hero; the inspected region is the 680 px Hero.
- State: initial desktop Hero; no hover, scroll, or form interaction.

## Comparison history

### Pass 1 — before the requested correction

- [P1] Technical drawing was positioned inside the photo layer instead of at the lower-left of the Hero.
- [P1] Photo transition began before the centre split, which weakened the two-part composition.

### Pass 2 — after the correction

- Fixed: drawing moved into its own lower-left layer; content and CTA remain in the upper-left layer.
- Fixed: photo layer begins at 50% of viewport width and uses a broad dark-to-transparent gradient to dissolve into the background.
- Evidence: `hero-comparison-qa.png`.

## Fidelity surfaces

- **Fonts and typography:** local Oswald display face keeps the title condensed, high-contrast and on three lines; body text is smaller and calmer than the display type.
- **Spacing and layout rhythm:** left half is split vertically into upper conversion content and lower drawing; CTA clears the drawing; right half is image-led.
- **Colors and tokens:** graphite field, white copy, restrained orange technical markings, blue primary action and a low-contrast photo fade match the source palette.
- **Image quality and asset fidelity:** the supplied technical-atelier staging image is cropped to hold the machine, seam and hands on the right; it fades at the center rather than competing with the copy.
- **Copy and content:** content remains the project’s approved Russian service copy; the source’s global navigation is intentionally absent because the project brief excludes a header.

## Findings

No actionable P0, P1 or P2 differences remain for the requested Hero composition.

## Follow-up polish

- [P3] Replace the clearly labelled staging photo with an approved workshop photograph before production.

final result: passed

---

# Design QA — блок соцсетей

- Visual reference: supplied `lr-polishing` screenshots and sibling component sources.
- Assets: QR-коды Telegram, ВКонтакте и MAX перенесены из `D:\works\projects\lr-polishing\src\assets\` в `public/assets/social/`.
- Layout: тёмная двухколоночная секция с последовательностью из трёх шагов, тремя цветными мессенджер-кнопками и QR-кодами, затем запасным телефонным каналом.
- DOM verification: все три ссылки, QR-изображения и телефон имеют корректные доступные имена и URL.
- Console verification: ошибок и предупреждений нет.

final result: passed

---

# Design QA — кейсы / карусель

- Source interaction reference: `https://lyubeciya.ru/#stories`
- Source capture: desktop reference — тёмная секция, крупная карточка с закруглением, сравнение двух изображений по вертикальной границе и видимый край следующего кейса.
- Implementation capture: локальный `#portfolio` в том же desktop viewport.

## Fidelity and function check

- Лента показывает широкую карточку и начало следующей: это сохраняет приглашение к горизонтальному жесту из референса.
- Карточка сочетает тёмную нижнюю часть с фото-сравнением, тёплые акцентные подписи, округлую геометрию и линейную пагинацию.
- `Swiper` поддерживает drag/swipe, кликабельную пагинацию и кнопки «Назад» / «Далее».
- Внутренний range-control меняет позицию сравнения; тестовое значение изменилось с `50` до `60`, соответствующая CSS-переменная обновилась.
- После перехода к следующему слайду кнопка «Назад» становится доступной; в консоли preview ошибок нет.
- Все карточки помечены «ВИЗУАЛ КОНЦЕПЦИИ»: текущие изображения не выдаются за подтверждённые реальные работы.

final result: passed

---

# Design QA — поэтапный квиз

- Source interaction reference: `https://lr-fix-roof.vercel.app/#calculator`
- Inspected source state: desktop, шаг 3 из 9 — карточки выбора, индикатор прогресса, кнопки «Назад» и «Далее».
- Implementation state: local preview `http://127.0.0.1:4321/#estimate`, шаги 1–4.

## Implemented interaction model

- Прогресс обозначает текущий шаг и заполняется синей шкалой.
- Варианты выбираются доступными radio-карточками; без обязательного ответа нельзя перейти дальше.
- Кнопки «Назад» и «Далее» меняют доступные состояния на каждом шаге.
- Фото проверяются отдельно: нужно выбрать от 2 до 4 файлов.
- Финальный шаг запрашивает телефон, удобный способ ответа и согласие на обработку данных.

## Verification

- Первый выбор «Мотоцикл или скутер» переводит квиз со шага 1 на шаг 2; счётчик меняется на «ВЫ ПРОШЛИ 2 ИЗ 4 ШАГОВ».
- На шаге 2 одновременно видны только «Назад» и «Далее»; кнопка отправки скрыта.
- После исправления правила `[hidden]` неактивные шаги и кнопки не занимают место в макете.
- В консоли локального preview ошибок нет; `npm run build` завершился успешно.

final result: passed
