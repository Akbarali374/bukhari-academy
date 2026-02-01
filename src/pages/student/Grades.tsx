import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getGradesByStudent, subscribeGrades } from '@/lib/data'
import type { Grade } from '@/types'
import { Award } from 'lucide-react'

export default function StudentGrades() {
  const { user } = useAuth()
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    if (!user?.id) return
    getGradesByStudent(user.id).then((g) => {
      setGrades(g)
      setLoading(false)
    })
  }

  useEffect(() => {
    load()
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return
    const unsub = subscribeGrades(user.id, (newGrade) => {
      setGrades((prev) => [newGrade, ...prev])
    })
    return unsub
  }, [user?.id])

  if (!user) return null

  const totalBonus = grades.reduce((sum, g) => sum + g.bonus, 0)
  const avgGrade = grades.length ? grades.reduce((sum, g) => sum + g.grade_value, 0) / grades.length : 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Baholar va qoshimcha bonuslar</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Ustoz qoygan baholar va bonuslar shu yerda ko'rinadi. Yangi baho tez yetib boradi.</p>
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Ortacha baho</p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{avgGrade.toFixed(1)}</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Jami bonus</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{totalBonus}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Baho (1–100)</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Bonus</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Izoh</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Sana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {grades.map((g) => (
                    <tr key={g.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{g.grade_value}</td>
                      <td className="px-4 py-3 text-amber-600 dark:text-amber-400">{g.bonus}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{g.note ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">{new Date(g.created_at).toLocaleDateString('uz-UZ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {grades.map((g) => (
                <div key={g.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {g.grade_value}
                      </div>
                      {g.bonus > 0 && (
                        <div className="px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 text-sm font-medium">
                          +{g.bonus} bonus
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(g.created_at).toLocaleDateString('uz-UZ')}
                    </div>
                  </div>
                  {g.note && (
                    <div className="text-gray-600 dark:text-gray-300 text-sm">
                      {g.note}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {grades.length === 0 && (
              <p className="text-center py-8 text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                <Award className="w-5 h-5" /> Hali baholar yoq
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
