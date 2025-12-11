import React, { useState } from 'react'
import { 
  Home, 
  Calendar, 
  Users, 
  MapPin, 
  BarChart3, 
  Settings, 
  Bell, 
  Search, 
  Menu, 
  X,
  LogOut,
  Building,
  CreditCard,
  UserCheck
} from 'lucide-react'
import { Button } from '../ui/button'

interface AdminLayoutProps {
  children: React.ReactNode
  currentPage?: string
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { name: 'Staff', href: '/admin/staff', icon: Users },
  { name: 'Customers', href: '/admin/customers', icon: UserCheck },
  { name: 'Service Areas', href: '/admin/service-areas', icon: MapPin },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Billing', href: '/admin/billing', icon: CreditCard },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ children, currentPage = 'Dashboard' }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border">
            <MobileSidebar onClose={() => setSidebarOpen(false)} currentPage={currentPage} />
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow bg-card border-r border-border">
            <Sidebar currentPage={currentPage} />
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col lg:ml-64">
          {/* Top Header */}
          <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
            <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold text-foreground">{currentPage}</h1>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Search..."
                    className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </div>
                
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                    3
                  </span>
                </Button>
                
                {/* Profile */}
                <div className="relative">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-foreground">JD</span>
                    </div>
                    <span className="hidden sm:block text-sm font-medium">John Doe</span>
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

function Sidebar({ currentPage }: { currentPage: string }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
        <Building className="h-8 w-8 text-primary" />
        <div className="flex flex-col">
          <span className="font-bold text-lg text-foreground">BookMyStaff</span>
          <span className="text-xs text-muted-foreground">Admin Portal</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = item.name === currentPage
          return (
            <a
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </a>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-4 py-4 border-t border-border">
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
          <LogOut className="h-5 w-5" />
          Sign out
        </Button>
      </div>
    </div>
  )
}

function MobileSidebar({ onClose, currentPage }: { onClose: () => void, currentPage: string }) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Building className="h-8 w-8 text-primary" />
          <div className="flex flex-col">
            <span className="font-bold text-lg text-foreground">BookMyStaff</span>
            <span className="text-xs text-muted-foreground">Admin Portal</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = item.name === currentPage
          return (
            <a
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
              onClick={onClose}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </a>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-4 py-4 border-t border-border">
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
          <LogOut className="h-5 w-5" />
          Sign out
        </Button>
      </div>
    </div>
  )
}