import { Outlet, createRootRoute } from "@tanstack/react-router"
import Header from "../components/common/Header"

function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-primary text-primary">
      <Header />
      <main className="flex items-start justify-center mx-auto w-full px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})
