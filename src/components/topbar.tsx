"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Bell, 
  Search, 
  Settings, 
  User, 
  LogOut, 
  FileText, 
  HelpCircle,
  LayoutDashboard,
  Zap,
  BookOpenCheck,
  AreaChart
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

// Define types for search items
interface SearchItem {
  id?: string
  name: string
  href: string
  description?: string
  shortcut?: string
  icon?: React.ReactNode
  score?: number
  category?: string
}

// Define type for recent searches
interface RecentSearch {
  query: string
  timestamp: string
}

// Define search suggestion categories and items
const searchSuggestions: Array<{ category: string, items: SearchItem[] }> = [
  {
    category: "Pages",
    items: [
      {
        id: "dashboard",
        name: "Dashboard",
        description: "View your vehicle status and information",
        href: "/",
        icon: <LayoutDashboard className="mr-2 h-4 w-4" />
      },
      {
        id: "chat",
        name: "Chat",
        description: "Chat with Shadow AI about your vehicle",
        href: "/chat",
        icon: <Zap className="mr-2 h-4 w-4" />
      },
      {
        id: "library",
        name: "Library",
        description: "Browse your vehicle documents",
        href: "/library",
        icon: <BookOpenCheck className="mr-2 h-4 w-4" />
      },
      {
        id: "manuals",
        name: "Manuals",
        description: "View vehicle manuals and guides",
        href: "/manuals",
        icon: <FileText className="mr-2 h-4 w-4" />
      },
      {
        id: "statistics",
        name: "Statistics",
        description: "Vehicle usage statistics and trends",
        href: "/statistics",
        icon: <AreaChart className="mr-2 h-4 w-4" />
      },
      {
        id: "help",
        name: "Help & Support",
        description: "Get help with using Shadow AI",
        href: "/help",
        icon: <HelpCircle className="mr-2 h-4 w-4" />
      }
    ]
  }
];

export function Topbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSearches = localStorage.getItem("recentSearches");
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }
    }
  }, []);

  // Effect to handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Intelligent search function that filters and ranks suggestions
  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    // Normalize the query
    const normalizedQuery = query.toLowerCase().trim();
    
    // Search across all categories and items
    const results: SearchItem[] = [];
    
    searchSuggestions.forEach(category => {
      category.items.forEach(item => {
        const nameMatch = item.name.toLowerCase().includes(normalizedQuery);
        
        // Calculate relevance score based on how closely it matches
        let score = 0;
        if (nameMatch) {
          // Exact match gets highest score
          if (item.name.toLowerCase() === normalizedQuery) {
            score = 100;
          } 
          // Starting with the query gets high score
          else if (item.name.toLowerCase().startsWith(normalizedQuery)) {
            score = 75;
          } 
          // Contains the query gets medium score
          else {
            score = 50;
          }
        }
        
        // Only include results with a score
        if (score > 0) {
          results.push({
            ...item,
            category: category.category,
            score: score
          });
        }
      });
    });
    
    // Sort by relevance score (highest first)
    results.sort((a, b) => (b.score || 0) - (a.score || 0));
    
    setSearchResults(results);
  };

  // Handle search submission
  const handleSearch = (value: string) => {
    // Save to recent searches
    const newRecentSearches = [
      { query: value, timestamp: new Date().toISOString() },
      ...recentSearches.filter(item => item.query !== value).slice(0, 4)
    ];
    setRecentSearches(newRecentSearches);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem("recentSearches", JSON.stringify(newRecentSearches));
    }
    
    // Close the dialog
    setOpen(false);
    
    // Navigate to search results page
    router.push(`/search?q=${encodeURIComponent(value)}`);
  };

  // Handle clicking on a suggestion
  const handleSelectItem = (item: SearchItem) => {
    // Save to recent searches
    const newRecentSearches = [
      { query: item.name, timestamp: new Date().toISOString() },
      ...recentSearches.filter(search => search.query !== item.name).slice(0, 4)
    ];
    setRecentSearches(newRecentSearches);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem("recentSearches", JSON.stringify(newRecentSearches));
    }
    
    // Close the dialog
    setOpen(false);
    
    // Navigate to the item's URL
    router.push(item.href);
  };

  // Function to clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem("recentSearches");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="hidden font-bold sm:inline-block">Shadow AI</span>
            </Link>
          </div>

          {/* Centered search bar */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="search"
                placeholder="Search everything... (Press / or Ctrl+K)"
                className="w-full rounded-md bg-background pl-8 md:w-[240px] lg:w-[340px]"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  performSearch(e.target.value);
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery) {
                    handleSearch(searchQuery);
                  }
                }}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="" alt="Profile" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Command Dialog for intelligent search */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search across all pages..."
          value={searchQuery}
          onValueChange={(value) => {
            setSearchQuery(value);
            performSearch(value);
          }}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {searchQuery === "" && recentSearches.length > 0 && (
            <CommandGroup heading="Recent Searches">
              {recentSearches.map((item) => (
                <CommandItem
                  key={item.timestamp}
                  onSelect={() => handleSearch(item.query)}
                >
                  <Search className="mr-2 h-4 w-4" />
                  <span>{item.query}</span>
                </CommandItem>
              ))}
              <CommandItem
                onSelect={() => {
                  clearRecentSearches();
                }}
                className="text-muted-foreground justify-end text-xs"
              >
                Clear recent searches
              </CommandItem>
            </CommandGroup>
          )}
          
          {searchQuery === "" && (
            <>
              {searchSuggestions.map((category) => (
                <CommandGroup key={category.category} heading={category.category}>
                  {category.items.map((item) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => handleSelectItem(item)}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </>
          )}
          
          {searchResults.length > 0 && (
            <>
              <CommandGroup heading="Search Results">
                {searchResults.map((result) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleSelectItem(result)}
                  >
                    {result.icon}
                    <span>{result.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {result.category}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
} 