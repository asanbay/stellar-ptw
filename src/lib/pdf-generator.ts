import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import type { Language } from './ptw-types'

interface PTWData {
  ptwNumber: string
  workType: string
  workDescription: string
  location: string
  startDate: string
  endDate: string
  issuerName: string
  supervisorName: string
  foremanName: string
  workers: string[]
  status: string
  hazards?: string[]
  safetyMeasures?: string[]
  equipmentRequired?: string[]
}

const translations = {
  ru: {
    title: 'НАРЯД-ДОПУСК НА ПРОИЗВОДСТВО РАБОТ',
    number: 'Номер',
    workType: 'Тип работ',
    description: 'Описание работ',
    location: 'Место проведения работ',
    period: 'Период проведения работ',
    from: 'С',
    to: 'До',
    issuer: 'Выдавший наряд',
    supervisor: 'Ответственный руководитель',
    foreman: 'Производитель работ',
    workers: 'Допущенные работники',
    status: 'Статус',
    hazards: 'Опасные факторы',
    safety: 'Меры безопасности',
    equipment: 'Необходимое оборудование',
    signatures: 'ПОДПИСИ',
    issuerSign: 'Выдавший наряд',
    supervisorSign: 'Ответственный руководитель',
    foremanSign: 'Производитель работ',
    date: 'Дата',
    signature: 'Подпись',
    company: 'ТОО "Stellar"',
  },
  tr: {
    title: 'ÇALIŞMA İZNİ BELGESİ',
    number: 'Numara',
    workType: 'İş Türü',
    description: 'İş Açıklaması',
    location: 'Çalışma Yeri',
    period: 'Çalışma Süresi',
    from: 'Başlangıç',
    to: 'Bitiş',
    issuer: 'İzni Veren',
    supervisor: 'Sorumlu Yönetici',
    foreman: 'İş Ustası',
    workers: 'İzinli Çalışanlar',
    status: 'Durum',
    hazards: 'Tehlikeli Faktörler',
    safety: 'Güvenlik Önlemleri',
    equipment: 'Gerekli Ekipman',
    signatures: 'İMZALAR',
    issuerSign: 'İzni Veren',
    supervisorSign: 'Sorumlu Yönetici',
    foremanSign: 'İş Ustası',
    date: 'Tarih',
    signature: 'İmza',
    company: 'Stellar LLC',
  },
  en: {
    title: 'PERMIT TO WORK',
    number: 'Number',
    workType: 'Work Type',
    description: 'Work Description',
    location: 'Work Location',
    period: 'Work Period',
    from: 'From',
    to: 'To',
    issuer: 'Issuer',
    supervisor: 'Supervisor',
    foreman: 'Foreman',
    workers: 'Authorized Workers',
    status: 'Status',
    hazards: 'Hazardous Factors',
    safety: 'Safety Measures',
    equipment: 'Required Equipment',
    signatures: 'SIGNATURES',
    issuerSign: 'Issuer',
    supervisorSign: 'Supervisor',
    foremanSign: 'Foreman',
    date: 'Date',
    signature: 'Signature',
    company: 'Stellar LLC',
  },
}

export function generatePTWPDF(data: PTWData, language: Language = 'en'): jsPDF {
  const doc = new jsPDF()
  const t = translations[language]
  
  let y = 20
  const leftMargin = 20
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // Helper functions
  const addText = (text: string, fontSize = 12, isBold = false) => {
    doc.setFontSize(fontSize)
    doc.setFont('helvetica', isBold ? 'bold' : 'normal')
    doc.text(text, leftMargin, y)
    y += fontSize / 2 + 2
  }

  const addLine = () => {
    y += 5
    doc.setDrawColor(200, 200, 200)
    doc.line(leftMargin, y, pageWidth - leftMargin, y)
    y += 10
  }

  const addSection = (title: string, content: string | string[]) => {
    addText(title, 11, true)
    if (Array.isArray(content)) {
      content.forEach((item, idx) => {
        addText(`${idx + 1}. ${item}`, 10)
      })
    } else {
      addText(content, 10)
    }
    y += 5
  }

  // Header
  doc.setFillColor(41, 128, 185)
  doc.rect(0, 0, pageWidth, 40, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(t.title, pageWidth / 2, 25, { align: 'center' })
  
  // Company name
  doc.setFontSize(10)
  doc.text(t.company, pageWidth / 2, 35, { align: 'center' })
  
  // Reset text color
  doc.setTextColor(0, 0, 0)
  y = 50

  // PTW Number and Status
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`${t.number}: ${data.ptwNumber}`, leftMargin, y)
  doc.setFillColor(76, 175, 80)
  doc.setTextColor(255, 255, 255)
  doc.rect(pageWidth - 70, y - 6, 50, 10, 'F')
  doc.setFontSize(10)
  doc.text(data.status.toUpperCase(), pageWidth - 45, y, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  
  y += 15
  addLine()

  // Work Details
  addSection(t.workType, data.workType)
  addSection(t.description, data.workDescription)
  addSection(t.location, data.location)
  
  addText(`${t.period}:`, 11, true)
  addText(`${t.from}: ${format(new Date(data.startDate), 'dd MMM yyyy HH:mm')}`, 10)
  addText(`${t.to}: ${format(new Date(data.endDate), 'dd MMM yyyy HH:mm')}`, 10)
  y += 5
  
  addLine()

  // Personnel
  addSection(t.issuer, data.issuerName)
  addSection(t.supervisor, data.supervisorName)
  addSection(t.foreman, data.foremanName)
  
  if (data.workers && data.workers.length > 0) {
    addSection(t.workers, data.workers)
  }
  
  addLine()

  // Safety Information
  if (data.hazards && data.hazards.length > 0) {
    addSection(t.hazards, data.hazards)
  }
  
  if (data.safetyMeasures && data.safetyMeasures.length > 0) {
    addSection(t.safety, data.safetyMeasures)
  }
  
  if (data.equipmentRequired && data.equipmentRequired.length > 0) {
    addSection(t.equipment, data.equipmentRequired)
  }

  // Signature Section
  y = Math.max(y, doc.internal.pageSize.getHeight() - 80)
  addLine()
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(t.signatures, pageWidth / 2, y, { align: 'center' })
  y += 15

  // Signature boxes
  const boxWidth = 70
  const boxHeight = 30
  const spacing = 10
  
  const drawSignatureBox = (title: string, name: string, xPos: number) => {
    doc.setDrawColor(0, 0, 0)
    doc.rect(xPos, y, boxWidth, boxHeight)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(title, xPos + 5, y + 8)
    doc.setFont('helvetica', 'normal')
    doc.text(name, xPos + 5, y + 15)
    
    // Date line
    doc.setFontSize(8)
    doc.text(`${t.date}: __________`, xPos + 5, y + 25)
  }

  drawSignatureBox(t.issuerSign, data.issuerName, leftMargin)
  drawSignatureBox(t.supervisorSign, data.supervisorName, leftMargin + boxWidth + spacing)
  
  y += boxHeight + 10
  drawSignatureBox(t.foremanSign, data.foremanName, leftMargin)

  // Footer
  y = doc.internal.pageSize.getHeight() - 10
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.text(
    `Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`,
    pageWidth / 2,
    y,
    { align: 'center' }
  )

  return doc
}

export function downloadPTWPDF(data: PTWData, language: Language = 'en') {
  const pdf = generatePTWPDF(data, language)
  pdf.save(`PTW-${data.ptwNumber}-${format(new Date(), 'yyyyMMdd')}.pdf`)
}

export function printPTWPDF(data: PTWData, language: Language = 'en') {
  const pdf = generatePTWPDF(data, language)
  pdf.autoPrint()
  window.open(pdf.output('bloburl'), '_blank')
}
