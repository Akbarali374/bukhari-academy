import { useEffect, useState } from 'react'
import { getStudents, getGradesByStudent } from '@/lib/data'
import type { Profile } from '@/types'
import { Mail } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminMonthlyReports() {
  const [students, setStudents] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    getStudents().then(setStudents).finally(() => setLoading(false))
  }, [])

  async function handleSendAll() {
    setSending(true)
    // Front-end da haqiqiy email yuborish mumkin emas (CORS, API key). Backend/Serverless kerak.
    // Demo: faqat xabar ko'rsatamiz.
    const now = new Date()
    const month = now.toLocaleString('uz-UZ', { month: 'long' })
    const year = now.getFullYear()
    for (const s of students) {
      const grades = await getGradesByStudent(s.id)
      const totalGrade = grades.length ? grades.reduce((sum, g) => sum + g.grade_value + g.bonus, 0) / grades.length : 0
      const reportText = `Hurmatli o'quvchi,\n\n${month} ${year} oyi hisoboti:\nO'rtacha ball: ${totalGrade.toFixed(1)}\nBaholar soni: ${grades.length}\n\nHurmat bilan, Bukhari Academy`
      // Bu yerda API orqali email yuborish kerak (masalan Resend, SendGrid, yoki backend)
      console.log('Report to', s.email, reportText)
    }
    setSending(false)
    toast.success(`Barcha o'quvchilarga (${students.length} ta) oylik hisobot yuborish so'rovi qabul qilindi. Haqiqiy email yuborish uchun backend/email API sozlang.`)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Oylik hisobotlar</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Har oy o'quvchiga "Hurmatli o'quvchi" deb natija Gmailga yuboriladi, oxirida "Hurmat bilan, Bukhari Academy".
      </p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Jami {students.length} ta o'quvchi. Barchasiga oylik hisobotni Gmail orqali yuborish uchun quyidagi tugmani bosing.
          </p>
          <button
            type="button"
            onClick={handleSendAll}
            disabled={sending || students.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium disabled:opacity-50"
          >
            <Mail className="w-5 h-5" />
            {sending ? 'Yuborilmoqda...' : "Barcha o'quvchilarga yuborish"}
          </button>
          <p className="mt-4 text-xs text-amber-600 dark:text-amber-400">
            Haqiqiy email yuborish uchun loyihada email API (masalan Resend, SendGrid) yoki backend serverless funksiya sozlashingiz kerak.
          </p>
        </div>
      )}
    </div>
  )
}
