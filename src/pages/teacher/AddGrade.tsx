import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getProfiles, addGrade } from '@/lib/data'
import type { Profile } from '@/types'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TeacherAddGrade() {
  const { user } = useAuth()
  const { studentId } = useParams<{ studentId: string }>()
  const [student, setStudent] = useState<Profile | null>(null)
  const [gradeValue, setGradeValue] = useState(50)
  const [bonus, setBonus] = useState(0)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!studentId) return
    getProfiles().then((p) => setStudent(p.find((x) => x.id === studentId) ?? null))
  }, [studentId])

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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xatolik')
    }
    setSubmitting(false)
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
      <div className="max-w-md bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
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
    </div>
  )
}
