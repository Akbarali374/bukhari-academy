import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, FolderKanban, GraduationCap, Mail } from 'lucide-react'
import { getGroupsWithTeacher, getTeachers, getStudents } from '@/lib/data'

export default function AdminDashboard() {
  const [teachersCount, setTeachersCount] = useState(0)
  const [groupsCount, setGroupsCount] = useState(0)
  const [studentsCount, setStudentsCount] = useState(0)

  useEffect(() => {
    getTeachers().then((t) => setTeachersCount(t.length))
    getGroupsWithTeacher().then((g) => setGroupsCount(g.length))
    getStudents().then((s) => setStudentsCount(s.length))
  }, [])

  const cards = [
    { title: 'Ustozlar', value: teachersCount, icon: Users, to: '/admin/teachers', iconClass: 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400' },
    { title: 'Guruhlar', value: groupsCount, icon: FolderKanban, to: '/admin/groups', iconClass: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' },
    { title: "O'quvchilar", value: studentsCount, icon: GraduationCap, to: '/admin/students', iconClass: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' },
    { title: 'Oylik hisobotlar', value: '—', icon: Mail, to: '/admin/monthly-reports', iconClass: 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Boshqaruv paneli</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ title, value, icon: Icon, to, iconClass }) => (
          <Link
            key={to}
            to={to}
            className="block p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-500 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${iconClass}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
