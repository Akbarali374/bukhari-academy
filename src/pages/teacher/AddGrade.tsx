import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getProfiles, addGrade, getGradesByStudent, deleteGrade } from '@/lib/data'
import type { Profile, Grade } from '@/types'
import { ArrowLeft, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TeacherAddGrade() {
  const { user } = useAuth()
  const { studentId } = useParams<{ studentId: string }>()
  const [student, setStudent] = useState<Profile | null>(null)
  const [grades, setGrades] = useState<Grade[]>([])
  const [gradeValue, setGradeValue] = useState(50)
  const [bonus, setBonus] = useState(0)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleteModal, setDeleteModal] = useState<Grade | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!studentId) return
    loadData()
  }, [studentId])

  async function loadData() {
    if (!studentId) return
    const [profilesData, gradesData] = await Promise.all([
      getProfiles(),
      getGradesByStudent(studentId)
    ])
    setStudent(profilesData.find((x) => x.id === studentId) ?? null)
    setGrades(gradesData)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user?.id || !studentId) return
    if (gradeValue < 1 || gradeValue > 100) {
      toast.error('Baho 1–100 orasida bolishi kerak')
      return
    }
    setSubmitting(true)
    try {
      await addGrade(studentId, user.id, gradeValue, bonus, note.trim() || null)
      toast.success('Baho qoshildi')
      setGradeValue(50)
      setBonus(0)
      setNote('')
      loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xatolik')
    }
    setSubmitting(false)
  }

  async function handleDelete() {
    if (!deleteModal) return
    
    setDeleting(true)
    try {
      await deleteGrade(deleteModal.id)
      toast.success('Baho o\'chirildi!', {
        icon: '✅',
        style: {
          background: '#10b981',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 'bold'
        }
      })
      setDeleteModal(null)
      loadData()
    } catch (error) {
      console.error('O\'chirishda xato:', error)
      toast.error('O\'chirishda xato yuz berdi')
    } finally {
      setDeleting(false)
    }
  }

  if (!student) return (
    <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" /></div>
  )

  return (
    <div>
      <Link to="/teacher" className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Guruhlar
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Baho qoshish</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">{student.last_name} {student.first_name} — {student.email}</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Baho qo'shish formasi */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Yangi baho</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Baho (1–100)</label>
              <input type="number" min={1} max={100} value={gradeValue} onChange={(e) => setGradeValue(Number(e.target.value))} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bonus</label>
              <input type="number" min={0} value={bonus} onChange={(e) => setBonus(Number(e.target.value))} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Izoh (ixtiyoriy)</label>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Izoh" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <button type="submit" disabled={submitting} className="w-full py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium disabled:opacity-50">
              {submitting ? 'Saqlanmoqda...' : 'Baho qoshish'}
            </button>
          </form>
        </div>

        {/* Baholar ro'yxati */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Baholar tarixi</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {grades.map((g) => (
              <div key={g.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{g.grade_value}</span>
                    {g.bonus > 0 && (
                      <span className="text-sm font-medium text-amber-600 dark:text-amber-400">+{g.bonus}</span>
                    )}
                  </div>
                  {g.note && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{g.note}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(g.created_at).toLocaleDateString('uz-UZ')}
                  </p>
                </div>
                <button
                  onClick={() => setDeleteModal(g)}
                  className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="O'chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {grades.length === 0 && (
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">Hali baholar yo'q</p>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Bahoni o'chirish</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              <strong>Baho: {deleteModal.grade_value}</strong> {deleteModal.bonus > 0 && `(+${deleteModal.bonus} bonus)`}
            </p>
            {deleteModal.note && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Izoh: {deleteModal.note}
              </p>
            )}
            <p className="text-sm text-red-600 dark:text-red-400 mb-6">
              ⚠️ Bu amalni bekor qilib bo'lmaydi!
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    O'chirilmoqda...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    O'chirish
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
