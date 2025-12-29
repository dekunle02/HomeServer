import Button, { BackButton } from '@/components/common/button'
import Dialog, { DialogContainer } from '@/components/common/dialog'
import Spinner from '@/components/common/spinner'
import { usePopup, useToast } from '@/hooks'
import type { Frame } from '@/models'
import { API_CLIENT } from '@/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { IoAdd, IoCheckmarkCircle, IoClose, IoTrash } from 'react-icons/io5'

export const Route = createFileRoute('/gallery/')({
  component: RouteComponent,
})

interface PhotoUploadButtonProps {
  className?: string
}

function PhotoUploadButton({ className }: PhotoUploadButtonProps) {
  const queryClient = useQueryClient()
  const popup = usePopup()
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { mutate: uploadPhotos, isPending: uploadPending } = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append('photos', file)
      })
      return API_CLIENT.post('/api/core/frames/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['frames'] })
      popup?.dismiss()
      toast?.success('Upload successful')
    },
    onError: () => {
      toast?.error('Upload failed')
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const fileArray = Array.from(files)
      popup?.show(
        <Dialog
          title="Upload Photos"
          message={`Do you want to upload ${fileArray.length} photo${fileArray.length > 1 ? 's' : ''}?`}
          positiveText="Upload"
          negativeText="Cancel"
          positiveActionLoading={uploadPending}
          onPositiveAction={() => uploadPhotos(fileArray)}
        />,
      )
    }
    // Reset input so the same files can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        className={`text-3xl! px-10 backdrop-blur-sm ${className}`}
        variant="tonal"
        loading={uploadPending}
        onClick={handleClick}
      >
        <IoAdd />
        Add
      </Button>
    </>
  )
}

interface PhotoViewDialogProps {
  frame: Frame
}

function PhotoViewDialog({ frame }: PhotoViewDialogProps) {
  const queryClient = useQueryClient()
  const popup = usePopup()
  const toast = useToast()

  const { mutate: deletePhoto, isPending: deletePending } = useMutation({
    mutationFn: () => API_CLIENT.delete(`/api/core/frames/${frame.id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['frames'] })
      toast?.success('Photo deleted')
      popup?.dismiss()
    },
    onError: () => {
      toast?.error('Failed to delete photo')
    },
  })

  const handleDeleteClick = () => {
    popup?.show(
      <Dialog
        title="Delete Photo"
        message="Are you sure you want to delete this photo?"
        positiveText="Delete"
        negativeText="Cancel"
        positiveActionIsDestructive
        positiveActionLoading={deletePending}
        onPositiveAction={() => deletePhoto()}
      />,
    )
  }

  return (
    <DialogContainer className="items-center">
      <img
        src={frame.photo}
        alt={frame.name}
        className="max-h-[70vh] max-w-full rounded-lg object-contain"
      />
      <Button variant="error" onClick={handleDeleteClick} className="mt-2">
        <IoTrash />
        Delete
      </Button>
    </DialogContainer>
  )
}

function RouteComponent() {
  const queryClient = useQueryClient()
  const popup = usePopup()
  const toast = useToast()
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const isSelecting = selectedIds.size > 0

  const { data: frames, isLoading: framesLoading } = useQuery({
    queryKey: ['frames'],
    queryFn: () =>
      API_CLIENT.get<Frame[]>('/api/core/frames/').then((res) => res.data),
  })

  const { mutate: batchDelete, isPending: batchDeletePending } = useMutation({
    mutationFn: (ids: number[]) =>
      API_CLIENT.post('/api/core/frames/batch-delete/', { ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['frames'] })
      popup?.dismiss()
      toast?.success('Photos deleted')
      setSelectedIds(new Set())
    },
    onError: () => {
      toast?.error('Failed to delete photos')
    },
  })

  const handleImageClick = (frame: Frame) => {
    if (isSelecting) {
      toggleSelection(frame.id)
    } else {
      popup?.show(<PhotoViewDialog frame={frame} />)
    }
  }

  const handleLongPress = (frameId: number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      newSet.add(frameId)
      return newSet
    })
  }

  const toggleSelection = (frameId: number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(frameId)) {
        newSet.delete(frameId)
      } else {
        newSet.add(frameId)
      }
      return newSet
    })
  }

  const cancelSelection = () => {
    setSelectedIds(new Set())
  }

  const handleBatchDelete = () => {
    const count = selectedIds.size
    popup?.show(
      <Dialog
        title="Delete Photos"
        message={`Are you sure you want to delete ${count} photo${count > 1 ? 's' : ''}?`}
        positiveText="Delete"
        negativeText="Cancel"
        positiveActionIsDestructive
        positiveActionLoading={batchDeletePending}
        onPositiveAction={() => batchDelete(Array.from(selectedIds))}
      />,
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      <div className="fixed top-0 left-0 right-0 z-10 flex flex-row gap-2 items-center shrink-0 p-4 backdrop-blur-md">
        {isSelecting ? (
          <>
            <span className="text-xl font-medium flex-1">
              {selectedIds.size} selected
            </span>
            <button
              onClick={handleBatchDelete}
              className="p-2 text-2xl text-error cursor-pointer hover:bg-error/10 rounded-full transition"
            >
              <IoTrash />
            </button>
            <button
              onClick={cancelSelection}
              className="p-2 text-2xl cursor-pointer hover:bg-on-background/10 rounded-full transition"
            >
              <IoClose />
            </button>
          </>
        ) : (
          <>
            <BackButton className="text-4xl!" />
            <h1 className="text-6xl font-light">Gallery</h1>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {/* Spacer for fixed header */}
        <div className="h-20" />

        {framesLoading && <Spinner className="mx-auto" />}

        {/* Mobile: 2-column grid, Desktop: flex wrap */}
        <div className="grid grid-cols-2 gap-4 md:flex md:flex-row md:flex-wrap p-2">
          {frames?.map((frame) => (
            <PhotoGridItem
              key={frame.id}
              frame={frame}
              isSelected={selectedIds.has(frame.id)}
              isSelecting={isSelecting}
              onClick={() => handleImageClick(frame)}
              onLongPress={() => handleLongPress(frame.id)}
            />
          ))}
        </div>

        {!framesLoading && frames?.length === 0 && (
          <p className="text-on-background/50">No photos yet. Add some!</p>
        )}
      </div>

      {!isSelecting && (
        <div className="fixed bottom-10 left-0 right-0 flex flex-row justify-center">
          <PhotoUploadButton />
        </div>
      )}
    </div>
  )
}

interface PhotoGridItemProps {
  frame: Frame
  isSelected: boolean
  isSelecting: boolean
  onClick: () => void
  onLongPress: () => void
}

function PhotoGridItem({
  frame,
  isSelected,
  isSelecting,
  onClick,
  onLongPress,
}: PhotoGridItemProps) {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const longPressTriggered = useRef(false)

  const handleTouchStart = () => {
    longPressTriggered.current = false
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true
      onLongPress()
    }, 500)
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }

  const handleClick = () => {
    if (!longPressTriggered.current) {
      onClick()
    }
  }

  return (
    <div
      className={`relative cursor-pointer overflow-hidden rounded-lg transition hover:scale-105 active:scale-95 ${
        isSelected ? 'ring-4 ring-secondary' : ''
      }`}
      onClick={handleClick}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={frame.photo}
        alt={frame.name}
        className="h-40 w-full object-cover md:h-40 md:w-40"
      />
      {(isSelecting || isSelected) && (
        <div
          className={`absolute top-2 left-2 rounded-full ${
            isSelected
              ? 'text-white text-2xl'
              : 'w-5 h-5 border-2 border-white bg-black/30'
          }`}
        >
          {isSelected && <IoCheckmarkCircle />}
        </div>
      )}
    </div>
  )
}
