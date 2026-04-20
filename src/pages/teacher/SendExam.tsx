import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getStudentsByGroup, createExam, getExamsByTeacher, calcExamGrade, MONTHS } from '@/lib/data'
import { useAuth } from '@/context/AuthContext'
import type { Profile, Exam } from '@/types'
import { ClipboardList, Send, ArrowLeft, Trophy, Star, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const gradeInfo = {
  alo:          { label: "A'lo",        color: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',   icon: '🏆', min: 86 },
  yaxshi:       { label: 'Yaxshi',      color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',       icon: '⭐', min: 71 },
  qoniqarli:    { label: 'Qoniqarli',   color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',   icon: '✅', min: 56 },
  qoniqarsiz:   { label: 'Qoniqarsiz',  color: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',           icon: '❌', min: 0  },
}

export default function TeacherSendExam() {
  const { groupId } = useParams<{ groupId: string }>()
  const { user } = useAuth()
  const [students, setStudents] = useState<Profile[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null)
  const [sentExams, setSentExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const currentYear = new Date().getFullYear()
  const currentMonth = MONTHS[new Date().getMonth()]

  const [title, setTitle] = useState('')
  const [month, setMonth] = useState(currentMonth)
  const [year, setYear] = useState(currentYear)
  const [maxScore, setMaxScore] = useState(100)
  const [score, setScore] = useState<number | ''>('')
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (!groupId) return
    getStudentsByGroup(groupId).then(setStudents).finally(() => setLoading(false))
  }, [groupId])

  useEffect(() => {
    if (!user?.id) return
    getExamsByTeacher(user.id).then(setSentExams)
  }, [user?.id])

  const previewGrade = score !== '' ? calcExamGrade(Number(score), maxScore) : null
  const percent = score !== '' ? Math.round((Number(score) / maxScore) * 100) : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedStudent || !user?.id || score === '') return

    const grade = calcExamGrade(Number(score), maxScore)

    setSubmitting(true)
    try {
      await createExam({
        student_id: selectedStudent.id,
        teacher_id: user.id,
        title: title.trim() || `${month} oyi imtihoni`,
        month,
        year,
        max_score: maxScore,
        score: Number(score),
        grade,
        comment: comment.trim() || null,
      })
      toast.success(`${selectedStudent.last_name} ${selectedStudent.first_name}ga imtihon natijasi yuborildi!`)
      setScore('')
      setComment('')
      setTitle('')
      // Refresh
      getExamsByTeacher(user.id).then(setSentExams)
    } catch {
      toast.error('Xatolik yuz berdi')
    }
    setSubmitting(false)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link to="/teacher" className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline mb-3">
          <ArrowLeft className="w-4 h-4" /> Guruhlar
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ClipboardList className="w-7 h-7 text-primary-600 dark:text-primary-400" />
          Imtihon natijalari yuborish
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">O'quvchilarga oylik imtihon natijalarini yuboring</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students list */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">O'quvchilar</h2>
            </div>
            <div className="p-2">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent" />
                </div>
              ) : (
                <div className="space-y-1">
                  {students.map((s) => {
                    const examCount = sentExams.filter(e => e.student_id === s.id).length
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedStudent(s)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedStudent?.id === s.id
                            ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="font-medium text-sm">{s.last_name} {s.first_name}</div>
                        {examCount > 0 && (
                          <div className="text-xs text-gray-400 mt-0.5">{examCount} ta imtihon</div>
                        )}
                      </button>
                    )
                  })}
                  {students.length === 0 && (
                    <p className="text-center py-6 text-gray-400 text-sm">O'quvchilar yo'q</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {selectedStudent ? (
            <>
              {/* Send form */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                  {selectedStudent.last_name} {selectedStudent.first_name}ga imtihon natijasi yuborish
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Oy</label>
                      <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Yil</label>
                      <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Imtihon nomi <span className="text-gray-400 font-normal">(ixtiyoriy)</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={`${month} oyi imtihoni`}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maksimal ball</label>
                      <input
                        type="number"
                        value={maxScore}
                        onChange={(e) => setMaxScore(Number(e.target.value))}
                        min={1}
                        max={1000}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">O'quvchi bali</label>
                      <input
                        type="number"
                        value={score}
                        onChange={(e) => setScore(e.target.value === '' ? '' : Number(e.target.value))}
                        min={0}
                        max={maxScore}
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  {/* Preview */}
                  {previewGrade && percent !== null && (
                    <div className={`flex items-center gap-3 p-4 rounded-xl ${gradeInfo[previewGrade].color}`}>
                      <span className="text-3xl">{gradeInfo[previewGrade].icon}</span>
                      <div>
                        <div className="font-bold text-lg">{gradeInfo[previewGrade].label}</div>
                        <div className="text-sm opacity-80">{score} / {maxScore} ball — {percent}%</div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Izoh <span className="text-gray-400 font-normal">(ixtiyoriy)</span>
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="O'quvchiga izoh yozing..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || score === ''}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                    {submitting ? 'Yuborilmoqda...' : 'Natijani yuborish'}
                  </button>
                </form>
              </div>

              {/* Previous exams for this student */}
              {sentExams.filter(e => e.student_id === selectedStudent.id).length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Yuborilgan natijalar</h3>
                  <div className="space-y-3">
                    {sentExams.filter(e => e.student_id === selectedStudent.id).map(exam => (
                      <div key={exam.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white text-sm">{exam.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{exam.month} {exam.year}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{exam.score}/{exam.max_score}</span>
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${gradeInfo[exam.grade].color}`}>
                            {gradeInfo[exam.grade].icon} {gradeInfo[exam.grade].label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <ClipboardList className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">O'quvchini tanlang</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}