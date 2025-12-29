import { Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <div className="bg-background text-on-background w-full antialiased p-5 flex flex-col">
      <Outlet />
    </div>
  ),
})
