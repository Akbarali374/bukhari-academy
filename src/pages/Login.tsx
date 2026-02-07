import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/hooks/useTheme'
import { Sun, Moon } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      const to = user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/teacher' : '/student'
      navigate(to, { replace: true })
    }
  }, [user, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const result = await login(email.trim(), password)
    setLoading(false)
    if (result.ok && result.role) {
      toast.success('Tizimga kirdingiz')
      const to = result.role === 'admin' ? '/admin' : result.role === 'teacher' ? '/teacher' : '/student'
      navigate(to, { replace: true })
    } else if (!result.ok) {
      toast.error(result.error ?? 'Xatolik')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 shadow-md hover:shadow-lg transition-shadow"
        aria-label="Tema"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-md">
        {/* Logo va xush kelibsiz */}
        <div className="text-center mb-8 animate-fadeIn">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative animate-scaleIn">
              <div className="w-32 h-32 rounded-full bg-white dark:bg-gray-800 shadow-2xl flex items-center justify-center border-4 border-green-500 hover:scale-110 transition-transform duration-300">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">BA</div>
                  <div className="text-xs font-semibold text-green-600 dark:text-green-400 mt-1">BUKHARI</div>
                  <div className="text-[10px] text-green-500 dark:text-green-500">ACADEMY</div>
                </div>
              </div>
              {/* Ruchka ushlab turgan bola emoji */}
              <div className="absolute -bottom-2 -right-2 text-4xl animate-bounce">
                ✍️
              </div>
            </div>
          </div>

          {/* Xush kelibsiz xabari */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 animate-slideIn">
            Bukhari Academy
          </h1>
          <p className="text-lg text-green-600 dark:text-green-400 font-medium mb-1 animate-slideIn" style={{ animationDelay: '0.1s' }}>
            Kundaligingizga xush kelibsiz! 📚
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 animate-slideIn" style={{ animationDelay: '0.2s' }}>
            Zamonaviy ta'lim platformasi
          </p>
        </div>

        {/* Login forma */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 space-y-5 animate-scaleIn hover:shadow-3xl transition-shadow duration-300"
          style={{ animationDelay: '0.3s' }}
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📧 Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🔒 Parol
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Kirish...
              </span>
            ) : (
              '🚀 Kirish'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2024 Bukhari Academy. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </div>
    </div>
  )
}
