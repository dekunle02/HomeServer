import { useQuery } from '@tanstack/react-query'
import { API_CLIENT } from '@/utils'
import type { Frame } from '@/models'
import { useCallback, useEffect, useState } from 'react'
import Spinner from '../common/spinner'
import WeatherPanel from './weather-panel'

const SLIDESHOW_INTERVAL = 20 * 60 * 1000 // 20 minutes

export default function PhotoFrame() {
  const [currentFrame, setCurrentFrame] = useState<Frame | null>(null)

  // Queries
  const { data: frames, isLoading: framesLoading } = useQuery({
    queryKey: ['frames'],
    queryFn: () =>
      API_CLIENT.get(`/api/core/frames/`).then((res) => {
        setCurrentFrame(getRandomFrame(res.data))
        return res.data
      }),
    staleTime: 30 * 60 * 1000, // 30 minutes
  })

  // Prevent screen from turning off
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen')
        }
      } catch (err) {
        console.log('Wake Lock error:', err)
      }
    }

    requestWakeLock()

    // Re-acquire wake lock when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      wakeLock?.release()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // shuffling function callback
  const shuffleFrame = useCallback(() => {
    if (frames && frames.length > 0) {
      setCurrentFrame((prev) => {
        let newFrame = getRandomFrame(frames)
        // Ensure the new frame is different from the current one
        while (newFrame.name === prev?.name && frames.length > 1) {
          newFrame = getRandomFrame(frames)
        }
        return newFrame
      })
    }
  }, [frames])

  // Slideshow effect
  useEffect(() => {
    if (!frames || frames.length === 0) return

    const interval = setInterval(() => {
      shuffleFrame()
    }, SLIDESHOW_INTERVAL)

    return () => clearInterval(interval)
  }, [frames, shuffleFrame])

  // Set initial frame when frames data is available (handles both fresh fetch and cache)
  useEffect(() => {
    if (frames && frames.length > 0 && !currentFrame) {
      setCurrentFrame(getRandomFrame(frames))
    }
  }, [frames, currentFrame])

  if (framesLoading) {
    return <Spinner />
  }

  return (
    <div className={`h-screen flex flex-col`}>
      <img
        src={currentFrame?.photo}
        alt="current frame"
        className="rounded-xl mx-auto h-2/3 md:h-3/4 w-full object-cover hover:-translate-y-2 transition-transform duration-200 hover:shadow-2xl cursor-pointer"
        onClick={shuffleFrame}
      />
      <WeatherPanel />
    </div>
  )
}

function getRandomFrame(frames: Frame[]): Frame {
  const randomIndex = Math.floor(Math.random() * frames.length)
  return frames[randomIndex]
}
