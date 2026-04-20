import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getExamsByStudent } from '@/lib/data'
import type { Exam } from '@/types'
import { ClipboardList, Trophy, Star, CheckCircle, XCircle, TrendingUp } from 'lucide-react'

const gradeInfo = {
  alo:        { label: "A'lo",       color: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',  border: 'border-green-200 dark:border-green-800', icon: '🏆', iconComp: Trophy },
  yaxshi:     { label: 'Yaxshi',     color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',      border: 'border-blue-200 dark:border-blue-800',   icon: '⭐', iconComp: Star },
  qoniqarli:  { label: 'Qoniqarli',  color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800', icon: '✅', iconComp: CheckCircle },
  qoniqarsiz: { label: 'Qoniqarsiz', color: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',         border: 'border-red-200 dark:border-red-800',     icon: '❌', iconComp: XCircle },
}

export default function StudentExams() {
  const { user } = useAuth()
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    getExamsByStudent(user.id).then(setExams).finally(() => setLoading(false))
  }, [user?.id])

  const avgPercent = exams.length
    ? Math.round(exams.reduce((sum, e) => sum + (e.score / e.max_score) * 100, 0) / exams.length)
    : 0

  const aloCount = exams.filter(e => e.grade === 'alo').length
  const yaxshiCount = exams.filter(e => e.grade === 'yaxshi').length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <ClipboardList className="w-7 h-7 text-primary-600 dark:text-primary-400" />
          Imtihon natijalari
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Oylik imtihon natijalaringiz</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">Hali imtihon natijalari yo'q</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Ustoz natijalarni yuborganda bu yerda ko'rinadi</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/40">
                  <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">O'rtacha natija</p>
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{avgPercent}%</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/40">
                  <span className="text-xl">🏆</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">A'lo natijalar</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{aloCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                  <span className="text-xl">⭐</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Jami imtihonlar</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{exams.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Exams list */}
          <div className="space-y-4">
            {exams.map((exam) => {
              const info = gradeInfo[exam.grade]
              const percent = Math.round((exam.score / exam.max_score) * 100)
              return (
                <div
                  key={exam.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl border-2 ${info.border} overflow-hidden`}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{info.icon}</span>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{exam.title}</h3>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{exam.month} {exam.year}</p>
                      </div>
                      <span className={`px-3 py-1.5 rounded-xl text-sm font-bold ${info.color}`}>
                        {info.label}
                      </span>
                    </div>

                    {/* Score bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-300">Ball: <strong>{exam.score}</strong> / {exam.max_score}</span>
                        <span className="font-bold text-gray-900 dark:text-white">{percent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            exam.grade === 'alo' ? 'bg-green-500' :
                            exam.grade === 'yaxshi' ? 'bg-blue-500' :
                            exam.grade === 'qoniqarli' ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Grade scale */}
                    <div className="flex gap-2 text-xs mb-3">
                      <span className="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">86-100% A'lo</span>
                      <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">71-85% Yaxshi</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">56-70% Qoniqarli</span>
                      <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">0-55% Qoniqarsiz</span>
                    </div>

                    {exam.comment && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Ustoz izohi: </span>{exam.comment}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}