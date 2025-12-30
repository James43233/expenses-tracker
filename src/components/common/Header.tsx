import { useState } from "react"
import { Link, useLocation } from "@tanstack/react-router"
import { Menu, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTheme } from "@/hooks/useTheme"
import Navigation from "./Navigation"

export default function Header() {
  const { isDark, toggleTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="bg-primary text-primary-foreground shadow-lg mb-4">
      <div className="mx-auto flex items-center h-16 max-w-5xl px-4 sm:px-6">
        {/* Left */}
        <div className="flex items-center justify-start flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold truncate">Expense Tracker</h1>
        </div>

        {/* Center (desktop nav) */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <Navigation />
        </div>

        {/* Right */}
        <div className="flex items-center justify-end flex-1 gap-2">
          <Button
            onClick={toggleTheme}
            variant="outline"
            size="icon"
            className="rounded-lg bg-transparent"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Mobile/Tablet menu */}
          <Button
            onClick={() => setIsMenuOpen(true)}
            variant="outline"
            size="icon"
            className="rounded-lg bg-transparent md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Dialog open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Menu</DialogTitle>
          </DialogHeader>

          <nav className="flex flex-col gap-2">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>
              <Button className="w-full justify-start" variant={isActive("/") ? "default" : "ghost"}>
                Expenses
              </Button>
            </Link>
            <Link to="/List" onClick={() => setIsMenuOpen(false)}>
              <Button className="w-full justify-start" variant={isActive("/List") ? "default" : "ghost"}>
                Lists
              </Button>
            </Link>
            <Link to="/Budget" onClick={() => setIsMenuOpen(false)}>
              <Button className="w-full justify-start" variant={isActive("/Budget") ? "default" : "ghost"}>
                Budget
              </Button>
            </Link>
          </nav>
        </DialogContent>
      </Dialog>
    </header>
  )
}
