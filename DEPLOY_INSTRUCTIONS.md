# Инструкция по деплою на Netlify

## Вариант 1: Через GitHub (рекомендуется)

### Шаг 1: Создайте GitHub репозиторий
1. Перейдите на https://github.com/new
2. Назовите репозиторий (например, `spark-ptw`)
3. Нажмите "Create repository"

### Шаг 2: Привяжите репозиторий
Выполните в терминале:
```bash
cd /workspaces/spark-template
git remote add origin https://github.com/ВАШ_USERNAME/spark-ptw.git
git push -u origin main
```

### Шаг 3: Подключите к Netlify
1. Перейдите на https://app.netlify.com/sites/stellar-construction-ptw/settings
2. В разделе "Build & deploy" → "Continuous deployment"
3. Нажмите "Link repository"
4. Выберите ваш GitHub репозиторий
5. Netlify автоматически задеплоит изменения

## Вариант 2: Ручной деплой (быстрый, но временный)

1. Перейдите на https://app.netlify.com/drop
2. Перетащите папку `dist` из вашего проекта
3. Сайт обновится, но без автоматических деплоев

## Вариант 3: Через Netlify CLI

```bash
# Авторизуйтесь
npx netlify-cli login

# Задеплойте
npx netlify-cli deploy --prod --dir=dist
```

---

**Текущий статус:**
- ✅ Локальная версия работает на http://localhost:5001/
- ✅ Production сборка готова в папке `dist/`
- ⏳ Нужно загрузить на https://stellar-construction-ptw.netlify.app/
