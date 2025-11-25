# 📋 Руководство по импорту сотрудников / Personel İçe Aktarma Kılavuzu / Personnel Import Guide

## 🇷🇺 Русский

### Как добавить сотрудников через Excel

#### Шаг 1: Скачайте шаблон
1. Войдите в режим администратора (пароль: 123)
2. Нажмите кнопку **"Импорт"** в правом верхнем углу
3. В открывшемся окне нажмите **"Скачать шаблон Excel"**
4. Файл `personnel_template.csv` будет загружен на ваш компьютер

#### Шаг 2: Заполните данные
Откройте скачанный файл в Excel или Google Sheets и заполните следующие колонки:

| Колонка | Описание | Обязательно? | Пример |
|---------|----------|--------------|--------|
| **Имя** | Полное имя сотрудника | ✅ Да | Иванов Иван Иванович |
| **Должность** | Должность сотрудника | ✅ Да | Директор по ОТ и ПБ |
| **Роль** | Роль в системе | ✅ Да | issuer |
| **Email** | Электронная почта | ❌ Нет | ivanov@example.com |
| **Телефон** | Номер телефона | ❌ Нет | +79991234567 |

#### Доступные роли:
- `issuer` - Выдающий наряд-допуск
- `supervisor` - Ответственный руководитель работ
- `foreman` - Производитель работ
- `worker` - Рабочий

#### Шаг 3: Загрузите файл
1. Сохраните файл в формате CSV или Excel (.xlsx, .xls)
2. Вернитесь в окно импорта
3. Перетащите файл в область загрузки ИЛИ нажмите на неё для выбора файла
4. Проверьте предпросмотр импортируемых данных
5. Нажмите кнопку **"Импортировать"**

#### ✅ Готово!
Все сотрудники из файла будут добавлены в систему.

---

## 🇹🇷 Türkçe

### Excel ile Personel Nasıl Eklenir

#### Adım 1: Şablonu İndirin
1. Yönetici moduna girin (şifre: 123)
2. Sağ üst köşedeki **"İçe Aktar"** düğmesine tıklayın
3. Açılan pencerede **"Excel Şablonunu İndir"** düğmesine tıklayın
4. `personnel_template.csv` dosyası bilgisayarınıza indirilecek

#### Adım 2: Verileri Doldurun
İndirilen dosyayı Excel veya Google Sheets'te açın ve şu sütunları doldurun:

| Sütun | Açıklama | Zorunlu? | Örnek |
|-------|----------|----------|-------|
| **Ad** | Personelin tam adı | ✅ Evet | Ahmet Yılmaz |
| **Pozisyon** | Personelin pozisyonu | ✅ Evet | Operasyon Direktörü |
| **Rol** | Sistemdeki rolü | ✅ Evet | supervisor |
| **E-posta** | E-posta adresi | ❌ Hayır | ahmet@example.com |
| **Telefon** | Telefon numarası | ❌ Hayır | +905551234567 |

#### Mevcut Roller:
- `issuer` - İzin Veren
- `supervisor` - Sorumlu Yönetici
- `foreman` - İş Sorumlusu
- `worker` - İşçi

#### Adım 3: Dosyayı Yükleyin
1. Dosyayı CSV veya Excel formatında (.xlsx, .xls) kaydedin
2. İçe aktarma penceresine geri dönün
3. Dosyayı yükleme alanına sürükleyin VEYA alan seçmek için tıklayın
4. İçe aktarılacak verilerin önizlemesini kontrol edin
5. **"İçe Aktar"** düğmesine tıklayın

#### ✅ Tamamlandı!
Dosyadaki tüm personel sisteme eklenecektir.

---

## 🇬🇧 English

### How to Add Personnel via Excel

#### Step 1: Download Template
1. Enter administrator mode (password: 123)
2. Click the **"Import"** button in the top right corner
3. In the opened window, click **"Download Excel Template"**
4. The `personnel_template.csv` file will be downloaded to your computer

#### Step 2: Fill in Data
Open the downloaded file in Excel or Google Sheets and fill in these columns:

| Column | Description | Required? | Example |
|--------|-------------|-----------|---------|
| **Name** | Full name of personnel | ✅ Yes | John Smith |
| **Position** | Personnel position | ✅ Yes | Safety Director |
| **Role** | Role in system | ✅ Yes | issuer |
| **Email** | Email address | ❌ No | john@example.com |
| **Phone** | Phone number | ❌ No | +11234567890 |

#### Available Roles:
- `issuer` - Permit Issuer
- `supervisor` - Work Supervisor
- `foreman` - Work Foreman
- `worker` - Worker

#### Step 3: Upload File
1. Save the file in CSV or Excel format (.xlsx, .xls)
2. Return to the import window
3. Drag the file to the upload area OR click to select file
4. Review the preview of imported data
5. Click the **"Import"** button

#### ✅ Done!
All personnel from the file will be added to the system.

---

## 📝 Советы / İpuçları / Tips

### 🇷🇺 Русский
- **Массовое добавление**: Вы можете добавить сразу много сотрудников, просто добавив строки в Excel
- **Ручное добавление**: Для добавления одного сотрудника используйте кнопку "Добавить" вместо импорта
- **Редактирование**: После импорта вы можете редактировать данные любого сотрудника
- **Проверка**: Всегда проверяйте предпросмотр перед импортом
- **Формат**: Используйте точное написание ролей: issuer, supervisor, foreman, worker

### 🇹🇷 Türkçe
- **Toplu Ekleme**: Excel'e satır ekleyerek birçok personeli aynı anda ekleyebilirsiniz
- **Manuel Ekleme**: Tek bir personel eklemek için içe aktarma yerine "Ekle" düğmesini kullanın
- **Düzenleme**: İçe aktardıktan sonra herhangi bir personelin verilerini düzenleyebilirsiniz
- **Kontrol**: İçe aktarmadan önce her zaman önizlemeyi kontrol edin
- **Format**: Rollerin tam yazımını kullanın: issuer, supervisor, foreman, worker

### 🇬🇧 English
- **Bulk Adding**: You can add many personnel at once by simply adding rows in Excel
- **Manual Adding**: For adding a single person, use the "Add" button instead of import
- **Editing**: After import, you can edit any personnel's data
- **Verification**: Always check the preview before importing
- **Format**: Use exact spelling of roles: issuer, supervisor, foreman, worker
