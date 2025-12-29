type props = {
  options: Array<{ label?: string; value: string; icon?: React.ReactNode }>
  selectedValue: string
  onChange: (value: string) => void
}

export default function Picker({ options, selectedValue, onChange }: props) {
  return (
    <div className="flex w-fit flex-row gap-1 rounded-3xl bg-surface-container-lowest p-2 shadow-sm">
      {options.map((option) => (
        <div className="flex flex-col items-center" key={option.value}>
          <button
            className={`flex cursor-pointer flex-row items-center gap-1 rounded-full px-4 py-1 ${selectedValue === option.value ? 'text-primary' : 'hover:bg-scrim/5'} `}
            onClick={() => onChange(option.value)}
          >
            {option.icon ?? null}
            <span>{option.label ?? null}</span>
          </button>
        </div>
      ))}
    </div>
  )
}
