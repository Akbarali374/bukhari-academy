import { Link, useLocation } from 'react-router-dom'
import { 
  Home, Users, FolderKanban, GraduationCap, 
  Newspaper, Settings, BookOpen, Calendar,
  BarChart3, DollarSign
} from 'lucide-react'

interface NavItem {
  to: string
  icon: any
  label: string
  roles: ('admin' | 'teacher' | 'student')[]
}

const navItems: NavItem[] = [
  // Admin
  { to: '/admin/dashboard', icon: Home, label: 'Bosh sahifa', roles: ['admin'] },
  { to: '/admin/students', icon: GraduationCap, label: 'O\'quvchilar', roles: ['admin'] },
  { to: '/admin/groups', icon: FolderKanban, label: 'Guruhlar', roles: ['admin'] },
  { to: '/admin/statistics', icon: BarChart3, label: 'Statistika', roles: ['admin'] },
  { to: '/admin/payments', icon: DollarSign, label: 'To\'lovlar', roles: ['admin'] },
  
  // Teacher
  { to: '/teacher/groups', icon: FolderKanban, label: 'Guruhlar', roles: ['teacher'] },
  { to: '/teacher/students', icon: GraduationCap, label: 'O\'quvchilar', roles: ['teacher'] },
  { to: '/teacher/attendance', icon: Calendar, label: 'Davomat', roles: ['teacher'] },
  { to: '/teacher/homework', icon: BookOpen, label: 'Vazifalar', roles: ['teacher'] },
  
  // Student
  { to: '/student/news', icon: Newspaper, label: 'Yangiliklar', roles: ['student'] },
  { to: '/student/grades', icon: BarChart3, label: 'Baholar', roles: ['student'] },
  { to: '/student/homework', icon: BookOpen, label: 'Vazifalar', roles: ['student'] },
  { to: '/student/tests', icon: Settings, label: 'Testlar', roles: ['student'] },
]

interface BottomNavProps {
  role: 'admin' | 'teacher' | 'student'
}

export default function BottomNav({ role }: BottomNavProps) {
  const location = useLocation()
  
  // Faqat shu rol uchun kerakli itemlarni filtrlash
  const items = navItems.filter(item => item.roles.includes(role)).slice(0, 5)
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-dark-900 border-t border-gray-200 dark:border-dark-700 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || location.pathname.startsWith(to + '/')
          
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
