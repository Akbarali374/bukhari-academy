import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'bukhari-theme'

export function useTheme() {
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'dark'
    const stored = localStorage.getItem(STORAGE_KEY) as 'light' | 'dark' | null
    if (stored) return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const setTheme = useCallback((value: 'light' | 'dark') => {
    setThemeState(value)
    localStorage.setItem(STORAGE_KEY, value)
    document.documentElement.classList.toggle('dark', value === 'dark')
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  const initTheme = useCallback(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return { theme, setTheme, toggleTheme, initTheme }
}
