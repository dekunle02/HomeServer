import { TbAlertCircleFilled } from 'react-icons/tb'
import { forwardRef } from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  required?: boolean
  error?: boolean
  errorText?: string
  helperText?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (props, ref) => {
    const { label, required, error, errorText, helperText, ...otherProps } =
      props

    return (
      <div className="relative flex flex-col">
        {/* LABEL */}
        {label && (
          <label htmlFor={otherProps.id} className="mb-1 px-2 text-sm">
            {label}
            {required && <span className="ml-1 text-error">*</span>}
          </label>
        )}

        {/* TEXTAREA  */}
        <textarea
          ref={ref}
          {...otherProps}
          className={`rounded-xl border-0 bg-surface-variant/50 px-3 py-2 text-on-surface-variant outline-none focus:ring-0 focus:outline-none ${
            error
              ? 'border-error ring-error/20 focus:border-error'
              : 'border-outline ring-outline/10 focus:border-primary focus:ring-primary/20 active:border-primary'
          } ${otherProps.className} `}
        />

        {/* ERROR TEXT*/}
        {error ? (
          <p className="mt-1 flex flex-row items-center gap-2 text-sm text-error">
            <TbAlertCircleFilled />
            {errorText}
          </p>
        ) : (
          helperText && (
            <p className="mt-1 flex flex-row items-center gap-2 text-sm text-on-background/50">
              {helperText}
            </p>
          )
        )}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'
export default Textarea
