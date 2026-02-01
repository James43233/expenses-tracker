import Navigation from "./Navigation"
import Logo from "/2.png"

export default function Header() {
  return (
    <header className="bg-surface-dimmed text-primary shadow-lg mb-4">
      <div className="mx-auto flex items-center h-16 max-w-5xl px-4 sm:px-6">
        {/* Left */}
        <div className="flex items-center justify-start flex-1 min-w-0">
          <h1 className="text-2xl sm:text-2xl font-bold truncate ">
            <img src={Logo} alt="Spendify logo" className="h-14" />
          </h1>
        </div>

        {/* Center - Navigation handles responsiveness */}
        <div className="flex-1 flex justify-center">
          <Navigation />
        </div>

        {/* Right - Empty for balance */}
        <div className="flex-1 hidden md:block" />
      </div>
    </header>
  )
}
