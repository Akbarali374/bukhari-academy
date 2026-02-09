import { useEffect, useState } from 'react'
import { getStudents, getGradesByStudent, getGroups } from '@/lib/data'
import type { Profile, Group } from '@/types'
import { TrendingUp, Users, Award, BarChart3 } from 'lucide-react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

interface StudentStats {
  student: Profile
  average: number
  gradesCount: number
  rank: number
}

interface GroupStats {
  group: Group
  average: number
  studentsCount: number
  rank: number
}

export default function AdminStatistics() {
  const [students, setStudents] = useState<Profile[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [studentStats, setStudentStats] = useState<StudentStats[]>([])
  const [groupStats, setGroupStats] = useState<GroupStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStatistics()
  }, [])

  async function loadStatistics() {
    setLoading(true)
    
    // O'quvchilar statistikasi
    const allStudents = await getStudents()
    const stats: StudentStats[] = []
    
    for (const student of allStudents) {
      const grades = await getGradesByStudent(student.id)
      const average = grades.length 
        ? grades.reduce((sum, g) => sum + g.grade_value + g.bonus, 0) / grades.length 
        : 0
      
      stats.push({
        student,
        average,
        gradesCount: grades.length,
        rank: 0
      })
    }
    
    // Reyting bo'yicha saralash
    stats.sort((a, b) => b.average - a.average)
    stats.forEach((s, i) => s.rank = i + 1)
    
    setStudents(allStudents)
    setStudentStats(stats)
    
    // Guruhlar statistikasi
    const allGroups = await getGroups()
    const gStats: GroupStats[] = []
    
    for (const group of allGroups) {
      const groupStudents = allStudents.filter(s => s.group_id === group.id)
      let totalAverage = 0
      
      for (const student of groupStudents) {
        const grades = await getGradesByStudent(student.id)
        const avg = grades.length 
          ? grades.reduce((sum, g) => sum + g.grade_value + g.bonus, 0) / grades.length 
          : 0
        totalAverage += avg
      }
      
      const groupAverage = groupStudents.length ? totalAverage / groupStudents.length : 0
      
      gStats.push({
        group,
        average: groupAverage,
        studentsCount: groupStudents.length,
        rank: 0
      })
    }
    
    // Reyting bo'yicha saralash
    gStats.sort((a, b) => b.average - a.average)
    gStats.forEach((g, i) => g.rank = i + 1)
    
    setGroups(allGroups)
    setGroupStats(gStats)
    setLoading(false)
  }

  // Top 10 o'quvchilar uchun grafik
  const top10Students = studentStats.slice(0, 10)
  const studentChartData = {
    labels: top10Students.map(s => `${s.student.first_name} ${s.student.last_name}`),
    datasets: [{
      label: 'O\'rtacha ball',
      data: top10Students.map(s => s.average.toFixed(2)),
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1
    }]
  }

  // Guruhlar uchun grafik
  const groupChartData = {
    labels: groupStats.map(g => g.group.name),
    datasets: [{
      label: 'O\'rtacha ball',
      data: groupStats.map(g => g.average.toFixed(2)),
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(153, 102, 255, 0.5)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
      ],
      borderWidth: 1
    }]
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-primary-600" />
          Statistika va Reyting
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          O'quvchilar va guruhlar reytingi
        </p>
      </div>

      {/* Umumiy statistika */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Jami o'quvchilar</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">{students.length}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900 dark:text-green-100">Jami guruhlar</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{groups.length}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900 dark:text-yellow-100">O'rtacha ball</span>
          </div>
          <p className="text-3xl font-bold text-yellow-600">
            {studentStats.length ? (studentStats.reduce((sum, s) => sum + s.average, 0) / studentStats.length).toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      {/* Grafiklar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top 10 o'quvchilar grafigi */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top 10 O'quvchilar
          </h2>
          <Bar data={studentChartData} options={{ responsive: true, maintainAspectRatio: true }} />
        </div>

        {/* Guruhlar grafigi */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Guruhlar reytingi
          </h2>
          <Pie data={groupChartData} options={{ responsive: true, maintainAspectRatio: true }} />
        </div>
      </div>

      {/* O'quvchilar reytingi jadvali */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            O'quvchilar reytingi
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Reyting</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">O'quvchi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">O'rtacha ball</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Baholar soni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {studentStats.map((stat) => (
                <tr key={stat.student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {stat.rank <= 3 && (
                        <Award className={`w-5 h-5 ${
                          stat.rank === 1 ? 'text-yellow-500' :
                          stat.rank === 2 ? 'text-gray-400' :
                          'text-orange-600'
                        }`} />
                      )}
                      <span className="font-semibold text-gray-900 dark:text-white">#{stat.rank}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {stat.student.first_name} {stat.student.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-bold text-primary-600">{stat.average.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {stat.gradesCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guruhlar reytingi jadvali */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-600" />
            Guruhlar reytingi
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Reyting</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Guruh</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">O'rtacha ball</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">O'quvchilar soni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {groupStats.map((stat) => (
                <tr key={stat.group.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {stat.rank <= 3 && (
                        <Award className={`w-5 h-5 ${
                          stat.rank === 1 ? 'text-yellow-500' :
                          stat.rank === 2 ? 'text-gray-400' :
                          'text-orange-600'
                        }`} />
                      )}
                      <span className="font-semibold text-gray-900 dark:text-white">#{stat.rank}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {stat.group.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-bold text-primary-600">{stat.average.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {stat.studentsCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
