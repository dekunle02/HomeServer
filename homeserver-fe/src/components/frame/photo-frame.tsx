import { useQuery } from '@tanstack/react-query'
import { API_CLIENT } from '@/utils'
import type { Frame } from '@/models'
import { useCallback, useEffect, useRef, useState } from 'react'
import Spinner from '../common/spinner'
import WeatherPanel from './weather-panel'

const SLIDESHOW_INTERVAL = 20 * 60 * 1000 // 20 minutes

export default function PhotoFrame() {
  const [currentFrame, setCurrentFrame] = useState<Frame | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wakeLockStartedRef = useRef(false)

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

  // Function to start wake lock video (must be called from user interaction)
  const startWakeLock = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    console.log(
      'Attempting to start wake lock video',
      'started ref::',
      wakeLockStartedRef.current,
    )

    if (!video || !canvas || wakeLockStartedRef.current) return

    // Create a stream from the canvas and attach to video
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw something on the canvas (just a black pixel)
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, 1, 1)

    // Create a MediaStream from the canvas
    const stream = canvas.captureStream(1) // 1 fps is enough

    // Attach the stream to the video element
    video.srcObject = stream

    video
      .play()
      .then(() => {
        wakeLockStartedRef.current = true
        console.log('Wake lock video started playing')
      })
      .catch((err) => {
        // Autoplay blocked, will retry on next interaction
        console.log('Wake lock video failed to play:', err)
      })
  }, [])

  // Re-start video when tab becomes visible again
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === 'visible' &&
        wakeLockStartedRef.current
      ) {
        video.play().catch(() => {})
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // shuffling function callback
  const shuffleFrame = useCallback(() => {
    // Start wake lock
    startWakeLock()

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
  }, [frames, startWakeLock])

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

  // Start wake lock video on initial mount
  useEffect(() => {
    startWakeLock()
  }, [startWakeLock])

  if (framesLoading) {
    return (
      <>
        {/* Canvas and video to prevent screen sleep - must always be rendered */}
        <canvas
          ref={canvasRef}
          width={1}
          height={1}
          className="fixed w-px h-px opacity-0 pointer-events-none"
          style={{ top: -1, left: -1 }}
        />
        <video
          ref={videoRef}
          loop
          muted
          playsInline
          className="fixed w-px h-px opacity-0 pointer-events-none"
          style={{ top: -1, left: -1 }}
        />
        <Spinner />
      </>
    )
  }

  return (
    <div className={`h-screen flex flex-col`}>
      {/* Canvas and video to prevent screen sleep */}
      <canvas
        ref={canvasRef}
        width={1}
        height={1}
        className="fixed w-px h-px opacity-0 pointer-events-none"
        style={{ top: -1, left: -1 }}
      />
      <video
        ref={videoRef}
        loop
        muted
        playsInline
        className="fixed w-px h-px opacity-0 pointer-events-none"
        style={{ top: -1, left: -1 }}
      />
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
