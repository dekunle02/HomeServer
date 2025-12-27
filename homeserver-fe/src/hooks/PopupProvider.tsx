import { useRef, useState } from 'react'
import PopupContext from './PopupContext'
import type { HtmlHTMLAttributes } from 'react'

export function PopupProvider({
  children,
}: HtmlHTMLAttributes<HTMLDivElement>) {
  const [popup, setPopup] = useState<null | React.ReactNode>(null)
  const [bgDismiss, setBgDismiss] = useState(true)
  const onDismissRef = useRef<null | (() => void)>(null)

  function show(
    node: React.ReactNode,
    backgroundDismiss: boolean = true,
    onDismiss?: () => void,
  ) {
    setPopup(node)
    setBgDismiss(backgroundDismiss)
    onDismissRef.current = onDismiss ?? null
  }

  function dismiss() {
    setPopup(null)
    setBgDismiss(true)
    const callback = onDismissRef.current
    onDismissRef.current = null
    callback?.()
  }

  return (
    <PopupContext.Provider value={{ show: show, dismiss: dismiss }}>
      {popup && (
        <div
          className="w-screen h-screen z-30 fixed top-0 right-0 
          bg-black/5 backdrop-blur-sm flex flex-col justify-center items-center"
          onMouseDown={() => {
            if (bgDismiss) dismiss()
          }}
        >
          <div
            className="mx-auto my-auto animate-fadein"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {popup}
          </div>
        </div>
      )}
      {children}
    </PopupContext.Provider>
  )
}
