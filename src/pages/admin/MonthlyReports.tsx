import { useEffect, useState } from 'react'
import { getStudents, getGradesByStudent } from '@/lib/data'
import type { Profile, Grade } from '@/types'
import { Mail, Send, CheckCircle, User, Award } from 'lucide-react'
import toast from 'react-hot-toast'

type GradeCategory = 'alo' | 'yaxshi' | 'qoniqarli' | 'hammasi'

interface StudentWithStats {
  student: Profile
  grades: Grade[]
  average: number
  percentage: number
  category: string
  selected: boolean
}

export default function AdminMonthlyReports() {
  const [students, setStudents] = useState<Profile[]>([])
  const [studentsWithStats, setStudentsWithStats] = useState<StudentWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sentCount, setSentCount] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<GradeCategory>('hammasi')
  const [emailConfig, setEmailConfig] = useState({
    serviceId: '',
    templateId: '',
    publicKey: '',
    fromEmail: 'bukhariacademy256@gmail.com'
  })
  const [showConfig, setShowConfig] = useState(false)

  useEffect(() => {
    loadStudentsWithStats()
    
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

  async function loadStudentsWithStats() {
    setLoading(true)
    const allStudents = await getStudents()
    
    const withStats: StudentWithStats[] = await Promise.all(
      allStudents.map(async (student) => {
        const grades = await getGradesByStudent(student.id)
        const average = grades.length 
          ? grades.reduce((sum, g) => sum + g.grade_value + g.bonus, 0) / grades.length 
          : 0
        
        // 100 dan foiz hisoblash (5 ball = 100%)
        const percentage = (average / 5) * 100
        
        // Kategoriya aniqlash
        let category = 'Qoniqarli'
        if (average >= 4.5) category = "A'lo"
        else if (average >= 3.5) category = 'Yaxshi'
        
        return {
          student,
          grades,
          average,
          percentage,
          category,
          selected: false
        }
      })
    )
    
    setStudentsWithStats(withStats)
    setStudents(allStudents)
    setLoading(false)
  }

  // Kategoriya bo'yicha filtrlash
  const filteredStudents = studentsWithStats.filter(s => {
    if (selectedCategory === 'hammasi') return true
    if (selectedCategory === 'alo') return s.average >= 4.5
    if (selectedCategory === 'yaxshi') return s.average >= 3.5 && s.average < 4.5
    if (selectedCategory === 'qoniqarli') return s.average < 3.5
    return true
  })

  // Tanlangan o'quvchilar soni
  const selectedCount = filteredStudents.filter(s => s.selected).length

  // Barchasini tanlash/bekor qilish
  function toggleSelectAll() {
    const allSelected = filteredStudents.every(s => s.selected)
    setStudentsWithStats(prev => prev.map(s => {
      if (filteredStudents.find(fs => fs.student.id === s.student.id)) {
        return { ...s, selected: !allSelected }
      }
      return s
    }))
  }

  // Bitta o'quvchini tanlash
  function toggleStudent(studentId: string) {
    setStudentsWithStats(prev => prev.map(s => 
      s.student.id === studentId ? { ...s, selected: !s.selected } : s
    ))
  }

  const saveConfig = () => {
    localStorage.setItem('emailjs_config', JSON.stringify(emailConfig))
    toast.success('Sozlamalar saqlandi!')
    setShowConfig(false)
  }

  async function sendEmailViaAPI(studentEmail: string, studentName: string, average: number, percentage: number, gradesCount: number, maxGrade: number) {
    try {
      const now = new Date()
      const month = now.toLocaleString('uz-UZ', { month: 'long' })
      const year = now.getFullYear()
      
      const motivationMessage = average >= 4.5 
        ? '🌟 Ajoyib natija! Siz a\'lo o\'quvchisiz! Davom eting!' 
        : average >= 3.5 
        ? '👍 Yaxshi natija! Yana bir oz harakat qilsangiz a\'lo bo\'lasiz!' 
        : '💪 Ko\'proq harakat qilishingiz kerak! Siz qila olasiz!'
      
      const reportText = `Hurmatli ${studentName},

${month} ${year} oyi hisoboti:

📊 O'rtacha ball: ${average.toFixed(2)}/5.00
📈 Foiz: ${percentage.toFixed(1)}% (100 dan)
📝 Baholar soni: ${gradesCount}
${gradesCount > 0 ? `🎯 Eng yuqori ball: ${maxGrade}` : ''}

${motivationMessage}

Hurmat bilan,
Bukhari Academy
${emailConfig.fromEmail}`

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
            from_name: 'Bukhari Academy',
            from_email: emailConfig.fromEmail,
            subject: `${month} ${year} - Oylik hisobot`
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

  async function handleSendSelected() {
    const selectedStudents = studentsWithStats.filter(s => s.selected)
    
    if (selectedStudents.length === 0) {
      toast.error('Hech kim tanlanmagan!')
      return
    }

    if (!emailConfig.serviceId || !emailConfig.templateId || !emailConfig.publicKey) {
      toast.error('Avval EmailJS sozlamalarini kiriting!')
      setShowConfig(true)
      return
    }

    setSending(true)
    setSentCount(0)
    
    let successCount = 0
    
    for (const item of selectedStudents) {
      const { student, grades, average, percentage } = item
      const maxGrade = grades.length > 0 ? Math.max(...grades.map(g => g.grade_value + g.bonus)) : 0
      
      const success = await sendEmailViaAPI(
        student.email,
        `${student.first_name} ${student.last_name}`,
        average,
        percentage,
        grades.length,
        maxGrade
      )
      
      if (success) {
        successCount++
        setSentCount(successCount)
      }
      
      // Har bir emaildan keyin 1 soniya kutish (rate limit uchun)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    setSending(false)
    
    if (successCount === selectedStudents.length) {
      toast.success(`✅ ${successCount} ta o'quvchiga hisobot yuborildi!`, {
        duration: 5000,
        style: {
          background: '#10b981',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 'bold'
        }
      })
      // Tanlovni tozalash
      setStudentsWithStats(prev => prev.map(s => ({ ...s, selected: false })))
    } else {
      toast.error(`⚠️ ${successCount}/${selectedStudents.length} ta email yuborildi.`, {
        duration: 5000
      })
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Oylik hisobotlar</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        O'quvchilarni tanlang va Gmail orqali hisobot yuboring
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
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Gmail sozlamalari</h2>
              </div>
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
                    Gmail manzili
                  </label>
                  <input
                    type="email"
                    value={emailConfig.fromEmail}
                    onChange={(e) => setEmailConfig({...emailConfig, fromEmail: e.target.value})}
                    placeholder="bukhariacademy256@gmail.com"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
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
                  EmailJS: <a href="https://www.emailjs.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">emailjs.com</a> da ro'yxatdan o'ting
                </p>
              </div>
            )}
          </div>

          {/* Kategoriya filtri */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary-600" />
              Baho kategoriyasi
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => setSelectedCategory('hammasi')}
                className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                  selectedCategory === 'hammasi'
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-400'
                }`}
              >
                <div className="text-lg mb-1">📚</div>
                <div className="text-sm">Hammasi</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {studentsWithStats.length} ta
                </div>
              </button>
              <button
                onClick={() => setSelectedCategory('alo')}
                className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                  selectedCategory === 'alo'
                    ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-green-400'
                }`}
              >
                <div className="text-lg mb-1">🌟</div>
                <div className="text-sm">A'lo</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {studentsWithStats.filter(s => s.average >= 4.5).length} ta
                </div>
              </button>
              <button
                onClick={() => setSelectedCategory('yaxshi')}
                className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                  selectedCategory === 'yaxshi'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400'
                }`}
              >
                <div className="text-lg mb-1">👍</div>
                <div className="text-sm">Yaxshi</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {studentsWithStats.filter(s => s.average >= 3.5 && s.average < 4.5).length} ta
                </div>
              </button>
              <button
                onClick={() => setSelectedCategory('qoniqarli')}
                className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                  selectedCategory === 'qoniqarli'
                    ? 'border-amber-600 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-amber-400'
                }`}
              >
                <div className="text-lg mb-1">💪</div>
                <div className="text-sm">Qoniqarli</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {studentsWithStats.filter(s => s.average < 3.5).length} ta
                </div>
              </button>
            </div>
          </div>

          {/* O'quvchilar ro'yxati */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-primary-600" />
                O'quvchilar ro'yxati
              </h3>
              <button
                onClick={toggleSelectAll}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                {filteredStudents.every(s => s.selected) ? 'Barchasini bekor qilish' : 'Barchasini tanlash'}
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredStudents.map((item) => (
                <label
                  key={item.student.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    item.selected
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => toggleStudent(item.student.id)}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {item.student.first_name} {item.student.last_name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {item.student.email}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {item.average.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {item.percentage.toFixed(1)}%
                    </div>
                    <div className={`text-xs font-medium mt-1 ${
                      item.average >= 4.5 ? 'text-green-600 dark:text-green-400' :
                      item.average >= 3.5 ? 'text-blue-600 dark:text-blue-400' :
                      'text-amber-600 dark:text-amber-400'
                    }`}>
                      {item.category}
                    </div>
                  </div>
                </label>
              ))}
              {filteredStudents.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Bu kategoriyada o'quvchi yo'q
                </div>
              )}
            </div>
          </div>

          {/* Yuborish tugmasi */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            {sending && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
                  <span>Yuborilmoqda: {sentCount}/{selectedCount}</span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleSendSelected}
              disabled={sending || selectedCount === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Yuborilmoqda... ({sentCount}/{selectedCount})
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Tanlanganlarga yuborish ({selectedCount} ta)
                </>
              )}
            </button>

            {!emailConfig.serviceId && (
              <p className="mt-4 text-sm text-amber-600 dark:text-amber-400 text-center">
                ⚠️ Email yuborish uchun avval Gmail sozlamalarini kiriting
              </p>
            )}
          </div>

          {/* Email namunasi */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              📧 Email namunasi:
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line font-mono">
{`Hurmatli [Ism] [Familiya],

[Oy] [Yil] oyi hisoboti:

📊 O'rtacha ball: 4.75/5.00
📈 Foiz: 95.0% (100 dan)
📝 Baholar soni: 12
🎯 Eng yuqori ball: 5

🌟 Ajoyib natija! Siz a'lo o'quvchisiz! Davom eting!

Hurmat bilan,
Bukhari Academy
bukhariacademy256@gmail.com`}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
