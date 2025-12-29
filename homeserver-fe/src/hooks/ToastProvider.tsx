import { useEffect, useState } from 'react'
import { FaCircleCheck } from 'react-icons/fa6'
import { IoClose, IoCloseCircle, IoWarning } from 'react-icons/io5'
import { MdClose, MdInfo } from 'react-icons/md'
import type {
  AnnouncementToast,
  MessageToast,
  ToastStyle,
  ToastType,
} from '@/hooks/ToastContext'
import ToastContext from '@/hooks/ToastContext'
import { TimedProgressBar } from '@/components/common/progressbar'
import Spacer from '@/components/common/spacer'

const EXIT_ANIM_MICROSECS = 300

type ProviderProps = {
  children: React.ReactNode
}

export function ToastProvider({ children }: ProviderProps) {
  const [toasts, setToasts] = useState<Array<ToastType>>([])

  function handleDeleteToast(toastId: string) {
    // Mark Toast for deleting first
    setToasts((prevToasts) =>
      prevToasts.map((toast) =>
        toast.id === toastId ? { ...toast, isDeleting: true } : toast,
      ),
    )

    // Remove after animation
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== toastId))
    }, EXIT_ANIM_MICROSECS)
  }

  function push(tt: ToastType) {
    setToasts((prevToasts) => [tt, ...prevToasts])
  }

  function handleClear() {
    setToasts([])
  }

  function handleError(text: string) {
    push({
      id: Math.random().toString(),
      text: text,
      style: 'error',
      t: 'message',
      isDeleting: false,
    })
  }

  function handleSuccess(text: string) {
    push({
      id: Math.random().toString(),
      text: text,
      style: 'success',
      t: 'message',
      isDeleting: false,
    })
  }

  function handleInfo(text: string) {
    push({
      id: Math.random().toString(),
      text: text,
      style: 'info',
      t: 'message',
      isDeleting: false,
    })
  }

  return (
    <ToastContext.Provider
      value={{
        push: push,
        clear: handleClear,
        error: handleError,
        success: handleSuccess,
        info: handleInfo,
      }}
    >
      <div className="flex flex-col fixed w-full z-30 gap-3 pt-4">
        {toasts.map((toast) => (
          <ToastView
            key={toast.id}
            toast={toast}
            onDismiss={handleDeleteToast}
          />
        ))}
      </div>
      {children}
    </ToastContext.Provider>
  )
}

type ToastViewProps = {
  toast: ToastType
  onDismiss: (id: string) => void
}

function ToastView({ toast, onDismiss }: ToastViewProps) {
  const { id, t, meta, isDeleting } = toast

  useEffect(() => {
    if (!meta?.userDismissed) {
      const timer = setTimeout(() => {
        onDismiss(id)
      }, 3000) // call after 2secs to begin process of dismissing toast
      return () => clearTimeout(timer)
    }
  }, [id, meta, onDismiss])

  let innerComponent = null

  if (t === 'custom') {
    innerComponent = toast.node
  } else if (t === 'announcement') {
    innerComponent = <AnnouncementTV toast={toast} />
  } else {
    innerComponent = <MessageTV toast={toast} onDismiss={onDismiss} />
  }

  return (
    <div
      className={`flex flex-col mx-auto gap-2 z-30 bg-background shadow-lg rounded-2xl p-2
         ${!isDeleting ? 'animate-slidedown' : 'animate-slideup'}`}
      onClick={() => onDismiss(id)}
    >
      {innerComponent}
      {meta?.showProgress ? <TimedProgressBar seconds={3} shouldEnd /> : null}
    </div>
  )
}

type MessageTVprops = {
  toast: MessageToast
  onDismiss: (id: string) => void
}

function MessageTV({ toast, onDismiss }: MessageTVprops) {
  const { id, style, text, actions } = toast

  return (
    <div className="flex flex-row gap-1 items-center w-screen lg:max-w-[80vw] text-on-background">
      <ToastIcon style={style} />

      <p className="grow ml-2">{text}</p>

      <Spacer />

      <div className="flex flex-row items-center gap-5">
        {actions?.map((action) => (
          <button
            className="button outline-button py-1 px-4 text-on-background bg-background"
            key={action.text}
            onClick={action.onClick}
          >
            {action.text}
          </button>
        ))}
        <button
          className="text-button text-2xl px-0 "
          onClick={() => onDismiss(id)}
        >
          <IoClose />
        </button>
      </div>
    </div>
  )
}

type AnnouncementTVprops = {
  toast: AnnouncementToast
}

function AnnouncementTV({ toast }: AnnouncementTVprops) {
  return (
    <div className="flex flex-col gap-2 rounded-lg p-1 z-30 lg:w-136 w-full relative">
      <h2 className="text-center text-2xl">{toast.title}</h2>
      {toast.icon ? toast.icon : null}
      {toast.body}
      <button className="button subtle-button rounded-full absolute top-0 right-0">
        <MdClose />
      </button>
    </div>
  )
}

function ToastIcon({ style }: { style: ToastStyle }) {
  switch (style) {
    case 'success':
      return <FaCircleCheck className="text-3xl text-primary" />
    case 'error':
      return <IoCloseCircle className="text-3xl text-error" />
    case 'info':
      return <MdInfo className="text-3xl text-on-background" />
    case 'warning':
      return <IoWarning className="text-3xl text-error/50" />
  }
}
