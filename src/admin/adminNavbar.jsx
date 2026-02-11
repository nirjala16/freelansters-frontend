"use client"

import { Link, useNavigate } from "react-router-dom"
import { useContext, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { LayoutDashboard, Users, Briefcase, LogOut, Moon, Sun, Notebook, Menu, ChevronDown } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ThemeProviderContext } from "@/components/theme-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import Freelansters from "../assets/Freelansters.svg"

const AdminNavbar = () => {
  const navigate = useNavigate()
  const { theme, setTheme } = useContext(ThemeProviderContext)
  const [admin, setAdmin] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("adminSession"))
    if (session) setAdmin(session.admin)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("adminSession")
    navigate("/admin/login")
    toast.success("Logged out successfully!")
  }

  const navLinks = [
    {
      path: "/admin/adminpanel",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      path: "/admin/manage-users",
      label: "Manage Users",
      icon: <Users className="h-5 w-5" />,
      permission: "manageUsers",
    },
    {
      path: "/admin/manage-jobs",
      label: "Manage Jobs",
      icon: <Briefcase className="h-5 w-5" />,
      permission: "manageJobs",
    },
    {
      path: "/admin/analytics",
      label: "Analytics",
      icon: <Notebook className="h-5 w-5" />,
    },
  ]

  // Check if admin has permission for a specific feature
  const hasPermission = (permission) => {
    if (!admin || !admin.permissions) return false
    return admin.permissions.includes(permission)
  }

  // Filter nav links based on permissions
  const filteredNavLinks = navLinks.filter((link) => !link.permission || hasPermission(link.permission))

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-300/30 bg-white/90 backdrop-blur-lg dark:bg-gray-900/90 px-4 py-3 shadow-md flex items-center justify-between rounded-b-lg transition-all duration-200">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[350px]">
            <SheetHeader className="mb-6">
              <SheetTitle className="flex items-center gap-2">
                <img src={Freelansters} alt="Freelansters logo" width={32} height={32} />
                <span className="text-primary">Admin Panel</span>
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-2">
              {admin && (
                <div className="flex items-center gap-3 p-3 mb-4 bg-muted/50 rounded-lg">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${admin.name}`}
                      alt={admin.name}
                    />
                    <AvatarFallback>{admin.name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{admin.name}</p>
                    <p className="text-xs text-muted-foreground">{admin.email}</p>
                  </div>
                </div>
              )}

              {filteredNavLinks.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-base">
                    <span className="mr-3">{link.icon}</span>
                    {link.label}
                  </Button>
                </Link>
              ))}

              <Button
                variant="ghost"
                className="w-full justify-start text-base mt-2"
                onClick={() => {
                  setTheme(theme === "dark" ? "light" : "dark")
                }}
              >
                <span className="mr-3">
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5 text-yellow-400" />
                  ) : (
                    <Moon className="h-5 w-5 text-blue-500" />
                  )}
                </span>
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </Button>

              <Button
                variant="destructive"
                className="w-full justify-start text-base mt-4"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  handleLogout()
                }}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link to="/admin/adminpanel" className="flex items-center gap-2 text-lg md:text-xl font-bold text-primary">
          <img
            src={Freelansters || "/placeholder.svg"}
            alt="Freelansters logo"
            width={36}
            height={36}
            className="transition-transform duration-300 hover:scale-110"
          />
          <span className="hidden sm:inline">Admin Panel</span>
        </Link>
      </div>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center gap-1">
        {filteredNavLinks.map((link) => (
          <Link key={link.path} to={link.path}>
            <Button
              variant="ghost"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              {link.icon}
              <span>{link.label}</span>
            </Button>
          </Link>
        ))}
      </div>

      {/* Right Section: Theme Toggle & User Info */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex h-9 w-9 rounded-full hover:bg-muted transition-colors"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-blue-500" />}
        </Button>

        {/* Admin Profile Dropdown */}
        {admin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-8 w-8 border-2 border-primary/20">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${admin.name}`} alt={admin.name} />
                  <AvatarFallback>{admin.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium line-clamp-1">{admin.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{admin.email}</p>
                </div>
                <ChevronDown className="h-4 w-4 hidden sm:block opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{admin.name}</p>
                  <p className="text-xs text-muted-foreground">{admin.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2">
                <Badge variant="outline" className="text-xs font-normal">
                  Admin
                </Badge>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-xs text-muted-foreground">
                <span>Permissions:</span>
                <div className="flex flex-wrap gap-1">
                  {admin.permissions?.map((permission) => (
                    <Badge key={permission} variant="secondary" className="text-[10px]">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Logout Button (Mobile) */}
        <Button
          variant="destructive"
          size="icon"
          className="sm:hidden h-9 w-9"
          onClick={handleLogout}
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  )
}

export default AdminNavbar

