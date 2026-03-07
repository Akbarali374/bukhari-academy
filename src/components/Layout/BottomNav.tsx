import { Link, useLocation } from 'react-router-dom'
import { 
  Home, FolderKanban, GraduationCap, 
  Newspaper, BookOpen, Calendar,
  BarChart3, DollarSign
} from 'lucide-react'

interface NavItem {
  to: string
  icon: any
  label: string
  roles: ('admin' | 'teacher' | 'student')[]
}

const navItems: NavItem[] = [
  // Admin - faqat 4 ta
  { to: '/admin', icon: Home, label: 'Bosh', roles: ['admin'] },
  { to: '/admin/students', icon: GraduationCap, label: 'O\'quvchi', roles: ['admin'] },
  { to: '/admin/statistics', icon: BarChart3, label: 'Statistika', roles: ['admin'] },
  { to: '/admin/payments', icon: DollarSign, label: 'To\'lov', roles: ['admin'] },
  
  // Teacher - faqat 4 ta
  { to: '/teacher', icon: FolderKanban, label: 'Guruh', roles: ['teacher'] },
  { to: '/teacher/students', icon: GraduationCap, label: 'O\'quvchi', roles: ['teacher'] },
  { to: '/teacher/attendance', icon: Calendar, label: 'Davomat', roles: ['teacher'] },
  { to: '/teacher/homework', icon: BookOpen, label: 'Vazifa', roles: ['teacher'] },
  
  // Student - faqat 4 ta
  { to: '/student/news', icon: Newspaper, label: 'Yangilik', roles: ['student'] },
  { to: '/student/grades', icon: BarChart3, label: 'Baho', roles: ['student'] },
  { to: '/student/homework', icon: BookOpen, label: 'Vazifa', roles: ['student'] },
  { to: '/student/tests', icon: Calendar, label: 'Testlar', roles: ['student'] },
]

interface BottomNavProps {
  role: 'admin' | 'teacher' | 'student'
}

export default function BottomNav({ role }: BottomNavProps) {
  const location = useLocation()
  
  // Faqat shu rol uchun kerakli itemlarni filtrlash - faqat 4 ta
  const items = navItems.filter(item => item.roles.includes(role)).slice(0, 4)
  
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
