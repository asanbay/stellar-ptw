import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Download, Share } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Language } from '@/lib/ptw-types'

interface QRCodeGeneratorProps {
  data: string
  title?: string
  description?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  language?: Language
}

const translations = {
  ru: {
    title: 'QR-код для быстрого доступа',
    description: 'Отсканируйте этот код для быстрого открытия',
    download: 'Скачать QR',
    share: 'Поделиться',
    copied: 'Ссылка скопирована!',
    downloaded: 'QR-код скачан!',
  },
  tr: {
    title: 'Hızlı erişim için QR kodu',
    description: 'Hızlı açmak için bu kodu tarayın',
    download: 'QR İndir',
    share: 'Paylaş',
    copied: 'Bağlantı kopyalandı!',
    downloaded: 'QR kodu indirildi!',
  },
  en: {
    title: 'QR Code for Quick Access',
    description: 'Scan this code to open quickly',
    download: 'Download QR',
    share: 'Share',
    copied: 'Link copied!',
    downloaded: 'QR code downloaded!',
  },
}

export function QRCodeGenerator({
  data,
  title,
  description,
  open,
  onOpenChange,
  language = 'en',
}: QRCodeGeneratorProps) {
  const t = translations[language]

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `qr-code-${Date.now()}.png`
        a.click()
        URL.revokeObjectURL(url)
        toast.success(t.downloaded)
      })
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  const shareLink = async () => {
    try {
      await navigator.clipboard.writeText(data)
      toast.success(t.copied)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title || t.title}</DialogTitle>
          <DialogDescription>{description || t.description}</DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-6">
          <div className="bg-white p-4 rounded-lg">
            <QRCodeSVG
              id="qr-code-svg"
              value={data}
              size={256}
              level="H"
              includeMargin
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={shareLink} className="gap-2">
            <Share size={16} />
            {t.share}
          </Button>
          <Button onClick={downloadQR} className="gap-2">
            <Download size={16} />
            {t.download}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
