import { useState, useRef } from 'react'
import { Upload, FileText, X, CheckCircle, Warning, Download, BookOpen } from '@phosphor-icons/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import type { Person, Language } from '@/lib/ptw-types'

interface ImportPersonnelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (persons: Person[]) => void
  language: Language
}

export function ImportPersonnelDialog({ open, onOpenChange, onImport, language }: ImportPersonnelDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [preview, setPreview] = useState<Person[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const labels = {
    ru: {
      title: 'Импорт сотрудников из Excel',
      description: 'Загрузите Excel файл со списком сотрудников',
      downloadTemplate: 'Скачать шаблон Excel',
      selectFile: 'Выбрать файл',
      fileSelected: 'Файл выбран',
      noFile: 'Файл не выбран',
      import: 'Импортировать',
      cancel: 'Отмена',
      preview: 'Предпросмотр',
      records: 'записей',
      name: 'Имя',
      position: 'Должность',
      role: 'Роль',
      email: 'Email',
      phone: 'Телефон',
      templateInfo: 'Шаблон содержит примеры заполнения',
      dropzone: 'Перетащите файл сюда или нажмите для выбора',
      formatInfo: 'Поддерживается: .xlsx, .xls, .csv',
      importSuccess: 'Успешно импортировано',
      importError: 'Ошибка импорта',
      howTo: 'Как импортировать сотрудников',
      step1: '1. Скачайте шаблон Excel',
      step2: '2. Заполните данные сотрудников',
      step3: '3. Загрузите файл обратно',
      step1Desc: 'Нажмите кнопку "Скачать шаблон Excel" чтобы получить образец файла',
      step2Desc: 'Откройте файл в Excel и заполните: имя, должность, роль (issuer/supervisor/foreman/worker), email, телефон',
      step3Desc: 'Перетащите файл в область загрузки или нажмите для выбора файла',
      viewGuide: 'Подробное руководство',
      errorTitle: 'Обнаружены ошибки',
      roles: {
        issuer: 'Выдающий наряд',
        supervisor: 'Ответственный руководитель',
        foreman: 'Производитель работ',
        worker: 'Рабочий',
      },
    },
    tr: {
      title: 'Excel\'den Personel İçe Aktar',
      description: 'Personel listesi içeren Excel dosyasını yükleyin',
      downloadTemplate: 'Excel Şablonunu İndir',
      selectFile: 'Dosya Seç',
      fileSelected: 'Dosya seçildi',
      noFile: 'Dosya seçilmedi',
      import: 'İçe Aktar',
      cancel: 'İptal',
      preview: 'Önizleme',
      records: 'kayıt',
      name: 'Ad',
      position: 'Pozisyon',
      role: 'Rol',
      email: 'E-posta',
      phone: 'Telefon',
      templateInfo: 'Şablon doldurma örnekleri içerir',
      dropzone: 'Dosyayı buraya sürükleyin veya seçmek için tıklayın',
      formatInfo: 'Desteklenen: .xlsx, .xls, .csv',
      importSuccess: 'Başarıyla içe aktarıldı',
      importError: 'İçe aktarma hatası',
      howTo: 'Personel nasıl içe aktarılır',
      step1: '1. Excel şablonunu indirin',
      step2: '2. Personel verilerini doldurun',
      step3: '3. Dosyayı geri yükleyin',
      step1Desc: 'Örnek dosyayı almak için "Excel Şablonunu İndir" düğmesine tıklayın',
      step2Desc: 'Dosyayı Excel\'de açın ve doldurun: ad, pozisyon, rol (issuer/supervisor/foreman/worker), e-posta, telefon',
      step3Desc: 'Dosyayı yükleme alanına sürükleyin veya dosya seçmek için tıklayın',
      viewGuide: 'Detaylı kılavuz',
      errorTitle: 'Hatalar tespit edildi',
      roles: {
        issuer: 'İzin Veren',
        supervisor: 'Sorumlu Yönetici',
        foreman: 'İş Sorumlusu',
        worker: 'İşçi',
      },
    },
    en: {
      title: 'Import Personnel from Excel',
      description: 'Upload an Excel file with personnel list',
      downloadTemplate: 'Download Excel Template',
      selectFile: 'Select File',
      fileSelected: 'File selected',
      noFile: 'No file selected',
      import: 'Import',
      cancel: 'Cancel',
      preview: 'Preview',
      records: 'records',
      name: 'Name',
      position: 'Position',
      role: 'Role',
      email: 'Email',
      phone: 'Phone',
      templateInfo: 'Template contains example entries',
      dropzone: 'Drag and drop file here or click to select',
      formatInfo: 'Supported: .xlsx, .xls, .csv',
      importSuccess: 'Successfully imported',
      importError: 'Import error',
      howTo: 'How to import personnel',
      step1: '1. Download Excel template',
      step2: '2. Fill in personnel data',
      step3: '3. Upload file back',
      step1Desc: 'Click "Download Excel Template" button to get the sample file',
      step2Desc: 'Open file in Excel and fill in: name, position, role (issuer/supervisor/foreman/worker), email, phone',
      step3Desc: 'Drag file to upload area or click to select file',
      viewGuide: 'Detailed guide',
      errorTitle: 'Errors detected',
      roles: {
        issuer: 'Permit Issuer',
        supervisor: 'Supervisor',
        foreman: 'Foreman',
        worker: 'Worker',
      },
    },
  }

  const l = labels[language]

  const downloadTemplate = () => {
    try {
      const templateData = [
        ['Имя', 'Должность', 'Роль', 'Email', 'Телефон'],
        ['Иван Петров', 'Инженер', 'worker', 'ivan@example.com', '+79991234567'],
        ['Мария Иванова', 'Директор', 'supervisor', 'maria@example.com', '+79001234567'],
        ['Сергей Сидоров', 'Мастер', 'foreman', 'sergey@example.com', '+79111234567'],
        ['', '', '', '', ''],
        ['РОЛИ - можно писать по-русски:', '', '', '', ''],
        ['worker', 'или Рабочий', '', '', ''],
        ['supervisor', 'или Руководитель', '', '', ''],
        ['foreman', 'или Мастер', '', '', ''],
        ['issuer', 'или Выдающий', '', '', ''],
      ]    // Определяем разделитель на основе локали системы
    // Windows часто использует точку с запятой для CSV
    const isWindowsLikeLocale = navigator.language.includes('ru') || 
                                 navigator.language.includes('tr') ||
                                 navigator.platform.includes('Win')
    const delimiter = isWindowsLikeLocale ? ';' : ','

    // Создаем CSV с UTF-8 BOM для корректного открытия в Excel на всех платформах
    const BOM = '\uFEFF'
    const csvContent = templateData.map(row => 
      row.map(cell => {
        // Экранируем ячейки с разделителями, кавычками и переводами строк
        if (cell.includes(delimiter) || cell.includes('"') || cell.includes('\n') || cell.includes('\r')) {
          return `"${cell.replace(/"/g, '""')}"`
        }
        return cell
      }).join(delimiter)
    ).join('\r\n') // Windows-style line endings для максимальной совместимости

    // Создаем Blob с правильной кодировкой
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    
    // Создаем ссылку для скачивания
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'personnel_template.csv'
    link.style.display = 'none'
    
    // Скачиваем файл
    document.body.appendChild(link)
    
    // Используем setTimeout для надежности в разных браузерах
    setTimeout(() => {
      try {
        link.click()
        
        // Очищаем после небольшой задержки
        setTimeout(() => {
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        }, 100)
        
        const successMsg = language === 'ru'
          ? 'Шаблон скачан! Проверьте папку "Загрузки"'
          : language === 'tr'
          ? 'Şablon indirildi! "İndirilenler" klasörünü kontrol edin'
          : 'Template downloaded! Check your Downloads folder'
        
        toast.success(successMsg)
        
        console.log('✅ Template downloaded:', {
          fileName: 'personnel_template.csv',
          size: blob.size,
          delimiter,
          locale: navigator.language
        })
      } catch (error) {
        console.error('❌ Download error:', error)
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        toast.error(language === 'ru' ? 'Ошибка скачивания' : 'Download error')
      }
    }, 0)
    } catch (error) {
      console.error('❌ Template generation error:', error)
      const errorMsg = language === 'ru'
        ? 'Ошибка создания шаблона. Попробуйте еще раз'
        : language === 'tr'
        ? 'Şablon oluşturma hatası. Tekrar deneyin'
        : 'Template generation error. Try again'
      toast.error(errorMsg)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    await parseFile(selectedFile)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (!droppedFile) return

    setFile(droppedFile)
    await parseFile(droppedFile)
  }

  const parseFile = async (file: File) => {
    try {
      setErrors([])
      
      // Проверяем расширение файла
      const fileName = file.name.toLowerCase()
      const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls')
      const isCsv = fileName.endsWith('.csv')
      
      if (!isExcel && !isCsv) {
        const error = language === 'ru' 
          ? 'Неподдерживаемый формат файла. Используйте .xlsx, .xls или .csv' 
          : language === 'tr' 
          ? 'Desteklenmeyen dosya formatı. .xlsx, .xls veya .csv kullanın'
          : 'Unsupported file format. Use .xlsx, .xls or .csv'
        setErrors([error])
        toast.error(l.importError)
        return
      }

      // Для Excel файлов показываем предупреждение
      if (isExcel) {
        const warning = language === 'ru'
          ? 'Excel файлы пока не поддерживаются напрямую. Пожалуйста, сохраните файл как CSV в Excel (Файл → Сохранить как → CSV UTF-8)'
          : language === 'tr'
          ? 'Excel dosyaları henüz doğrudan desteklenmiyor. Lütfen dosyayı Excel\'de CSV olarak kaydedin (Dosya → Farklı Kaydet → CSV UTF-8)'
          : 'Excel files are not yet directly supported. Please save the file as CSV in Excel (File → Save As → CSV UTF-8)'
        toast.warning(warning)
        setErrors([warning])
        return
      }

      const text = await file.text()
      
      // Автоматическое определение разделителя (запятая или точка с запятой)
      const detectDelimiter = (text: string): string => {
        const firstLine = text.split('\n')[0]
        const commaCount = (firstLine.match(/,/g) || []).length
        const semicolonCount = (firstLine.match(/;/g) || []).length
        return semicolonCount > commaCount ? ';' : ','
      }
      
      const delimiter = detectDelimiter(text)
      
      // Улучшенный парсинг CSV с поддержкой экранирования и разных разделителей
      const parseCSVLine = (line: string, delimiter: string): string[] => {
        const result: string[] = []
        let current = ''
        let inQuotes = false
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          const nextChar = line[i + 1]
          
          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              // Двойные кавычки внутри quoted field
              current += '"'
              i++ // Пропускаем следующую кавычку
            } else {
              // Переключаем режим кавычек
              inQuotes = !inQuotes
            }
          } else if (char === delimiter && !inQuotes) {
            // Разделитель вне кавычек
            result.push(current.trim())
            current = ''
          } else {
            current += char
          }
        }
        
        // Добавляем последнее поле
        result.push(current.trim())
        
        return result
      }

      const lines = text
        .replace(/\r\n/g, '\n')  // Нормализуем переводы строк
        .replace(/\r/g, '\n')
        .split('\n')
        .filter(line => line.trim())
      
      if (lines.length < 2) {
        const error = language === 'ru' 
          ? 'Файл пустой или содержит только заголовок' 
          : language === 'tr' 
          ? 'Dosya boş veya sadece başlık içeriyor' 
          : 'File is empty or contains only header'
        setErrors([error])
        toast.error(l.importError)
        return
      }

      const persons: Person[] = []
      const parseErrors: string[] = []
      
      // Пропускаем заголовок (первую строку)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        
        // Пропускаем строки с описанием ролей
        if (line.toLowerCase().includes('роли') || 
            line.toLowerCase().includes('roller') || 
            line.toLowerCase().includes('roles')) {
          continue
        }

        const parts = parseCSVLine(line, delimiter)
        
        // Проверяем минимальное количество полей (теперь только имя обязательно)
        if (parts.length < 1) {
          continue // Просто пропускаем пустые строки
        }
        
        // Проверяем что есть хотя бы имя
        if (!parts[0] || !parts[0].trim()) {
          continue // Пропускаем строки без имени
        }

        // Умная обработка роли с автоматическим исправлением
        let role = 'worker' // Роль по умолчанию
        
        if (parts[2]) {
          const roleInput = parts[2].toLowerCase().trim()
          
          // Прямое совпадение
          if (['issuer', 'supervisor', 'foreman', 'worker'].includes(roleInput)) {
            role = roleInput
          }
          // Автоматическое исправление русских/турецких названий
          else if (roleInput.includes('выда') || roleInput.includes('издавател') || roleInput.includes('izin')) {
            role = 'issuer'
          }
          else if (roleInput.includes('руководител') || roleInput.includes('отве') || roleInput.includes('yönetici') || roleInput.includes('super')) {
            role = 'supervisor'
          }
          else if (roleInput.includes('мастер') || roleInput.includes('произв') || roleInput.includes('dopusk') || roleInput.includes('sorumlu')) {
            role = 'foreman'
          }
          else if (roleInput.includes('рабоч') || roleInput.includes('исполн') || roleInput.includes('işçi') || roleInput.includes('work')) {
            role = 'worker'
          }
          else {
            // Неизвестная роль - используем worker и предупреждаем
            parseErrors.push(`${language === 'ru' ? 'Строка' : language === 'tr' ? 'Satır' : 'Line'} ${i + 1}: ${language === 'ru' ? 'роль' : language === 'tr' ? 'rol' : 'role'} "${parts[2]}" ${language === 'ru' ? 'заменена на "worker"' : language === 'tr' ? '"worker" olarak değiştirildi' : 'changed to "worker"'}`)
          }
        }

        persons.push({
          id: crypto.randomUUID(),
          name: parts[0].trim(),
          position: parts[1]?.trim() || 'Сотрудник', // Должность по умолчанию
          role: role as Person['role'],
          email: parts[3]?.trim() || undefined,
          phone: parts[4]?.trim() || undefined,
        })
      }

      if (persons.length === 0 && parseErrors.length > 0) {
        setErrors(parseErrors)
        toast.error(l.importError)
        return
      }

      if (parseErrors.length > 0) {
        setErrors(parseErrors)
        const warningMsg = language === 'ru'
          ? `Найдено ${parseErrors.length} ошибок, но ${persons.length} записей успешно обработано`
          : language === 'tr'
          ? `${parseErrors.length} hata bulundu, ancak ${persons.length} kayıt başarıyla işlendi`
          : `Found ${parseErrors.length} errors, but ${persons.length} records processed successfully`
        toast.warning(warningMsg)
      }

      setPreview(persons)
      const successMsg = `${l.preview}: ${persons.length} ${l.records}`
      toast.success(successMsg)
      
      // Детальное логирование для отладки
      console.log('✅ Импорт обработан:', {
        totalLines: lines.length,
        parsedPersons: persons.length,
        errors: parseErrors.length,
        persons: persons.map(p => ({ name: p.name, role: p.role }))
      })
    } catch (error) {
      console.error('❌ Parse error:', error)
      const errorMsg = language === 'ru' ? 'Ошибка чтения файла. Проверьте формат.' :
                       language === 'tr' ? 'Dosya okuma hatası. Formatı kontrol edin.' :
                       'File read error. Check format.'
      setErrors([errorMsg])
      toast.error(l.importError)
    }
  }

  const handleImport = () => {
    console.log('🚀 Начало импорта:', { previewLength: preview.length, preview })
    
    if (preview.length === 0) {
      console.warn('⚠️ Preview пустой, импорт отменен')
      toast.error(l.importError)
      return
    }

    setImporting(true)
    try {
      console.log('📤 Вызов onImport с данными:', preview)
      onImport(preview)
      console.log('✅ onImport выполнен успешно')
      toast.success(`${l.importSuccess}: ${preview.length} ${l.records}`)
      onOpenChange(false)
      setFile(null)
      setPreview([])
    } catch (error) {
      toast.error(l.importError)
    } finally {
      setImporting(false)
    }
  }

  const clearFile = () => {
    setFile(null)
    setPreview([])
    setErrors([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Upload className="h-6 w-6" />
            {l.title}
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>{l.description}</span>
            <Button 
              variant="link" 
              size="sm" 
              onClick={() => window.open('https://github.com/yourusername/stellar-ptw/blob/main/IMPORT_GUIDE.md', '_blank')}
              className="text-xs"
            >
              <BookOpen className="h-3 w-3 mr-1" />
              {l.viewGuide}
            </Button>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <h3 className="font-semibold mb-3 text-lg">{l.howTo}</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <p className="font-medium">{l.step1}</p>
                  <p className="text-sm text-muted-foreground mt-1">{l.step1Desc}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <p className="font-medium">{l.step2}</p>
                  <p className="text-sm text-muted-foreground mt-1">{l.step2Desc}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <p className="font-medium">{l.step3}</p>
                  <p className="text-sm text-muted-foreground mt-1">{l.step3Desc}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-muted/50 border-dashed border-2">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">{l.templateInfo}</p>
                <Button variant="outline" size="sm" onClick={downloadTemplate} className="w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  {l.downloadTemplate}
                </Button>
              </div>
            </div>
          </Card>

          {errors.length > 0 && (
            <Alert variant="destructive">
              <Warning className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold mb-2">{l.errorTitle}:</p>
                <ul className="text-sm space-y-1">
                  {errors.slice(0, 5).map((error, idx) => (
                    <li key={idx}>• {error}</li>
                  ))}
                  {errors.length > 5 && (
                    <li className="text-muted-foreground">... и ещё {errors.length - 5}</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />
            
            {file ? (
              <div className="space-y-3">
                <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
                <div>
                  <p className="font-semibold text-lg">{l.fileSelected}</p>
                  <p className="text-sm text-muted-foreground mt-1">{file.name}</p>
                  {preview.length > 0 && (
                    <p className="text-sm text-primary mt-2 font-medium">
                      {l.preview}: {preview.length} {l.records}
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); clearFile(); }}>
                  <X className="h-4 w-4 mr-1" />
                  Очистить
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="font-semibold text-lg">{l.dropzone}</p>
                  <p className="text-sm text-muted-foreground mt-2">{l.formatInfo}</p>
                </div>
              </div>
            )}
          </div>

          {preview.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Warning className="h-5 w-5 text-primary" />
                {l.preview} ({preview.length} {l.records})
              </h3>
              <div className="max-h-[300px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="text-left p-2 border">{l.name}</th>
                      <th className="text-left p-2 border">{l.position}</th>
                      <th className="text-left p-2 border">{l.role}</th>
                      <th className="text-left p-2 border">{l.email}</th>
                      <th className="text-left p-2 border">{l.phone}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((person, idx) => (
                      <tr key={idx} className="hover:bg-muted/50">
                        <td className="p-2 border">{person.name}</td>
                        <td className="p-2 border">{person.position}</td>
                        <td className="p-2 border">
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                            {l.roles[person.role]}
                          </span>
                        </td>
                        <td className="p-2 border text-muted-foreground">{person.email || '—'}</td>
                        <td className="p-2 border text-muted-foreground">{person.phone || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {l.cancel}
            </Button>
            <Button
              onClick={handleImport}
              disabled={preview.length === 0 || importing}
              className="min-w-[120px]"
            >
              {importing ? (
                <>Импорт...</>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {l.import} ({preview.length})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
