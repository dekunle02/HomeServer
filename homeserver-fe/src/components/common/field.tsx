import { TbAlertCircleFilled } from 'react-icons/tb'
import { VscEye, VscEyeClosed } from 'react-icons/vsc'
import { forwardRef, useState } from 'react'

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  required?: boolean
  error?: boolean
  errorText?: string
  helperText?: string
}

const Field = forwardRef<HTMLInputElement, FieldProps>((props, ref) => {
  const { label, required, error, errorText, helperText, ...otherProps } = props
  const [isVisible, setVisibility] = useState(false)

  return (
    <div className="relative flex flex-col">
      {/* LABEL */}
      {label && (
        <label htmlFor={otherProps.id} className="mb-1 px-2 text-sm">
          {label}
          {required && <span className="ml-1 text-error">*</span>}
        </label>
      )}

      {/* INPUT  */}
      <input
        ref={ref}
        {...otherProps}
        className={`rounded-3xl border-0 bg-surface-variant/50 px-3 py-2 text-on-surface-variant outline-none focus:ring-0 focus:outline-none ${
          error
            ? 'border-error ring-error/20 focus:border-error'
            : 'border-outline ring-outline/10 focus:border-primary focus:ring-primary/20 active:border-primary'
        } ${otherProps.className} `}
        type={isVisible ? 'text' : otherProps.type}
      />

      {/* PASSWORD TOGGLE */}
      {otherProps.type === 'password' && (
        <div
          className="absolute top-10 right-4 cursor-pointer text-lg text-on-background"
          onClick={() => setVisibility(!isVisible)}
        >
          {isVisible ? <VscEye /> : <VscEyeClosed />}
        </div>
      )}

      {/* HELPER TEXT */}
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
})

Field.displayName = 'Field'
export default Field
