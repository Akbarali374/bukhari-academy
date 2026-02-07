import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getStudentsByGroup, markAttendance, getAttendanceByDate } from '@/lib/data'
import { useAuth } from '@/context/AuthContext'
import type { Profile, Attendance } from '@/types'
import { CheckCircle, XCircle, Calendar, ArrowLeft, Users } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TeacherAttendance() {
  const { groupId } = useParams<{ groupId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [students, setStudents] = useState<Profile[]>([])
  const [attendance, setAttendance] = useState<Record<string, 'keldi' | 'kelmadi'>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    if (!groupId) return
    loadData()
  }, [groupId, selectedDate])

  async function loadData() {
    if (!groupId) return
    setLoading(true)
    
    try {
      const [studentsData, attendanceData] = await Promise.all([
        getStudentsByGroup(groupId),
        getAttendanceByDate(selectedDate)
      ])
      
      setStudents(studentsData)
      
      // Mavjud davomatni yuklash
      const attendanceMap: Record<string, 'keldi' | 'kelmadi'> = {}
      attendanceData.forEach(a => {
        attendanceMap[a.student_id] = a.status
      })
      setAttendance(attendanceMap)
    } catch (error) {
      console.error('Ma\'lumotlarni yuklashda xato:', error)
      toast.error('Ma\'lumotlarni yuklashda xato')
    } finally {
      setLoading(false)
    }
  }

  function toggleAttendance(studentId: string) {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'keldi' ? 'kelmadi' : 'keldi'
    }))
  }

  async function handleSave() {
    if (!user?.id) return
    
    setSaving(true)
    try {
      // Har bir o'quvchi uchun davomatni saqlash
      await Promise.all(
        students.map(student => {
          const status = attendance[student.id] || 'kelmadi'
          return markAttendance(student.id, user.id, selectedDate, status)
        })
      )
      
      toast.success('Davomat saqlandi!', {
        icon: '✅',
        style: {
          background: '#10b981',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 'bold'
        }
      })
    } catch (error) {
      console.error('Davomatni saqlashda xato:', error)
      toast.error('Davomatni saqlashda xato')
    } finally {
      setSaving(false)
    }
  }

  const keldiCount = Object.values(attendance).filter(s => s === 'keldi').length
  const kelmadiCount = Object.values(attendance).filter(s => s === 'kelmadi').length

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/teacher/groups')}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-primary-600" />
            Davomat
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            O'quvchilarning keldi/kelmadi holatini belgilang
          </p>
        </div>
      </div>

      {/* Sana tanlash */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-primary-600" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sana
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">Statistika</div>
            <div className="flex gap-4 mt-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{keldiCount}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Keldi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{kelmadiCount}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Kelmadi</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <>
          {/* O'quvchilar ro'yxati */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {students.map((student, index) => {
                const status = attendance[student.id] || 'kelmadi'
                const isKeldi = status === 'keldi'
                
                return (
                  <div
                    key={student.id}
                    className={`p-4 flex items-center gap-4 transition-colors ${
                      isKeldi
                        ? 'bg-green-50 dark:bg-green-900/10'
                        : 'bg-red-50 dark:bg-red-900/10'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center font-bold text-primary-600 dark:text-primary-400">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {student.first_name} {student.last_name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {student.email}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleAttendance(student.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                          isKeldi
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        <CheckCircle className="w-5 h-5" />
                        Keldi
                      </button>
                      <button
                        onClick={() => toggleAttendance(student.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                          !isKeldi
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        <XCircle className="w-5 h-5" />
                        Kelmadi
                      </button>
                    </div>
                  </div>
                )
              })}
              {students.length === 0 && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  Bu guruhda o'quvchilar yo'q
                </div>
              )}
            </div>
          </div>

          {/* Saqlash tugmasi */}
          {students.length > 0 && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Davomatni saqlash
                </>
              )}
            </button>
          )}
        </>
      )}
    </div>
  )
}
