import { Link, useLocation } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Wallet, ShoppingCart, Home } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Navigation() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const navItems = [
    { path: "/", label: "Expenses", icon: Home },
    { path: "/List", label: "Lists", icon: ShoppingCart },
    { path: "/Budget", label: "Budget", icon: Wallet },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-stretch border-t bg-background pb-safe md:static md:h-auto md:w-auto md:border-none md:bg-transparent md:pb-0">
      {/* Mobile Nav */}
      <div className="flex w-full justify-around items-stretch md:hidden pb-2">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = isActive(path)
          return (
            <Link
              key={path}
              to={path}
              className="flex-1 group relative flex flex-col items-center justify-center pt-2"
            >
              <div
                className={cn(
                  "absolute top-0 h-[3px] w-full transition-colors",
                  active ? "bg-primary" : "bg-transparent"
                )}
              />
              <div
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="text-[10px] font-medium">{label}</span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center justify-center gap-8">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link key={path} to={path}>
            <Button variant={isActive(path) ? "default" : "ghost"} size="default" className="gap-2">
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </nav>
  )
}
