import { useQuery } from '@tanstack/react-query'
import { API_CLIENT } from '@/utils'
import type { Frame } from '@/models'
import { useCallback, useEffect, useRef, useState } from 'react'
import Spinner from '../common/spinner'
import WeatherPanel from './weather-panel'

const SLIDESHOW_INTERVAL = 20 * 60 * 1000 // 20 minutes

// Tiny 1-second silent video encoded as base64 (prevents screen from sleeping)
const WAKE_LOCK_VIDEO =
  'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAA0NtZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE2NCByMzEwOCAzMWUxOWY5IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAyMyAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTMgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTEgc2NlbmVjdXQ9NDAgaW50cmFfcmVmcmVzaD0wIHJjX2xvb2thaGVhZD00MCByYz1jcmYgbWJ0cmVlPTEgY3JmPTIzLjAgcWNvbXA9MC42MCBxcG1pbj0wIHFwbWF4PTY5IHFwc3RlcD00IGlwX3JhdGlvPTEuNDAgYXE9MToxLjAwAIAAAAAwZYiEACD/2lu4PtiAGCZiIJmO35BneLS4/AKawbwF3gS81VgCN/Hh0WAAAAMAAAMAAAMAtaOBIBWMAADAcGluZW5jIHZlcnNpb249MS4wAAAAAAAAAABIAAAAEAAP//9YAAAFVm1vb3YAAABsbXZoZAAAAAAAAAAAAAAAAAAAA+gAAAAoAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAR4dHJhawAAAFx0a2hkAAAAAwAAAAAAAAAAAAAAAQAAAAAAAAAoAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAACgAAAAWgAAAAAAJGVkdHMAAAAcZWxzdAAAAAAAAAABAAAAKAAAAAAAAQAAAAAD8G1kaWEAAAAgbWRoZAAAAAAAAAAAAAAAAAAAQAAAAgBVxAAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAADm21pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAA1tzdGJsAAAAt3N0c2QAAAAAAAAAAQAAAKdhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAKAAWgBIAAAASAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGP//AAAANWF2Y0MBZAAf/+EAGWdkAB+s2UCYM+XhAAADAAEAAAMAPA8YMZYBAAZo6+PLIsD9+PgAAAAAHHV1aWRraEDyXyRPxbo5pRvPAyPzAAAAAAAAABhzdHRzAAAAAAAAAAEAAAABAAACAAAAAABYY3R0cwAAAAAAAAAQAAAAAQAABAAAAAABAAAKAAAAAAEAAAQAAAAAAQAAAAAAAAABAAACAAAAAAEAAAoAAAAAAQAABAAAAAABAAAAAAAAAAEAAAIAAAAAAQAACgAAAAABAAAEAAAAAAEAAAAAAAAAAQAAAgAAAAA0c3RzcwAAAAAAAAACAAAAAQAAAA4AAAAsc2R0cAAAAQAAAAIAABAAAAwAAAAIAAAQAAAAFHN0c3oAAAAAAAAAAAAAAAEAAAMHAAAAFHN0Y28AAAAAAAAAAQAAADAAAABidWR0YQAAAFptZXRhAAAAAAAAACFoZGxyAAAAAAAAAABtZGlyYXBwbAAAAAAAAAAAAAAAAC1pbHN0AAAAJal0b28AAAAdZGF0YQAAAAEAAAAATGF2ZjYwLjMuMTAw'

export default function PhotoFrame() {
  const [currentFrame, setCurrentFrame] = useState<Frame | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
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
    console.log('Attempting to start wake lock video')
    console.log('videoRef.current:', video)
    console.log('wakeLockStartedRef', wakeLockStartedRef.current)

    if (!video || wakeLockStartedRef.current) return

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

    console.log('useEffect videoRef.current:', video)

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
    // Start wake lock on first user interaction
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

  if (framesLoading) {
    return (
      <>
        {/* Video to prevent screen sleep - must always be rendered */}
        <video
          ref={videoRef}
          src={WAKE_LOCK_VIDEO}
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
      {/* Video to prevent screen sleep - must be rendered (not display:none) to work */}
      <video
        ref={videoRef}
        src={WAKE_LOCK_VIDEO}
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
