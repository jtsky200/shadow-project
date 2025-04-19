"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useMemo } from "react"
import {
  BookOpen,
  FileText,
  MessageSquare,
  FileSpreadsheet,
  Wrench,
  Clock,
  Cog,
  RefreshCw,
  Zap,
  Lightbulb
} from "lucide-react"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
    icon: React.ReactNode
  }[]
}

// Move the sidebarNavItems creation outside component to prevent recreation on every render
const createSidebarNavItems = () => [
  {
    title: "Chat",
    href: "/chat",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    title: "History",
    href: "/library",
    icon: <Clock className="h-5 w-5" />,
  },
  {
    title: "Documents",
    href: "/documents",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Manuals",
    href: "/manuals",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    title: "Quick Guides",
    href: "/guides",
    icon: <Lightbulb className="h-5 w-5" />,
  },
  {
    title: "Specifications",
    href: "/specifications",
    icon: <FileSpreadsheet className="h-4 w-4" />,
  },
  {
    title: "Tools",
    href: "/tools",
    icon: <Wrench className="h-5 w-5" />,
  },
  {
    title: "Troubleshooting",
    href: "/troubleshooting",
    icon: <Zap className="h-5 w-5" />,
  },
  {
    title: "System Updates",
    href: "/settings/update-system",
    icon: <RefreshCw className="h-5 w-5" />,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Cog className="h-5 w-5" />,
  },
];

// Use memoized version of the sidebarNavItems to prevent recreation on every render
export const sidebarNavItems = createSidebarNavItems();

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname()
  
  // Memoize the navigation items to prevent rerenders
  const navigationLinks = useMemo(() => {
    return items.map((item) => {
      const isActive = pathname === item.href;
      return (
        <Link 
          key={item.href}
          href={item.href} 
          replace={false}
          scroll={false}
          className={cn(
            "inline-flex items-center justify-start w-full px-4 py-2 rounded-md text-sm font-medium transition-all",
            isActive 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <span className="mr-3">{item.icon}</span>
          <span className="font-medium">{item.title}</span>
        </Link>
      );
    });
  }, [items, pathname]);

  return (
    <nav className={cn("flex flex-col space-y-1 w-full px-2", className)} {...props}>
      {navigationLinks}
    </nav>
  )
} 