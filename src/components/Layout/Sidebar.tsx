import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  GraduationCap,
  Key,
  UserPlus,
  Mail,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
  RefreshCw,
  BarChart3,
  DollarSign,
  Bot,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/hooks/useTheme'

// Asosiy menyu - har kuni ishlatiladigan
const adminMainNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Boshqaruv' },
  { to: '/admin/teachers', icon: Users, label: 'Ustozlar' },
  { to: '/admin/groups', icon: FolderKanban, label: 'Guruhlar' },
  { to: '/admin/students', icon: GraduationCap, label: 'O\'quvchilar' },
  { to: '/admin/news', icon: Mail, label: 'Yangiliklar' },
  { to: '/admin/statistics', icon: BarChart3, label: 'Statistika' },
  { to: '/admin/payments', icon: DollarSign, label: 'To\'lovlar' },
]

// Boshqalar - kamdan-kam ishlatiladigan
const adminOthersNav = [
  { to: '/admin/logins', icon: Key, label: 'Loginlar ro\'yxati' },
  { to: '/admin/create-login', icon: UserPlus, label: 'Login yaratish' },
  { to: '/admin/ai-settings', icon: Bot, label: 'AI Sozlamalari' },
  { to: '/admin/persistent-storage', icon: RefreshCw, label: 'Doimiy saqlash' },
  { to: '/admin/data-sync', icon: RefreshCw, label: 'Ma\'lumot ulashish' },
  { to: '/admin/monthly-reports', icon: Mail, label: 'Oylik hisobotlar' },
  // Chiqish faqat mobilda "Boshqalar"da
  { to: 'logout', icon: LogOut, label: 'Chiqish', action: 'logout' },
]

const teacherNav = [
  { to: '/teacher', icon: FolderKanban, label: 'Mening guruhlarim' },
]

export function Sidebar({ role }: { role: 'admin' | 'teacher' | 'student' }) {
  const { logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isOthersOpen, setIsOthersOpen] = useState(false)
  
  const mainNav = role === 'admin' ? adminMainNav : role === 'teacher' ? teacherNav : []
  const othersNav = role === 'admin' ? adminOthersNav : []

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const toggleOthers = () => {
    setIsOthersOpen(!isOthersOpen)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 min-h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <NavLink 
          to={role === 'admin' ? '/admin' : '/teacher'} 
          className="block p-4 border-b border-gray-200 dark:border-gray-700 no-underline group"
          onClick={closeMobileMenu}
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500 group-hover:bg-green-600 text-white transition-colors shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /></svg>
            </span>
            <div>
              <h1 className="text-lg font-bold text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300">Bukhari Academy</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">O\'quv markazi</p>
            </div>
          </div>
        </NavLink>
        {mainNav.length > 0 && (
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {/* Asosiy menyu */}
            {mainNav.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/admin' || to === '/teacher'}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                {label}
              </NavLink>
            ))}
            
            {/* Boshqalar bo'limi */}
            {othersNav.length > 0 && (
              <div className="pt-2">
                <button
                  onClick={toggleOthers}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MoreHorizontal className="w-5 h-5 shrink-0" />
                    Boshqalar
                  </div>
                  {isOthersOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                
                {isOthersOpen && (
                  <div className="mt-1 ml-4 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
                    {othersNav.map(({ to, icon: Icon, label, action }) => {
                      // Agar "Chiqish" bo'lsa - button qilish
                      if (action === 'logout') {
                        return (
                          <button
                            key={to}
                            onClick={() => {
                              logout()
                              closeMobileMenu()
                            }}
                            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 md:hidden"
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            {label}
                          </button>
                        )
                      }
                      
                      // Oddiy link
                      return (
                        <NavLink
                          key={to}
                          to={to}
                          onClick={closeMobileMenu}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isActive
                                ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`
                          }
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          {label}
                        </NavLink>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </nav>
        )}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {theme === 'dark' ? 'Yorug\' rejim' : 'Qorong\'u rejim'}
          </button>
          {/* Chiqish faqat katta ekranlarda ko'rinadi */}
          <button
            type="button"
            onClick={() => {
              logout()
              closeMobileMenu()
            }}
            className="hidden md:flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="w-5 h-5" />
            Chiqish
          </button>
        </div>
      </aside>
    </>
  )
}