import { useEffect, useState } from 'react'
import { getStudents } from '@/lib/data'
import type { Profile, Payment } from '@/types'
import { DollarSign, CheckCircle, XCircle, AlertCircle, Calendar, Plus, Edit, Trash2, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminPayments() {
  const [students, setStudents] = useState<Profile[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null)
  const [paymentAmount, setPaymentAmount] = useState(500000)
  const [paidAmount, setPaidAmount] = useState(0)
  const [paymentNote, setPaymentNote] = useState('')
  
  // Oyning 15-kunigacha to'lash kerakligini tekshirish
  const isPaymentDeadlineNear = () => {
    const today = new Date()
    const dayOfMonth = today.getDate()
    return dayOfMonth >= 1 && dayOfMonth <= 15
  }
  
  const daysUntilDeadline = () => {
    const today = new Date()
    const dayOfMonth = today.getDate()
    if (dayOfMonth <= 15) {
      return 15 - dayOfMonth
    }
    return 0
  }

  useEffect(() => {
    loadData()
    // Joriy oy
    const now = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    setSelectedMonth(month)
  }, [])

  async function loadData() {
    setLoading(true)
    const allStudents = await getStudents()
    setStudents(allStudents)
    
    // localStorage'dan to'lovlarni yuklash
    const stored = localStorage.getItem('bukhari_payments')
    if (stored) {
      try {
        setPayments(JSON.parse(stored))
      } catch (error) {
        console.error('To\'lovlarni yuklashda xato:', error)
      }
    }
    
    setLoading(false)
  }

  const savePayments = (newPayments: Payment[]) => {
    setPayments(newPayments)
    localStorage.setItem('bukhari_payments', JSON.stringify(newPayments))
  }

  const monthName = (month: string) => {
    const [year, m] = month.split('-')
    const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr']
    return `${months[parseInt(m) - 1]} ${year}`
  }

  const getPaymentForStudent = (studentId: string, month: string): Payment | undefined => {
    return payments.find(p => p.student_id === studentId && p.month === month)
  }

  const openPaymentModal = (student: Profile) => {
    setSelectedStudent(student)
    const existingPayment = getPaymentForStudent(student.id, selectedMonth)
    if (existingPayment) {
      setPaymentAmount(existingPayment.amount)
      setPaidAmount(existingPayment.paid_amount)
      setPaymentNote(existingPayment.note || '')
    } else {
      setPaymentAmount(500000)
      setPaidAmount(0)
      setPaymentNote('')
    }
    setShowPaymentModal(true)
  }

  const savePayment = () => {
    if (!selectedStudent) return

    const existingPayment = getPaymentForStudent(selectedStudent.id, selectedMonth)
    const status: 'to\'landi' | 'to\'lanmadi' | 'qisman' = 
      paidAmount >= paymentAmount ? 'to\'landi' :
      paidAmount > 0 ? 'qisman' : 'to\'lanmadi'

    const payment: Payment = {
      id: existingPayment?.id || `payment-${Date.now()}`,
      student_id: selectedStudent.id,
      amount: paymentAmount,
      month: selectedMonth,
      status,
      paid_amount: paidAmount,
      payment_date: paidAmount > 0 ? new Date().toISOString() : null,
      note: paymentNote || null,
      created_at: existingPayment?.created_at || new Date().toISOString(),
      student: selectedStudent
    }

    const newPayments = existingPayment
      ? payments.map(p => p.id === payment.id ? payment : p)
      : [...payments, payment]

    savePayments(newPayments)
    setShowPaymentModal(false)
    toast.success('To\'lov saqlandi!', { icon: '💰' })
  }

  const deletePayment = (paymentId: string) => {
    if (!confirm('To\'lovni o\'chirmoqchimisiz?')) return
    const newPayments = payments.filter(p => p.id !== paymentId)
    savePayments(newPayments)
    toast.success('To\'lov o\'chirildi!')
  }

  const sendPaymentReminder = async (student: Profile) => {
    // EmailJS config
    const emailConfig = localStorage.getItem('emailjs_config')
    if (!emailConfig) {
      toast.error('EmailJS sozlanmagan! Avval "Oylik hisobotlar" sahifasida sozlang.')
      return
    }

    try {
      const config = JSON.parse(emailConfig)
      const payment = getPaymentForStudent(student.id, selectedMonth)
      const amount = payment?.amount || 500000
      const paidAmount = payment?.paid_amount || 0
      const remaining = amount - paidAmount

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: config.serviceId,
          template_id: config.templateId,
          user_id: config.publicKey,
          template_params: {
            to_email: student.email,
            to_name: `${student.first_name} ${student.last_name}`,
            from_name: 'Bukhari Academy',
            subject: `To'lov eslatmasi - ${monthName(selectedMonth)}`,
            message: `Hurmatli ${student.first_name} ${student.last_name},

${monthName(selectedMonth)} oyi uchun to'lovingiz haqida eslatma.

💰 To'lov summasi: ${amount.toLocaleString()} so'm
✅ To'langan: ${paidAmount.toLocaleString()} so'm
❌ Qolgan: ${remaining.toLocaleString()} so'm

Iltimos, to'lovni amalga oshiring.

Hurmat bilan,
Bukhari Academy`
          }
        })
      })

      if (response.ok) {
        toast.success(`Email yuborildi: ${student.email}`, { icon: '📧', duration: 5000 })
      } else {
        toast.error('Email yuborishda xato')
      }
    } catch (error) {
      toast.error('Email yuborishda xato')
      console.error(error)
    }
  }

  const sendReminderToAll = async () => {
    if (!confirm('Barcha qarzdorlarga email yuborilsinmi?')) return

    const unpaidStudents = students.filter(student => {
      const payment = getPaymentForStudent(student.id, selectedMonth)
      return !payment || payment.status !== 'to\'landi'
    })

    if (unpaidStudents.length === 0) {
      toast.error('Qarzdor o\'quvchilar yo\'q!')
      return
    }

    toast.loading(`${unpaidStudents.length} ta o'quvchiga email yuborilmoqda...`)

    for (const student of unpaidStudents) {
      await sendPaymentReminder(student)
      await new Promise(resolve => setTimeout(resolve, 1000)) // 1 soniya kutish
    }

    toast.success(`${unpaidStudents.length} ta email yuborildi!`, { icon: '✅', duration: 5000 })
  }

  // Statistika
  const monthPayments = payments.filter(p => p.month === selectedMonth)
  const paidCount = monthPayments.filter(p => p.status === 'to\'landi').length
  const unpaidCount = students.length - monthPayments.filter(p => p.status === 'to\'landi' || p.status === 'qisman').length
  const partialCount = monthPayments.filter(p => p.status === 'qisman').length
  const totalAmount = monthPayments.reduce((sum, p) => sum + p.paid_amount, 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <DollarSign className="w-7 h-7 text-green-600" />
          To'lovlar
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          O'quvchilarning oylik to'lovlarini boshqarish
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* To'lov muddati eslatmasi */}
          {isPaymentDeadlineNear() && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400 dark:border-amber-600 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-2">
                    ⏰ To'lov muddati eslatmasi
                  </h3>
                  <p className="text-amber-800 dark:text-amber-200 mb-3">
                    Oylik to'lovlarni har oyning <span className="font-bold text-xl">15-kunigacha</span> to'lashingizni so'raymiz!
                  </p>
                  {daysUntilDeadline() > 0 ? (
                    <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                      📅 Muddat tugashiga <span className="font-bold text-lg">{daysUntilDeadline()}</span> kun qoldi
                    </p>
                  ) : (
                    <p className="text-sm text-red-700 dark:text-red-300 font-bold">
                      ⚠️ Bugun to'lov muddatining oxirgi kuni!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Oy tanlash */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Oy tanlash</h2>
              </div>
              <button
                onClick={sendReminderToAll}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Mail className="w-4 h-4" />
                Barcha qarzdorlarga email
              </button>
            </div>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Tanlangan: {monthName(selectedMonth)}
            </p>
          </div>

          {/* Statistika */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900 dark:text-green-100">To'landi</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{paidCount}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-900 dark:text-red-100">To'lanmadi</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{unpaidCount}</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-amber-900 dark:text-amber-100">Qisman</span>
              </div>
              <p className="text-2xl font-bold text-amber-600">{partialCount}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Jami</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{totalAmount.toLocaleString()} so'm</p>
            </div>
          </div>

          {/* O'quvchilar ro'yxati */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                O'quvchilar ({students.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">O'quvchi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Summa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">To'langan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Holat</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {students.map((student) => {
                    const payment = getPaymentForStudent(student.id, selectedMonth)
                    const status = payment?.status || 'to\'lanmadi'
                    const amount = payment?.amount || 500000
                    const paidAmount = payment?.paid_amount || 0

                    return (
                      <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {student.first_name} {student.last_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{student.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {amount.toLocaleString()} so'm
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {paidAmount.toLocaleString()} so'm
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            status === 'to\'landi' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                            status === 'qisman' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                            {status === 'to\'landi' ? 'To\'landi' : status === 'qisman' ? 'Qisman' : 'To\'lanmadi'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openPaymentModal(student)}
                              className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                            >
                              {payment ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                              {payment ? 'Tahrirlash' : 'To\'lov qilish'}
                            </button>
                            {payment && (
                              <button
                                onClick={() => deletePayment(payment.id)}
                                className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                            {(!payment || payment.status !== 'to\'landi') && (
                              <button
                                onClick={() => sendPaymentReminder(student)}
                                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                title="Email eslatma yuborish"
                              >
                                <Mail className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* To'lov modali */}
      {showPaymentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              To'lov qilish
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  O'quvchi
                </label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Oy
                </label>
                <p className="text-gray-900 dark:text-white">{monthName(selectedMonth)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  To'lov summasi
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseInt(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  To'langan summa
                </label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(parseInt(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Izoh (ixtiyoriy)
                </label>
                <textarea
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Izoh yozing..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={savePayment}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Saqlash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
