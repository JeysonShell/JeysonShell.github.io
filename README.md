# Ivan Ignatiev — portfolio

Статический сайт-портфолио на чистых HTML, CSS и JavaScript, без сборки и зависимостей.
Публикуется через GitHub Pages: https://jeysonshell.github.io

## Структура

- `index.html` — разметка и тексты
- `styles.css` — оформление, адаптив, режим `prefers-reduced-motion`
- `script.js` — скролл-анимации, закреплённые сцены, горизонтальная лента проектов, фон-сеть, лайтбокс
- `images/` — фото, скриншоты проектов (WebP), иконки навыков

## Локальный просмотр

```bash
python3 -m http.server 8080
```

Затем открыть http://localhost:8080.

## Как править

- Тексты и ссылки — `index.html`.
- Скриншоты проектов лежат в `images/<проект>/`; каждый снимок — ссылка с `data-gallery` и `data-index`, лайтбокс подхватывает их сам.
- Шаги сцены «Шоу Столицы» — блоки `.step` в секции `#experience`; их число задаёт `data-steps`.
