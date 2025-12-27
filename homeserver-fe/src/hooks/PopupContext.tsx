import { createContext } from 'react'

type PopupContextType = {
  show: (
    param: React.ReactNode,
    bgDismiss?: boolean,
    onDismiss?: () => void,
  ) => void
  dismiss: () => void
}

const PopupContext = createContext<null | PopupContextType>(null)
export default PopupContext
