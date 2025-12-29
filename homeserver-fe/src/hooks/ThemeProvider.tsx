import { useEffect, useState } from 'react'
import ThemeContext from './ThemeContext'
import type { Theme } from './ThemeContext'
import type { HtmlHTMLAttributes } from 'react'

export default function ThemeProvider({
  children,
}: HtmlHTMLAttributes<HTMLDivElement>) {
  const [theme, setTheme] = useState<Theme>(retrieveLocalTheme)

  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return

    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      window.location.reload()
    }
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  const contextArgs = {
    theme: theme,
    switchTheme: (t: Theme) => {
      setTheme(t)
      setLocalTheme(t)
    },
  }

  const pref = window.matchMedia('(prefers-color-scheme: dark)').matches
  const resolvedTheme = resolveTheme(theme, pref)
  const isDark = resolvedTheme === 'dark'

  return (
    <ThemeContext.Provider value={contextArgs}>
      <div data-theme={resolvedTheme} className={isDark ? 'dark' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

function resolveTheme(theme: Theme, prefersDark: boolean): 'light' | 'dark' {
  if (theme === 'system') {
    return prefersDark ? 'dark' : 'light'
  }
  return theme
}

function retrieveLocalTheme(): Theme {
  const value = localStorage.getItem('theme')
  if (value !== 'light' && value !== 'dark' && value !== 'system') {
    return 'system'
  }
  return value as Theme
}

function setLocalTheme(newValue: Theme) {
  localStorage.setItem('theme', newValue)
}
