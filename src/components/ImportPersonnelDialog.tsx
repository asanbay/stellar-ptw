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
    const templateData = [
      ['Имя / Ad / Name', 'Должность / Pozisyon / Position', 'Роль / Rol / Role', 'Email', 'Телефон / Telefon / Phone'],
      ['Иванов Иван Иванович', 'Директор по ОТ и ПБ', 'issuer', 'ivanov@example.com', '+79991234567'],
      ['Ahmet Yılmaz', 'Операционный директор', 'supervisor', 'ahmet@example.com', '+905551234567'],
      ['Петров Петр', 'Мастер-производитель', 'foreman', 'petrov@example.com', '+79991234568'],
      ['Сидоров Сергей', 'Рабочий-монтажник', 'worker', 'sidorov@example.com', '+79991234569'],
      ['', '', '', '', ''],
      ['Роли / Roller / Roles:', '', '', '', ''],
      ['issuer', '- Выдающий наряд / İzin Veren / Permit Issuer', '', '', ''],
      ['supervisor', '- Ответственный руководитель / Sorumlu Yönetici / Supervisor', '', '', ''],
      ['foreman', '- Производитель работ / İş Sorumlusu / Foreman', '', '', ''],
      ['worker', '- Рабочий / İşçi / Worker', '', '', ''],
    ]

    let csvContent = 'data:text/csv;charset=utf-8,'
    csvContent += templateData.map(row => row.join(',')).join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'personnel_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success(l.downloadTemplate)
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
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        const error = language === 'ru' ? 'Файл пустой или содержит только заголовок' : 
                      language === 'tr' ? 'Dosya boş veya sadece başlık içeriyor' : 
                      'File is empty or contains only header'
        setErrors([error])
        toast.error(l.importError)
        return
      }

      const persons: Person[] = []
      const parseErrors: string[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''))
        
        if (parts.length < 3) {
          parseErrors.push(`Строка ${i + 1}: недостаточно данных`)
          continue
        }
        
        if (!parts[0] || !parts[1] || !parts[2]) {
          parseErrors.push(`Строка ${i + 1}: пустые обязательные поля`)
          continue
        }

        const role = parts[2].toLowerCase()
        if (!['issuer', 'supervisor', 'foreman', 'worker'].includes(role)) {
          parseErrors.push(`Строка ${i + 1}: неверная роль "${parts[2]}"`)
          continue
        }

        persons.push({
          id: crypto.randomUUID(),
          name: parts[0],
          position: parts[1],
          role: role as Person['role'],
          email: parts[3] || undefined,
          phone: parts[4] || undefined,
        })
      }

      if (persons.length === 0 && parseErrors.length > 0) {
        setErrors(parseErrors)
        toast.error(l.importError)
        return
      }

      if (parseErrors.length > 0) {
        setErrors(parseErrors)
      }

      setPreview(persons)
      toast.success(`${l.preview}: ${persons.length} ${l.records}`)
    } catch (error) {
      console.error('Parse error:', error)
      const errorMsg = language === 'ru' ? 'Ошибка чтения файла. Проверьте формат.' :
                       language === 'tr' ? 'Dosya okuma hatası. Formatı kontrol edin.' :
                       'File read error. Check format.'
      setErrors([errorMsg])
      toast.error(l.importError)
    }
  }

  const handleImport = () => {
    if (preview.length === 0) {
      toast.error(l.importError)
      return
    }

    setImporting(true)
    try {
      onImport(preview)
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
