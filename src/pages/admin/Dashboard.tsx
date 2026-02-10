import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, FolderKanban, GraduationCap, Mail, 
  Newspaper, DollarSign, BarChart3, FileText,
  Settings, Database, Bot, Calendar
} from 'lucide-react'
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

  const mainCards = [
    { 
      title: 'Ustozlar', 
      value: teachersCount, 
      icon: Users, 
      to: '/admin/teachers', 
      gradient: 'from-blue-500 to-blue-600',
      description: 'Ustozlar ro\'yxati'
    },
    { 
      title: 'Guruhlar', 
      value: groupsCount, 
      icon: FolderKanban, 
      to: '/admin/groups', 
      gradient: 'from-green-500 to-green-600',
      description: 'Guruhlar boshqaruvi'
    },
    { 
      title: "O'quvchilar", 
      value: studentsCount, 
      icon: GraduationCap, 
      to: '/admin/students', 
      gradient: 'from-amber-500 to-amber-600',
      description: 'O\'quvchilar ro\'yxati'
    },
    { 
      title: 'To\'lovlar', 
      value: '—', 
      icon: DollarSign, 
      to: '/admin/payments', 
      gradient: 'from-emerald-500 to-emerald-600',
      description: 'Oylik to\'lovlar'
    },
  ]

  const quickLinks = [
    { title: 'Yangiliklar', icon: Newspaper, to: '/admin/news', color: 'text-blue-600 dark:text-blue-400' },
    { title: 'Statistika', icon: BarChart3, to: '/admin/statistics', color: 'text-purple-600 dark:text-purple-400' },
    { title: 'Oylik hisobotlar', icon: Mail, to: '/admin/monthly-reports', color: 'text-pink-600 dark:text-pink-400' },
    { title: 'Login yaratish', icon: FileText, to: '/admin/create-login', color: 'text-indigo-600 dark:text-indigo-400' },
    { title: 'Ma\'lumot ulashish', icon: Database, to: '/admin/data-sync', color: 'text-cyan-600 dark:text-cyan-400' },
    { title: 'Doimiy saqlash', icon: Settings, to: '/admin/persistent-storage', color: 'text-teal-600 dark:text-teal-400' },
    { title: 'AI Sozlamalari', icon: Bot, to: '/admin/ai-settings', color: 'text-violet-600 dark:text-violet-400' },
    { title: 'Davomat', icon: Calendar, to: '/admin/attendance', color: 'text-orange-600 dark:text-orange-400' },
  ]

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="animate-fadeIn">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Boshqaruv paneli
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Bukhari Academy - Admin panel
        </p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slideIn">
        {mainCards.map(({ title, value, icon: Icon, to, gradient, description }) => (
          <Link
            key={to}
            to={to}
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 hover:border-transparent dark:hover:border-transparent shadow-sm hover:shadow-xl dark:hover:shadow-dark-xl transition-all duration-300"
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-300`} />
            
            {/* Content */}
            <div className="relative p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {value}
                  </p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="animate-fadeIn">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Tezkor havolalar
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {quickLinks.map(({ title, icon: Icon, to, color }) => (
            <Link
              key={to}
              to={to}
              className="group flex flex-col items-center gap-3 p-4 rounded-xl bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-lg dark:hover:shadow-dark-lg transition-all duration-200"
            >
              <div className={`p-3 rounded-lg bg-gray-100 dark:bg-dark-800 group-hover:scale-110 transition-transform duration-200`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
                {title}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Info Card */}
      <div className="card p-6 animate-scaleIn">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/40">
            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              💡 Maslahat
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Ma'lumotlarni butun umrga saqlash uchun <Link to="/admin/persistent-storage" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Doimiy saqlash</Link> sahifasidan GitHub Gist'ni sozlang. Bu eng ishonchli saqlash usuli!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
