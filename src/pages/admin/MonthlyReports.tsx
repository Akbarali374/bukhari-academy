import { useEffect, useState } from 'react'
import { getStudents, getGradesByStudent } from '@/lib/data'
import type { Profile } from '@/types'
import { Mail, Send, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminMonthlyReports() {
  const [students, setStudents] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sentCount, setSentCount] = useState(0)
  const [emailConfig, setEmailConfig] = useState({
    serviceId: '',
    templateId: '',
    publicKey: ''
  })
  const [showConfig, setShowConfig] = useState(false)

  useEffect(() => {
    getStudents().then(setStudents).finally(() => setLoading(false))
    
    // EmailJS konfiguratsiyasini localStorage'dan yuklash
    const saved = localStorage.getItem('emailjs_config')
    if (saved) {
      try {
        setEmailConfig(JSON.parse(saved))
      } catch (error) {
        console.error('Config parse error:', error)
      }
    }
  }, [])

  const saveConfig = () => {
    localStorage.setItem('emailjs_config', JSON.stringify(emailConfig))
    toast.success('Sozlamalar saqlandi!')
    setShowConfig(false)
  }

  async function sendEmailViaAPI(studentEmail: string, studentName: string, reportText: string) {
    try {
      // EmailJS API orqali email yuborish
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          service_id: emailConfig.serviceId,
          template_id: emailConfig.templateId,
          user_id: emailConfig.publicKey,
          template_params: {
            to_email: studentEmail,
            to_name: studentName,
            message: reportText,
            from_name: 'Bukhari Academy'
          }
        })
      })

      if (response.ok) {
        console.log('✅ Email yuborildi:', studentEmail)
        return true
      } else {
        console.error('❌ Email yuborishda xato:', response.status)
        return false
      }
    } catch (error) {
      console.error('❌ Email yuborishda xato:', error)
      return false
    }
  }

  async function handleSendAll() {
    if (!emailConfig.serviceId || !emailConfig.templateId || !emailConfig.publicKey) {
      toast.error('Avval EmailJS sozlamalarini kiriting!')
      setShowConfig(true)
      return
    }

    setSending(true)
    setSentCount(0)
    
    const now = new Date()
    const month = now.toLocaleString('uz-UZ', { month: 'long' })
    const year = now.getFullYear()
    
    let successCount = 0
    
    for (const s of students) {
      const grades = await getGradesByStudent(s.id)
      const totalGrade = grades.length ? grades.reduce((sum, g) => sum + g.grade_value + g.bonus, 0) / grades.length : 0
      
      const reportText = `Hurmatli ${s.first_name} ${s.last_name},

${month} ${year} oyi hisoboti:

📊 O'rtacha ball: ${totalGrade.toFixed(1)}
📝 Baholar soni: ${grades.length}
${grades.length > 0 ? `🎯 Eng yuqori ball: ${Math.max(...grades.map(g => g.grade_value + g.bonus))}` : ''}

${totalGrade >= 4.5 ? '🌟 Ajoyib natija! Davom eting!' : totalGrade >= 3.5 ? '👍 Yaxshi natija! Yana harakat qiling!' : '💪 Ko\'proq harakat qilishingiz kerak!'}

Hurmat bilan,
Bukhari Academy`

      const success = await sendEmailViaAPI(s.email, `${s.first_name} ${s.last_name}`, reportText)
      
      if (success) {
        successCount++
        setSentCount(successCount)
      }
      
      // Har bir emaildan keyin 1 soniya kutish (rate limit uchun)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    setSending(false)
    
    if (successCount === students.length) {
      toast.success(`✅ Barcha o'quvchilarga (${successCount} ta) hisobot yuborildi!`, {
        duration: 5000,
        style: {
          background: '#10b981',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 'bold'
        }
      })
    } else {
      toast.error(`⚠️ ${successCount}/${students.length} ta email yuborildi. Ba'zilari yuborilmadi.`, {
        duration: 5000
      })
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Oylik hisobotlar</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Har oy o'quvchiga natija Gmail orqali yuboriladi.
      </p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Email sozlamalari */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Email sozlamalari (EmailJS)</h2>
              <button
                onClick={() => setShowConfig(!showConfig)}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                {showConfig ? 'Yashirish' : 'Sozlash'}
              </button>
            </div>

            {showConfig && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Service ID
                  </label>
                  <input
                    type="text"
                    value={emailConfig.serviceId}
                    onChange={(e) => setEmailConfig({...emailConfig, serviceId: e.target.value})}
                    placeholder="service_xxxxxxx"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Template ID
                  </label>
                  <input
                    type="text"
                    value={emailConfig.templateId}
                    onChange={(e) => setEmailConfig({...emailConfig, templateId: e.target.value})}
                    placeholder="template_xxxxxxx"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Public Key
                  </label>
                  <input
                    type="text"
                    value={emailConfig.publicKey}
                    onChange={(e) => setEmailConfig({...emailConfig, publicKey: e.target.value})}
                    placeholder="xxxxxxxxxxxxxxxx"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  onClick={saveConfig}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                >
                  Saqlash
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  EmailJS sozlamalari: <a href="https://www.emailjs.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">emailjs.com</a> da ro'yxatdan o'ting va bu ma'lumotlarni oling.
                </p>
              </div>
            )}
          </div>

          {/* Hisobot yuborish */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-primary-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Oylik hisobotlarni yuborish
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Jami {students.length} ta o'quvchi
                </p>
              </div>
            </div>

            {sending && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
                  <span>Yuborilmoqda: {sentCount}/{students.length}</span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleSendAll}
              disabled={sending || students.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium disabled:opacity-50"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Yuborilmoqda... ({sentCount}/{students.length})
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Barcha o'quvchilarga yuborish
                </>
              )}
            </button>

            {!emailConfig.serviceId && (
              <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">
                ⚠️ Email yuborish uchun avval EmailJS sozlamalarini kiriting.
              </p>
            )}
          </div>

          {/* Hisobot namunasi */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              📧 Email namunasi:
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line font-mono">
{`Hurmatli [Ism] [Familiya],

[Oy] [Yil] oyi hisoboti:

📊 O'rtacha ball: 4.5
📝 Baholar soni: 10
🎯 Eng yuqori ball: 5

🌟 Ajoyib natija! Davom eting!

Hurmat bilan,
Bukhari Academy`}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
