import { createFileRoute } from '@tanstack/react-router'
import Button from '@/components/common/button'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div>
      <h1>Welcome to HomeServer</h1>
      <Button>Click Me</Button>
      <button className="bg-background">Do not click</button>
    </div>
  )
}
