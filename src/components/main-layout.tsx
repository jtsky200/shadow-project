"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Topbar } from "@/components/topbar"
import { SidebarNav, sidebarNavItems } from "@/components/ui/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  // Track pathname changes to help with navigation
  const pathname = usePathname()
  const prevPathRef = useRef(pathname)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  // Memoize the toggle handler to prevent recreating it on each render
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    // Only add event listeners if the sidebar is open
    if (!sidebarOpen) return;
    
    const handleOutsideClick = (event: MouseEvent) => {
      if ((event.target as Element).closest('[data-sidebar]') === null) {
        setSidebarOpen(false)
      }
    }

    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [sidebarOpen])

  // Handle pathname changes to close sidebar
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      setSidebarOpen(false);
      setIsNavigating(true);
      
      // Reset the navigating state after a short delay
      const timeoutId = setTimeout(() => {
        setIsNavigating(false);
        prevPathRef.current = pathname;
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [pathname]);
  
  return (
    <div className="flex min-h-screen flex-col">
      <Topbar />
      <div className="flex flex-1">
        {/* Sidebar for desktop */}
        <aside className="hidden w-72 border-r md:block" data-sidebar>
          <div className="flex h-full flex-col">
            <div className="space-y-4 py-6">
              <div className="px-6 py-2">
                <SidebarNav items={sidebarNavItems} />
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 border-r bg-background transition-transform md:hidden",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
          data-sidebar
        >
          <div className="flex h-14 items-center justify-between border-b px-6">
            <p className="font-semibold">Menu</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="py-6 px-2">
            <SidebarNav items={sidebarNavItems} />
          </div>
        </aside>

        {/* Mobile toggle */}
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 left-6 z-40 rounded-full shadow-md md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Main content */}
        <main className={cn(
          "flex-1 overflow-auto p-6 md:p-8 mx-auto w-full",
          isNavigating && "opacity-70 transition-opacity"
        )}>
          {children}
        </main>
      </div>
    </div>
  )
} 