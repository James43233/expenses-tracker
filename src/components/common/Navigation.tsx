import { Link, useLocation } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Wallet, ShoppingCart, Home } from "lucide-react"

export default function Navigation() {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <nav className="flex items-center justify-center gap-8 ">
      <Link to="/">
        <Button variant={isActive("/") ? "default" : "ghost"} size="default" >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Expenses</span>
        </Button>
      </Link>
      <Link to="/List">
        <Button variant={isActive("/List") ? "default" : "ghost"} size="default">
          <ShoppingCart className="h-4 w-4" />
          <span className="hidden sm:inline">Lists</span>
        </Button>
      </Link>
      <Link to="/Budget">
        <Button variant={isActive("/Budget") ? "default" : "ghost"} size="default">
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">Budget</span>
        </Button>
      </Link>
    </nav>
  )
}
