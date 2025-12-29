import { createFileRoute } from '@tanstack/react-router'
import { MdComputer, MdDarkMode, MdLightMode } from 'react-icons/md'

import Picker from '@/components/common/picker'
import { useTheme } from '@/hooks'
import { BackButton } from '@/components/common/button'

export const Route = createFileRoute('/settings/')({
  component: RouteComponent,
})

function RouteComponent() {
  const theme = useTheme()

  return (
    <div className="h-screen">
      <div className="flex flex-row gap-2 items-center">
        <BackButton className="text-4xl!" />
        <h1 className="text-6xl font-light">Settings</h1>
      </div>

      <div className="mt-5 flex flex-col md:flex-row md:items-center gap-2 md:gap-5">
        <p className="text-xl">Theme</p>
        <Picker
          options={ThemeOptions}
          selectedValue={theme?.theme ?? 'system'}
          onChange={(v) => {
            theme?.switchTheme(v as 'light' | 'dark' | 'system')
          }}
        />
      </div>
    </div>
  )
}

const ThemeOptions = [
  { label: 'System', value: 'system', icon: <MdComputer size={16} /> },
  { label: 'Light', value: 'light', icon: <MdLightMode size={16} /> },
  { label: 'Dark', value: 'dark', icon: <MdDarkMode size={16} /> },
]
