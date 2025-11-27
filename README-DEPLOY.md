# Stellar PTW - Permit to Work Management System

Система управления нарядами-допусками для строительных работ.

## Деплой на Netlify

1. Форкните этот репозиторий
2. Подключите к Netlify
3. Добавьте переменные окружения:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Netlify автоматически соберет и задеплоит проект

## Локальная разработка

```bash
npm install
npm run dev
```

Создайте `.env` файл:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key
```
