import { useState } from 'react'
import { globalDb } from '@/lib/globalDb'
import { QrCode, Download, Upload, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminDataSync() {
  const [exportData, setExportData] = useState('')
  const [importData, setImportData] = useState('')
  const [copied, setCopied] = useState(false)
  const [importing, setImporting] = useState(false)

  const handleExport = () => {
    const data = globalDb.exportData()
    setExportData(data)
    toast.success('Ma\'lumotlar export qilindi!')
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportData)
      setCopied(true)
      toast.success('Ma\'lumotlar nusxalandi!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Nusxalashda xato')
    }
  }

  const handleImport = async () => {
    if (!importData.trim()) {
      toast.error('Ma\'lumotlarni kiriting')
      return
    }

    setImporting(true)
    try {
      const success = await globalDb.importData(importData.trim())
      if (success) {
        toast.success('Ma\'lumotlar import qilindi!')
        setImportData('')
        // Sahifani yangilash
        window.location.reload()
      } else {
        toast.error('Noto\'g\'ri ma\'lumot formati')
      }
    } catch (error) {
      toast.error('Import qilishda xato')
    }
    setImporting(false)
  }

  const generateQRData = () => {
    const data = globalDb.exportData()
    // QR kod uchun qisqartirilgan ma'lumot
    const compressed = JSON.stringify({
      profiles: JSON.parse(data).profiles,
      passwords: JSON.parse(data).passwords,
      timestamp: Date.now()
    })
    return compressed
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Ma'lumotlarni ulashish</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export qismi */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-6 h-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ma'lumotlarni export qilish</h2>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Barcha foydalanuvchi ma'lumotlarini boshqa telefonlarga ko'chirish uchun export qiling.
          </p>

          <button
            onClick={handleExport}
            className="w-full mb-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium"
          >
            Ma'lumotlarni export qilish
          </button>

          {exportData && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Export qilingan ma'lumot:</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Nusxalandi' : 'Nusxalash'}
                </button>
              </div>
              
              <textarea
                value={exportData}
                readOnly
                className="w-full h-32 p-3 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg resize-none"
              />
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Bu ma'lumotni boshqa telefonlarda import qiling
              </div>
            </div>
          )}
        </div>

        {/* Import qismi */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="w-6 h-6 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ma'lumotlarni import qilish</h2>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Boshqa telefondan export qilingan ma'lumotlarni bu yerga joylashtiring.
          </p>

          <textarea
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            placeholder="Export qilingan ma'lumotlarni bu yerga joylashtiring..."
            className="w-full h-32 p-3 text-xs font-mono border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg resize-none mb-4"
          />

          <button
            onClick={handleImport}
            disabled={importing || !importData.trim()}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
          >
            {importing ? 'Import qilinmoqda...' : 'Ma\'lumotlarni import qilish'}
          </button>
        </div>
      </div>

      {/* QR kod qismi */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <QrCode className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">QR kod orqali ulashish</h2>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Tez orada QR kod funksiyasi qo'shiladi. Hozircha yuqoridagi copy/paste usulini ishlating.
        </p>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Qo'llanma:</h3>
          <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <li>1. Admin telefonida "Ma'lumotlarni export qilish" tugmasini bosing</li>
            <li>2. Chiqgan ma'lumotni "Nusxalash" tugmasi bilan copy qiling</li>
            <li>3. Boshqa telefonlarda saytga kiring va bu sahifaga o'ting</li>
            <li>4. "Ma'lumotlarni import qilish" qismiga paste qiling</li>
            <li>5. "Import qilish" tugmasini bosing</li>
            <li>6. Sahifa yangilanadi va barcha ma'lumotlar ko'rinadi</li>
          </ol>
        </div>
      </div>
    </div>
  )
}