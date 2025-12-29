import { createContext } from 'react'

export type Theme = 'light' | 'dark' | 'system'

export type ThemeContextType = {
  theme: Theme
  switchTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export default ThemeContext
