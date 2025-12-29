import { useEffect, useState } from 'react'

type StaticProgressBarProps = {
  percentage: number
}

function StaticProgressBar({ percentage }: StaticProgressBarProps) {
  const percentageStr = `${Math.floor(percentage)}%`
  return (
    <div className="flex h-1 w-full rounded bg-scrim/10">
      <div
        className="h-full rounded-lg bg-linear-to-l from-emerald-500 to-cyan-400"
        style={{ width: percentageStr }}
      ></div>
    </div>
  )
}

type TimedProgressBarProps = {
  seconds: number
  shouldEnd?: true
}
function TimedProgressBar({ seconds, shouldEnd }: TimedProgressBarProps) {
  const [width, setWidth] = useState('0%')
  useEffect(() => {
    if (shouldEnd) {
      setWidth('100%')
    } else {
      setWidth('95%')
    }
  }, [shouldEnd])

  return (
    <div className="flex h-1 w-full rounded bg-scrim/10">
      <div
        className="h-full w-0 rounded-lg bg-linear-to-l from-emerald-500 to-cyan-400"
        style={{
          width: width,
          transition: `width ${seconds}s cubic-bezier(0, 0, 0.25, 1)`,
        }}
        // style={{ width: width, transition: `width ${seconds}s ease-out` }}
      ></div>
    </div>
  )
}

function IndeterminateProgressBar() {
  return (
    <div className="flex h-1 w-full overflow-hidden rounded bg-inverse-surface/10">
      <div className="animate-progress h-full w-full rounded-lg bg-linear-to-r from-transparent via-primary to-transparent"></div>
    </div>
  )
}

export { StaticProgressBar, TimedProgressBar, IndeterminateProgressBar }
