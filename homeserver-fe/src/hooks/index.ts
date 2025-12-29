import { useContext } from 'react'
import PopupContext from './PopupContext'
import ThemeContext from './ThemeContext'
import ToastContext from './ToastContext'

export { useClickOutside } from './ClickOutside'
export const usePopup = () => useContext(PopupContext)
export const useTheme = () => useContext(ThemeContext)
export const useToast = () => useContext(ToastContext)
