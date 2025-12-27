import { PiSpinner } from 'react-icons/pi'

function Spinner({
  className,
  ...otherProps
}: React.HtmlHTMLAttributes<SVGAElement>) {
  return (
    <PiSpinner
      {...otherProps}
      className={`animate-spin text-3xl text-primary ${className}`}
    />
  )
}

export default Spinner
