import { createContext } from 'react'
import type { ReactNode } from 'react'

export type ToastStyle = 'success' | 'error' | 'warning' | 'info'

type ToastAction = {
  text: string
  onClick: () => void
}

type ToastMeta = {
  userDismissed?: boolean
  showProgress?: boolean
  showConfetti?: boolean
}

interface Toastable {
  id: string
  meta?: ToastMeta
  t: 'message' | 'announcement' | 'custom'
  isDeleting: boolean
}

export interface MessageToast extends Toastable {
  text: string
  style: ToastStyle
  actions?: Array<ToastAction>
  t: 'message'
}

export interface AnnouncementToast extends Toastable {
  title: string
  body: ReactNode
  icon?: ReactNode
  t: 'announcement'
}

export interface CustomToast extends Toastable {
  node: ReactNode
  t: 'custom'
}

export type ToastType = MessageToast | AnnouncementToast | CustomToast

type ToastContextType = {
  push: (toast: ToastType) => void
  clear: () => void
  success: (text: string) => void
  error: (text: string) => void
  info: (text: string) => void
}

const ToastContext = createContext<null | ToastContextType>(null)
export default ToastContext
