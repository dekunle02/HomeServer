import { Link, createFileRoute } from '@tanstack/react-router'
import { IoSettings } from 'react-icons/io5'
import { GrGallery } from 'react-icons/gr'
import PhotoFrame from '@/components/frame/photo-frame'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="fxlex flex-col">
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
