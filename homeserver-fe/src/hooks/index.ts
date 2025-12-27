import { useContext } from 'react'
import PopupContext from './PopupContext'

export { useClickOutside } from './ClickOutside'
export const usePopup = () => useContext(PopupContext)
