# 🚀 Быстрый старт с новыми функциями

## Генерация PWA иконок

1. Откройте `generate-icons.html` в браузере
2. Сохраните скачанные `icon-192.png` и `icon-512.png` в папку `/public/`
3. Готово! PWA будет работать с вашими иконками

## Использование улучшений

### 1. QR-коды в PTW

Добавьте кнопку в компонент PTW:

```tsx
import { QRCodeGenerator } from '@/components/QRCodeGenerator'

const [qrOpen, setQrOpen] = useState(false)

<Button onClick={() => setQrOpen(true)}>
  <QrCode size={16} /> Показать QR
</Button>

<QRCodeGenerator
  data={`${window.location.origin}/ptw/${ptw.id}`}
  title={`PTW ${ptw.ptwNumber}`}
  open={qrOpen}
  onOpenChange={setQrOpen}
  language={language}
/>
```

### 2. Audit Log в Super Admin

Добавьте вкладку в SuperAdminDashboard:

```tsx
import { AuditLogViewer } from '@/components/AuditLogViewer'

<TabsContent value="audit-log">
  <AuditLogViewer language={language} />
</TabsContent>
```

И логируйте все действия:

```tsx
import { auditLogger } from '@/lib/audit-log'

// При создании PTW
await auditLogger.log('create', 'ptw', newPTW.id, {
  userName: currentUserName,
  entityName: `PTW ${newPTW.ptwNumber}`,
})

// При изменении
await auditLogger.log('update', 'ptw', ptw.id, {
  userName: currentUserName,
  entityName: `PTW ${ptw.ptwNumber}`,
  changes: {
    status: { old: 'draft', new: 'issued' }
  }
})
```

### 3. Уведомления об истечении

Добавьте в основной App компонент:

```tsx
import { useExpirationNotifications } from '@/hooks/use-expiration'

// В App.tsx или PTWTab
const { notifications, hasExpiringPTWs } = useExpirationNotifications(
  ptws,
  language,
  2 // уведомлять за 2 дня
)

// Показать бейдж с количеством
{hasExpiringPTWs && (
  <Badge variant="destructive">{notifications.length}</Badge>
)}
```

### 4. PDF Экспорт

Добавьте кнопки в PTW детали:

```tsx
import { downloadPTWPDF, printPTWPDF } from '@/lib/pdf-generator'

<Button onClick={() => downloadPTWPDF(ptwData, language)}>
  <Download size={16} /> Скачать PDF
</Button>

<Button onClick={() => printPTWPDF(ptwData, language)}>
  <Printer size={16} /> Печать
</Button>
```

### 5. Keyboard Shortcuts

Добавьте в App.tsx:

```tsx
import { useKeyboardShortcuts } from '@/hooks/use-keyboard'

useKeyboardShortcuts({
  onNewPTW: () => setPTWDialogOpen(true),
  onNewPerson: () => setPersonDialogOpen(true),
  onSearch: () => searchInputRef.current?.focus(),
  onSave: handleSave,
  onClose: () => closeAllDialogs(),
  enabled: userMode === 'admin' // только для админов
})
```

### 6. Шаблоны PTW

```tsx
import { usePTWTemplates } from '@/hooks/use-templates'

const { templates, createTemplate, useTemplate } = usePTWTemplates()

// Создать шаблон из текущего PTW
<Button onClick={() => createTemplate({
  name: 'Работы на высоте - стандарт',
  workType: currentPTW.workType,
  description: currentPTW.description,
  hazards: currentPTW.hazards,
  safetyMeasures: currentPTW.safetyMeasures,
  equipmentRequired: currentPTW.equipment,
  estimatedDuration: 8,
  createdBy: userName
})}>
  Сохранить как шаблон
</Button>

// Использовать шаблон
<Select onValueChange={(id) => {
  const template = useTemplate(id)
  fillFormWithTemplate(template)
}}>
  {templates.map(t => (
    <SelectItem value={t.id}>{t.name}</SelectItem>
  ))}
</Select>
```

### 7. Enhanced Dashboard

Замените обычный dashboard:

```tsx
import { EnhancedDashboard } from '@/components/EnhancedDashboard'

<EnhancedDashboard
  data={{
    ptws: allPTWs,
    personnel: allPersonnel,
    departments: allDepartments
  }}
  language={language}
/>
```

### 8. Bulk Operations

```tsx
import { useBulkSelection } from '@/hooks/use-bulk-selection'

const selection = useBulkSelection(personnel)

// Checkbox в таблице
<Checkbox
  checked={selection.isSelected(person.id)}
  onCheckedChange={() => selection.toggleSelection(person.id)}
/>

// Кнопка выбрать все
<Checkbox
  checked={selection.isAllSelected}
  onCheckedChange={selection.toggleAll}
/>

// Действия
{selection.selectedCount > 0 && (
  <div>
    <Button onClick={() => bulkDelete(selection.selectedItems)}>
      Удалить {selection.selectedCount}
    </Button>
    <Button onClick={() => bulkExport(selection.selectedItems)}>
      Экспорт {selection.selectedCount}
    </Button>
  </div>
)}
```

### 9. PWA

PWA работает автоматически! После деплоя:

1. Пользователи увидят баннер установки через 30 сек
2. Можно установить через меню браузера
3. Офлайн режим работает базово
4. Кеширование автоматическое

Дополнительно можно добавить кнопку:

```tsx
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'

// В App.tsx
<PWAInstallPrompt language={language} />
```

### 10. Auto-logout

```tsx
import { useAutoLogout } from '@/hooks/use-auto-logout'

useAutoLogout(
  userMode,
  () => {
    setUserMode('user')
    toast.warning('Вы вышли из режима администратора из-за неактивности')
  },
  true
)
```

## 🎨 Customization

### Настройка таймера auto-logout

В `src/hooks/use-auto-logout.ts`:
```tsx
const INACTIVITY_TIMEOUT = 15 * 60 * 1000 // Измените на нужное значение
```

### Настройка уведомлений

В `src/hooks/use-expiration.ts`:
```tsx
const thresholdDays = 2 // За сколько дней уведомлять
```

### Настройка PWA иконок

Замените файлы в `/public/`:
- `icon-192.png`
- `icon-512.png`

### Цвета PDF

В `src/lib/pdf-generator.ts`:
```tsx
// Header color
doc.setFillColor(41, 128, 185) // RGB

// Status badge color
doc.setFillColor(76, 175, 80) // Green
```

## 📱 Тестирование PWA

1. **Dev режим:**
```bash
npm run build
npm run preview
```

2. **Production:**
- Задеплойте на Vercel
- Откройте на мобильном
- Chrome покажет "Установить приложение"

3. **Проверка offline:**
- Откройте DevTools → Application → Service Workers
- Включите "Offline"
- Перезагрузите страницу

## ✅ Чеклист интеграции

- [ ] Добавлен QRCodeGenerator в PTW детали
- [ ] Добавлен AuditLogViewer в SuperAdmin
- [ ] Подключен useExpirationNotifications
- [ ] Добавлены кнопки PDF export/print
- [ ] Настроены keyboard shortcuts
- [ ] Интегрированы шаблоны PTW
- [ ] Заменен dashboard на EnhancedDashboard
- [ ] Добавлен bulk selection в таблицы
- [ ] Сгенерированы PWA иконки
- [ ] Добавлен auto-logout
- [ ] Добавлено логирование во все CRUD операции
- [ ] Протестирована установка PWA

## 🐛 Troubleshooting

**QR-код не скачивается:**
- Проверьте CORS настройки
- Убедитесь что браузер поддерживает canvas.toBlob

**Service Worker не регистрируется:**
- Проверьте что файл `/public/sw.js` доступен
- Работает только на HTTPS (кроме localhost)

**PDF не генерируется:**
- Проверьте что библиотека jspdf установлена
- Проверьте формат данных PTW

**Audit log не сохраняется:**
- Проверьте localStorage
- Проверьте Supabase подключение (опционально)

---

**Все готово к использованию! 🎉**
