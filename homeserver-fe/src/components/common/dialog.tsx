import { usePopup } from '../../hooks'
import Button, { ClosePopupButton } from './button'
import type { HTMLAttributes } from 'react'

interface DialogProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  message?: string
  positiveText?: string
  negativeText?: string
  positiveActionLoading?: boolean
  positiveActionIsDestructive?: boolean
  onPositiveAction: () => void
  onNegativeAction?: () => void
}

export default function Dialog({
  title,
  message,
  positiveText,
  negativeText,
  onPositiveAction,
  positiveActionLoading,
  positiveActionIsDestructive,
  onNegativeAction,
  children,
}: DialogProps) {
  const popup = usePopup()

  const handleNeg = () => {
    popup?.dismiss()
    if (onNegativeAction) {
      onNegativeAction()
    }
  }

  return (
    <DialogContainer>
      <h2 className="text-xl font-light">{title}</h2>
      {children}
      <span>{message}</span>
      <div className="mt-5 flex flex-row justify-end gap-2">
        {positiveText && (
          <Button
            variant={positiveActionIsDestructive ? 'error' : 'primary'}
            onClick={onPositiveAction}
            loading={positiveActionLoading}
          >
            {positiveText}
          </Button>
        )}

        <button
          className="cursor-pointer rounded-full bg-transparent px-5 py-2 text-on-surface transition hover:bg-on-background/10 active:scale-95"
          onClick={handleNeg}
        >
          {negativeText ?? 'Cancel'}
        </button>
      </div>
    </DialogContainer>
  )
}

export function DialogContainer({
  className,
  children,
  ...otherProps
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...otherProps}
      className={`relative flex w-[90vw] max-w-xl flex-col gap-2 rounded-3xl bg-background p-4 text-sm text-on-background lg:px-4 ${className}`}
    >
      <ClosePopupButton />
      {children}
    </div>
  )
}
