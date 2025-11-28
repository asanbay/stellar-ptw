# 🚀 Деплой Stellar PTW на Netlify

## Быстрый старт (5 минут)

### 1️⃣ Подготовка Supabase

Перед деплоем убедитесь, что:
- ✅ Создан проект в Supabase
- ✅ Выполнена SQL миграция (`supabase/migrations/001_initial_schema.sql`)
- ✅ Создан админ пользователь
- ✅ У вас есть `SUPABASE_URL` и `SUPABASE_ANON_KEY`

Если нет - следуйте инструкции в [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

### 2️⃣ Деплой на Netlify

#### Вариант A: Через GitHub (рекомендуется)

1. **Push кода в GitHub:**
   \`\`\`bash
   git add .
   git commit -m "Production ready"
   git push origin main
   \`\`\`

2. **Подключите к Netlify:**
   - Зайдите на [netlify.com](https://netlify.com)
   - Нажмите **"Add new site"** → **"Import an existing project"**
   - Выберите **GitHub** и найдите ваш репозиторий
   - Выберите ветку: `main`

3. **Настройте Build Settings:**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - Нажмите **"Show advanced"** → **"New variable"**

4. **Добавьте Environment Variables:**
   
   | Key | Value |
   |-----|-------|
   | `VITE_SUPABASE_URL` | `https://ваш-проект.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `ваш-anon-ключ` |
   | `VITE_APP_NAME` | `Stellar PTW` |
   | `VITE_APP_VERSION` | `1.0.0` |

5. **Deploy:**
   - Нажмите **"Deploy site"**
   - Дождитесь завершения (2-3 минуты)

#### Вариант B: Через Netlify CLI

\`\`\`bash
# Установить Netlify CLI
npm install -g netlify-cli

# Логин
netlify login

# Инициализация
netlify init

# Деплой
netlify deploy --prod
\`\`\`

### 3️⃣ Настройка Custom Domain (опционально)

1. В Netlify перейдите в **Domain settings**
2. Нажмите **"Add custom domain"**
3. Введите ваш домен (например: `ptw.stellar.com`)
4. Следуйте инструкциям для настройки DNS

   **Namecheap / ручная настройка:**
   - `www` → CNAME на `your-site-id.netlify.app`
   - `@` (корень) → A-записи `75.2.60.5` и `99.83.229.126`
   - После сохранения вернитесь в Netlify и нажмите **Verify**

### 4️⃣ Настройка HTTPS

Netlify автоматически выдаст SSL сертификат от Let's Encrypt.
Проверьте: **Settings** → **Domain management** → **HTTPS**

---

## 🔧 Настройка для Production

### Оптимизация производительности

Добавьте в `netlify.toml`:

\`\`\`toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
\`\`\`

### Безопасность

1. **Включите Branch deploys protection:**
   - Settings → Build & deploy → Deploy contexts
   - Deploy only production branch

2. **Добавьте Password protection** (для staging):
   - Settings → Visitor access → Password protection

3. **Настройте Form detection:**
   - Settings → Forms → Disable (если не используете)

---

## 📊 Мониторинг

### Netlify Analytics

Включите в: **Settings** → **Analytics** (платная функция)

### Логи деплоя

Проверить: **Deploys** → выберите деплой → **Deploy log**

### Function logs

Если используете Netlify Functions: **Functions** → выбрать функцию

---

## 🔄 Обновление приложения

### Автоматический деплой

После настройки GitHub integration:

\`\`\`bash
# Внесите изменения
git add .
git commit -m "Update feature"
git push origin main

# Netlify автоматически задеплоит!
\`\`\`

### Ручной деплой

\`\`\`bash
# Собрать локально
npm run build

# Деплоить
netlify deploy --prod --dir=dist
\`\`\`

---

## 🐛 Troubleshooting

### Build fails

Проверьте:
- ✅ Все зависимости в `package.json`
- ✅ Node version совместима (указать в `package.json`)
- ✅ Environment variables правильно настроены

\`\`\`json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
\`\`\`

### "Failed to fetch" на production

- Проверьте CORS в Supabase
- Убедитесь, что домен добавлен в Supabase **Allowed URLs**

Supabase → Settings → API → Site URL добавьте:
\`\`\`
https://ваш-сайт.netlify.app
https://ваш-домен.com
\`\`\`

### Blank page после деплоя

- Проверьте Console в браузере (F12)
- Убедитесь, что base path правильный в `vite.config.ts`
- Проверьте redirects в `netlify.toml`

---

## 💰 Стоимость

### Netlify Free tier:
- ✅ 100 GB bandwidth/месяц
- ✅ 300 build minutes/месяц
- ✅ Автоматический SSL
- ✅ Continuous deployment
- ✅ Хватит для небольшой компании

### Supabase Free tier:
- ✅ 500 MB database
- ✅ 1 GB file storage
- ✅ 50,000 monthly active users
- ✅ 500 MB egress
- ✅ Хватит для старта

### Когда нужен Upgrade:

**Netlify Pro** ($19/месяц):
- 1TB bandwidth
- Analytics
- Password protection
- Priority support

**Supabase Pro** ($25/месяц):
- 8 GB database
- 100 GB bandwidth
- Daily backups
- Email support

---

## 🎯 Чек-лист перед production

- [ ] SQL миграция выполнена в Supabase
- [ ] Создан админ пользователь
- [ ] Environment variables настроены в Netlify
- [ ] Домен добавлен в Supabase Allowed URLs
- [ ] HTTPS включен
- [ ] Протестирована регистрация
- [ ] Протестирован вход админа
- [ ] Протестирован вход пользователя
- [ ] Проверена работа RLS (пользователи не могут редактировать)
- [ ] Настроены бэкапы в Supabase
- [ ] Добавлен custom domain (опционально)

---

## 📱 После деплоя

1. **Протестируйте с разных устройств:**
   - Desktop (Chrome, Firefox, Safari)
   - Mobile (Android, iOS)
   - Tablet

2. **Создайте тестовых пользователей:**
   - Админ
   - Обычный пользователь

3. **Заполните начальные данные:**
   - Отделы
   - Сотрудники
   - FAQ

4. **Настройте резервное копирование:**
   - Supabase → Settings → Database → Point in time recovery (Pro plan)

---

## 🚀 Готово!

Ваше приложение доступно по адресу: `https://ваш-сайт.netlify.app`

**Credentials для входа:**
- Admin: `123`
- Super Admin: `admin123`

*(Пароли настраиваются в `src/components/LoginDialog.tsx`, Supabase сейчас используется как хранилище данных.)*

---

## 📞 Support

Если возникли проблемы:
1. Проверьте логи в Netlify
2. Проверьте консоль браузера (F12)
3. Проверьте Supabase logs (Logs Explorer)
4. Откройте issue в GitHub repo
