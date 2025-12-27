import { useEffect, useRef, useState } from 'react'
import { PiSpinner } from 'react-icons/pi'

import { MdArrowBack } from 'react-icons/md'
import { LuUndo2 } from 'react-icons/lu'
import { IoClose } from 'react-icons/io5'
import { useRouter } from '@tanstack/react-router'
import { usePopup } from '../../hooks'
import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant =
  | 'primary'
  | 'tonal'
  | 'disabled'
  | 'error'
  | 'outlined'
  | 'error-outlined'
  | 'transparent'
  | 'error-transparent'
  | 'subtle'

interface props extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
  loadingTexts?: Array<string>
  loadingTextInterval?: number // seconds
  delay?: boolean
  delaySeconds?: number
  delayText?: string
  variant?: ButtonVariant
}

function getButtonStyles(form?: ButtonVariant): string {
  const baseStyles =
    'flex flex-row gap-2 rounded-3xl py-1 px-3 items-center active:scale-95 cursor-pointer hover:drop-shadow-sm shadow-primary/20'

  switch (form) {
    case 'primary':
      return `${baseStyles} bg-primary-container text-on-primary-container`
    case 'tonal':
      return `${baseStyles} bg-secondary-container text-on-secondary-container`
    case 'error':
      return `${baseStyles} bg-error/10  text-on-error-container`
    case 'error-outlined':
      return `${baseStyles} bg-transparent border border-error text-error`
    case 'outlined':
      return `${baseStyles} bg-transparent border border-outline`
    case 'transparent':
      return `${baseStyles} bg-transparent text-on-background hover:text-primary active:text-primary`
    case 'error-transparent':
      return `${baseStyles} bg-transparent text-error hover:bg-error/10 active:bg-error/10`
    case 'subtle':
      return `${baseStyles} bg-transparent hover:bg-on-background/10 active:bg-on-background/10`
    default:
      return `${baseStyles} bg-primary text-on-primary`
  }
}

/**
 * Button variant options:
 * "primary"
 * "tonal"
 * "error"
 * "error-outlined"
 * "outlined"
 * "transparent"
 * "error-transparent"
 * "subtle"
 *  */
export default function Button(props: props) {
  const {
    className,
    loading,
    loadingText,
    loadingTexts,
    loadingTextInterval: loadingInterval,
    delay,
    delaySeconds,
    delayText,
    onClick,
    children,
    variant: form,
    ...otherProps
  } = props

  const firstLoadingText = loadingTexts ? loadingTexts[0] : ''
  const [delayWidth, setDelayWidth] = useState(0)
  const delayInterval = useRef<null | number | any>(null)

  const [lText, setLText] = useState<string>(
    loadingText ? loadingText : firstLoadingText,
  )
  const [showDelayCover, setShowDelayCover] = useState(false)

  useEffect(() => {
    if (!loadingTexts || !loadingInterval || loadingTexts.length === 0) return

    const s = loadingInterval ? loadingInterval * 1000 : 15000

    const interval = setInterval(() => {
      setLText((prev) => {
        const oldIdx = loadingTexts.indexOf(prev)
        const newIdx = oldIdx + (1 % loadingTexts.length)
        return loadingTexts[newIdx]
      })
    }, s)

    return () => clearInterval(interval)
  }, [loadingTexts, loadingInterval])

  useEffect(() => {
    if (showDelayCover) {
      setDelayWidth(100) // Expand to 100% width
    } else {
      setDelayWidth(0) // Reset to 0% when collapsed
    }
  }, [showDelayCover])

  function handleDelayClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (!onClick) return

    if (!delay || !delaySeconds || !delayText) {
      return onClick(e)
    }

    if (showDelayCover) {
      // cancel timer
      cleanupDelay()
    } else {
      setShowDelayCover(true)
      delayInterval.current = setInterval(() => {
        onClick(e)
        cleanupDelay()
      }, delaySeconds * 1000)
    }
  }

  function cleanupDelay() {
    clearInterval(delayInterval.current ?? undefined)
    setShowDelayCover(false)
    delayInterval.current = null
  }

  const baseStyle = getButtonStyles(form)

  if (loading) {
    return (
      <button
        className={`hover:bg-on-background/5; primary flex cursor-not-allowed flex-row items-center justify-center gap-2 rounded-3xl border border-scrim/10 bg-scrim/5 px-5 py-2 text-on-background/50 ${className}`}
        disabled
      >
        <PiSpinner className="animate-spin text-xl" />
        {lText}
      </button>
    )
  }

  if (delay) {
    return (
      <button
        className={`relative ${baseStyle} ${className || ''} ${
          showDelayCover ? 'bg-scrim/5' : ''
        }`}
        onClick={handleDelayClick}
      >
        {!showDelayCover && children}

        {showDelayCover && (
          <div
            className="absolute right-0 h-full rounded-3xl bg-error-container/80"
            style={{
              width: `${delayWidth}%`,
              transition: `width ${delaySeconds}s linear`,
            }}
          />
        )}

        {showDelayCover && (
          <>
            <LuUndo2 className="z-2 text-on-error-container" />
            <span className="z-2 text-on-error-container">{delayText}</span>
          </>
        )}
      </button>
    )
  }

  return (
    <button
      {...otherProps}
      onClick={onClick}
      className={`${baseStyle} ${className || ''}`}
    >
      {children}
    </button>
  )
}

//
//

export const DEFAULT_BUTTON_TIMEOUT: number = 2 * 60 // time in seconds for resend code button to be inactive, 2 min by default

interface tProps extends props {
  clickableByDefault?: boolean
  buttonTimeout?: number // time in seconds for button to be clickable
}

export function TimeoutButton({
  className,
  children,
  clickableByDefault,
  onClick,
  buttonTimeout,
  ...otherProps
}: tProps) {
  const buttonTimeoutValue = buttonTimeout ?? DEFAULT_BUTTON_TIMEOUT
  const [timeLeft, setTimeLeft] = useState(buttonTimeoutValue)
  const intervalRef = useRef<null | number>(null)

  useEffect(() => {
    if (!clickableByDefault) {
      startTimer()
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  function startTimer() {
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          return buttonTimeoutValue
        }
        return prevTime - 1
      })
    }, 1000)
  }

  const formatedTime: string = ((): string => {
    const minutes = Math.floor(timeLeft / 60)
    const remainingSeconds = timeLeft % 60
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
  })()

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (timeLeft === buttonTimeoutValue && onClick) {
      onClick(e)
      startTimer()
    }
  }

  return (
    <Button
      {...otherProps}
      onClick={handleClick}
      className={`${
        timeLeft === buttonTimeoutValue
          ? className
          : 'cursor-not-allowed opacity-50'
      }`}
    >
      {timeLeft === buttonTimeoutValue ? children : <span>{formatedTime}</span>}
    </Button>
  )
}

export function BackButton({ children, className, ...otherProps }: props) {
  const router = useRouter()

  return (
    <Button
      className={`text-lg ${className}`}
      variant="subtle"
      aria-label="back button"
      onClick={() => router.history.back()}
      {...otherProps}
    >
      <MdArrowBack />
      {children}
    </Button>
  )
}

export function ClosePopupButton({
  children,
  className,
  ...otherProps
}: props) {
  const popup = usePopup()
  return (
    <Button
      className={`absolute top-4 right-4 rounded-full text-lg ${className}`}
      aria-label="close button"
      variant="subtle"
      onClick={() => popup?.dismiss()}
      {...otherProps}
    >
      <IoClose />
      {children}
    </Button>
  )
}
