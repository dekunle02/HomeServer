import { Link, createFileRoute } from '@tanstack/react-router'
import { IoSettings } from 'react-icons/io5'
import { GrGallery } from 'react-icons/gr'
import PhotoFrame from '@/components/frame/photo-frame'
import { useWakeLock } from 'react-screen-wake-lock'
import { useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { released, request, release } = useWakeLock({
    onRequest: () => console.log('Screen Wake Lock: requested!'),
    onError: () => console.log('An error happened 💥'),
    onRelease: () => console.log('Screen Wake Lock: released!'),
    reacquireOnPageVisible: true,
  })

  useEffect(() => {
    request()
    return () => {
      release()
    }
  }, [])

  console.log('isRequested:', !released)
  return (
    <div className="flex flex-col" onClick={() => request()}>
      <PhotoFrame />

      <div className="flex flex-row items-center justify-between mb-5 mt-auto w-full">
        <Link
          to="/settings"
          className="flex flex-row items-center gap-2 p-2 px-5 rounded-3xl bg-surface-container-lowest text-primary text-xl w-fit"
        >
          <IoSettings /> Settings
        </Link>
        <Link
          to="/gallery"
          className="flex flex-row items-center gap-2 p-2 px-5 rounded-3xl bg-surface-container-lowest text-primary text-xl w-fit"
        >
          <GrGallery /> Gallery
        </Link>
      </div>
    </div>
  )
}
