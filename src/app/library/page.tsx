"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { 
  Search, 
  Filter, 
  MessageSquare, 
  FileText, 
  Code, 
  Image,
  FileVideo,
  BookOpen,
  Clock,
  Calendar,
  Trash2,
  Download,
  Share2,
  Star,
  StarIcon,
  FileSpreadsheet,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { ReactNode } from "react"

// Define types for the history items
interface ChatMessage {
  role: string;
  content: string;
}

type PreviewContent = string | ChatMessage[];

interface HistoryItem {
  id: number;
  type: 'chat' | 'document' | 'code' | 'image' | 'video' | 'manual' | 'guide' | 'specifications';
  title: string;
  date: string;
  time: string;
  tags: string[];
  preview: PreviewContent;
  favorite: boolean;
  language?: string;
}

interface GroupedItems {
  date: string;
  items: HistoryItem[];
}

// Improved mock data with more realistic entries and content previews
const historyItems: HistoryItem[] = [
  { 
    id: 1, 
    type: 'chat', 
    title: 'AI Chat: Web Development Discussion', 
    date: '2025-04-15', 
    time: '14:32',
    tags: ['web', 'javascript'],
    preview: [
      { role: 'user', content: 'Can you help me with a web development project?' },
      { role: 'ai', content: "I'd be happy to help with your web development project. What are you working on specifically?" }
    ],
    favorite: false
  },
  { 
    id: 2, 
    type: 'document', 
    title: 'Research Paper Summary', 
    date: '2025-04-14', 
    time: '10:15',
    tags: ['research', 'science'],
    preview: 'This document contains a summary of recent advancements in renewable energy technologies, focusing on solar and wind power integration.',
    favorite: true
  },
  { 
    id: 3, 
    type: 'code', 
    title: 'React Component Library', 
    date: '2025-04-13', 
    time: '16:45',
    tags: ['react', 'typescript'],
    language: 'typescript',
    preview: `import React from 'react';
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}
export const Button = ({ variant = 'primary', size = 'md', children }: ButtonProps) => {
  // Component implementation
};`,
    favorite: false
  },
  { 
    id: 4, 
    type: 'image', 
    title: 'Generated Landscape', 
    date: '2025-04-12', 
    time: '09:22',
    tags: ['art', 'landscape'],
    preview: '/assets/sample-landscape.jpg',
    favorite: false
  },
  { 
    id: 5, 
    type: 'video', 
    title: 'Product Explainer Animation', 
    date: '2025-04-11', 
    time: '11:50',
    tags: ['animation', 'product'],
    preview: '/assets/sample-video-thumbnail.jpg',
    favorite: false
  },
  {
    id: 6,
    type: 'manual',
    title: 'LYRIQ Owner\'s Manual',
    date: '2025-04-10',
    time: '15:20',
    tags: ['cadillac', 'lyriq', 'manual'],
    preview: 'Comprehensive owner\'s manual with detailed instructions for operating and maintaining your LYRIQ.',
    favorite: true
  },
  {
    id: 7,
    type: 'guide',
    title: 'OPTIQ Quick Start Guide',
    date: '2025-04-09',
    time: '13:45',
    tags: ['cadillac', 'optiq', 'guide'],
    preview: 'Essential information to get started with your new OPTIQ.',
    favorite: false
  },
  {
    id: 8,
    type: 'specifications',
    title: 'LYRIQ Technical Specifications',
    date: '2025-04-08',
    time: '10:30',
    tags: ['cadillac', 'lyriq', 'specifications'],
    preview: 'Detailed technical specifications including performance metrics, battery information, and dimensions.',
    favorite: false
  },
  {
    id: 9,
    type: 'chat',
    title: 'AI Chat: Charging Station Locations',
    date: '2025-04-07',
    time: '16:15',
    tags: ['charging', 'locations'],
    preview: [
      { role: 'user', content: 'Where can I find charging stations near Boston?' },
      { role: 'ai', content: 'I can help you locate charging stations in the Boston area. There are several public charging networks available...' }
    ],
    favorite: false
  },
  {
    id: 10,
    type: 'document',
    title: 'Warranty Information',
    date: '2025-04-06',
    time: '14:10',
    tags: ['warranty', 'support'],
    preview: 'Details about your vehicle warranty coverage, including battery warranty and extended protection options.',
    favorite: true
  }
]

const typeIcons = {
  chat: <MessageSquare className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  code: <Code className="h-4 w-4" />,
  image: <Image className="h-4 w-4" />,
  video: <FileVideo className="h-4 w-4" />,
  manual: <BookOpen className="h-4 w-4" />,
  guide: <Clock className="h-4 w-4" />,
  specifications: <FileSpreadsheet className="h-4 w-4" />
}

const typeLabels = {
  chat: "Chat",
  document: "Document",
  code: "Code",
  image: "Image",
  video: "Video",
  manual: "Manual",
  guide: "Guide",
  specifications: "Specifications"
}

// Group function to organize items by date
const groupByDate = (items: HistoryItem[]): GroupedItems[] => {
  const groups: Record<string, HistoryItem[]> = {};
  
  items.forEach(item => {
    if (!groups[item.date]) {
      groups[item.date] = [];
    }
    groups[item.date].push(item);
  });
  
  return Object.entries(groups).map(([date, items]) => ({
    date,
    items
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export default function LibraryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedItem, setSelectedItem] = useState<HistoryItem>(historyItems[0])
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [groupView, setGroupView] = useState<"list" | "date">("list")
  const [items, setItems] = useState<HistoryItem[]>(historyItems)
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all")

  // Filter items based on search query, active tab, and date filter
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesTab = activeTab === "all" || item.type === activeTab
    
    // Date filtering
    const itemDate = new Date(item.date);
    const today = new Date();
    const isToday = itemDate.toDateString() === today.toDateString();
    const isThisWeek = itemDate >= new Date(today.setDate(today.getDate() - 7));
    const isThisMonth = itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear();
    
    const matchesDateFilter = 
      dateFilter === "all" || 
      (dateFilter === "today" && isToday) ||
      (dateFilter === "week" && isThisWeek) ||
      (dateFilter === "month" && isThisMonth);
    
    return matchesSearch && matchesTab && matchesDateFilter;
  });

  // Group filtered items by date
  const groupedItems = groupByDate(filteredItems);

  // Navigate to the original content
  const navigateToContent = (item: HistoryItem) => {
    switch(item.type) {
      case 'chat':
        router.push('/chat');
        break;
      case 'document':
        router.push('/documents');
        break;
      case 'manual':
        router.push('/manuals');
        break;
      case 'guide':
        router.push('/guides');
        break;
      case 'specifications':
        router.push('/specifications');
        break;
      default:
        // Stay on current page for other types
        break;
    }
  };

  // Toggle favorite status
  const toggleFavorite = (id: number) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, favorite: !item.favorite } : item
      )
    );
  };

  // Delete selected items
  const deleteSelected = () => {
    setItems(prevItems => 
      prevItems.filter(item => !selectedItems.includes(item.id))
    );
    setSelectedItems([]);
  };

  // Toggle item selection for bulk actions
  const toggleItemSelection = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return format(date, "MMMM d, yyyy");
    }
  };

  // Helper function to render preview content based on type
  const renderPreview = (item: HistoryItem): ReactNode => {
    if (item.type === 'chat' && Array.isArray(item.preview)) {
      return (
        <div className="space-y-4">
          {(item.preview as ChatMessage[]).map((message, idx) => (
            <div key={idx} className={`${message.role === 'user' ? 'bg-muted' : 'bg-primary/10'} p-3 rounded`}>
              <p className="text-sm font-medium mb-1">{message.role === 'user' ? 'User' : 'AI'}</p>
              <p>{message.content}</p>
            </div>
          ))}
        </div>
      );
    }
    
    return <p>{item.preview as string}</p>;
  };

  // Helper function to get preview text for download/share
  const getPreviewText = (preview: PreviewContent): string => {
    if (typeof preview === 'string') {
      return preview;
    }
    
    return preview.map(msg => `${msg.role}: ${msg.content}`).join('\n');
  };

  return (
    <div className="flex flex-col space-y-4 max-w-7xl mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h1 className="text-3xl font-bold mb-2 md:mb-0">History</h1>
        <p className="text-muted-foreground mb-4 md:mb-0">Access your past conversations, documents, and other content</p>
      </div>
      
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            {selectedItems.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={deleteSelected}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete {selectedItems.length > 1 ? `(${selectedItems.length})` : ''}
              </Button>
            )}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search history..."
                className="pl-8 w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setActiveTab("all")}>
                  All Items
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveTab("favorite")}>
                  <Star className="h-4 w-4 mr-2" /> Favorites
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveTab("chat")}>
                  <MessageSquare className="h-4 w-4 mr-2" /> Chats
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("document")}>
                  <FileText className="h-4 w-4 mr-2" /> Documents
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("manual")}>
                  <BookOpen className="h-4 w-4 mr-2" /> Manuals
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  {dateFilter === "all" ? "All Time" : 
                   dateFilter === "today" ? "Today" : 
                   dateFilter === "week" ? "This Week" : "This Month"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setDateFilter("all")}>
                  All Time
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter("today")}>
                  Today
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter("week")}>
                  This Week
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter("month")}>
                  This Month
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setGroupView(prev => prev === "list" ? "date" : "list")}
            >
              <Filter className="h-4 w-4 mr-2" />
              {groupView === "list" ? "Group by Date" : "List View"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 md:grid-cols-8 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="chat">Chats</TabsTrigger>
            <TabsTrigger value="document">Documents</TabsTrigger>
            <TabsTrigger value="manual">Manuals</TabsTrigger>
            <TabsTrigger value="guide">Guides</TabsTrigger>
            <TabsTrigger value="specifications">Specs</TabsTrigger>
            <TabsTrigger value="image">Images</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
              <div className="border rounded-md h-[calc(100vh-16rem)] overflow-y-auto">
                {groupView === "list" ? (
                  <ul className="divide-y divide-gray-200">
                    {filteredItems.length > 0 ? filteredItems.map(item => (
                      <li 
                        key={item.id}
                        className={`p-4 cursor-pointer hover:bg-accent ${selectedItem.id === item.id ? 'bg-accent' : ''}`}
                      >
                        <div className="flex items-start">
                          <Checkbox 
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={() => toggleItemSelection(item.id)}
                            className="mr-3 mt-1"
                          />
                          <div className="flex-1" onClick={() => setSelectedItem(item)}>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center">
                                <div className="bg-primary/10 p-1.5 rounded-full mr-2">
                                  {typeIcons[item.type as keyof typeof typeIcons]}
                                </div>
                                <span className="font-medium text-base">{item.title}</span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(item.id);
                                }}
                              >
                                {item.favorite ? 
                                  <StarIcon className="h-5 w-5 text-yellow-400" /> : 
                                  <Star className="h-5 w-5" />
                                }
                              </Button>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                              <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                                {typeLabels[item.type as keyof typeof typeLabels]}
                              </Badge>
                              <span>{item.date} • {item.time}</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.tags.map(tag => (
                                <span key={tag} className="bg-secondary/40 px-2 py-0.5 rounded-full text-xs">{tag}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </li>
                    )) : (
                      <div className="p-4 text-center text-muted-foreground">
                        No items found
                      </div>
                    )}
                  </ul>
                ) : (
                  <div>
                    {groupedItems.length > 0 ? groupedItems.map(group => (
                      <div key={group.date}>
                        <div className="sticky top-0 bg-background p-3 border-b font-medium">
                          {formatDisplayDate(group.date)}
                        </div>
                        <ul className="divide-y divide-gray-200">
                          {group.items.map((item: HistoryItem) => (
                            <li 
                              key={item.id}
                              className={`p-4 cursor-pointer hover:bg-accent ${selectedItem.id === item.id ? 'bg-accent' : ''}`}
                            >
                              <div className="flex items-start">
                                <Checkbox 
                                  checked={selectedItems.includes(item.id)}
                                  onCheckedChange={() => toggleItemSelection(item.id)}
                                  className="mr-3 mt-1"
                                />
                                <div className="flex-1" onClick={() => setSelectedItem(item)}>
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center">
                                      <div className="bg-primary/10 p-1.5 rounded-full mr-2">
                                        {typeIcons[item.type as keyof typeof typeIcons]}
                                      </div>
                                      <span className="font-medium text-base">{item.title}</span>
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-7 w-7 p-0" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(item.id);
                                      }}
                                    >
                                      {item.favorite ? 
                                        <StarIcon className="h-5 w-5 text-yellow-400" /> : 
                                        <Star className="h-5 w-5" />
                                      }
                                    </Button>
                                  </div>
                                  <div className="flex justify-between items-center mt-2">
                                    <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                                      {typeLabels[item.type as keyof typeof typeLabels]}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">{item.time}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {item.tags.map((tag: string) => (
                                      <span key={tag} className="bg-secondary/40 px-2 py-0.5 rounded-full text-xs">{tag}</span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )) : (
                      <div className="p-4 text-center text-muted-foreground">
                        No items found
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Card className="h-[calc(100vh-16rem)] overflow-hidden">
                {selectedItem && (
                  <>
                    <CardContent className="p-6 h-[calc(100%-60px)] overflow-auto">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-primary/10 p-2 rounded-full">
                            {typeIcons[selectedItem.type as keyof typeof typeIcons]}
                          </div>
                          <h2 className="text-xl font-semibold">{selectedItem.title}</h2>
                        </div>
                        <Badge variant="outline" className="px-3 py-1">
                          {typeLabels[selectedItem.type as keyof typeof typeLabels]}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedItem.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="px-2 py-1 text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-6">
                        Accessed on {selectedItem.date} at {selectedItem.time}
                      </div>
                      
                      <div className="pt-4 border-t">
                        {renderPreview(selectedItem)}
                      </div>
                    </CardContent>
                    
                    <CardFooter className="border-t p-4 flex justify-between">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigateToContent(selectedItem)}>
                          Open Original
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toggleFavorite(selectedItem.id)}
                        >
                          {selectedItem.favorite ? (
                            <>
                              <StarIcon className="h-4 w-4 mr-2 text-yellow-400" />
                              Remove Favorite
                            </>
                          ) : (
                            <>
                              <Star className="h-4 w-4 mr-2" />
                              Add to Favorites
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const text = getPreviewText(selectedItem.preview);
                            const blob = new Blob([text], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${selectedItem.title}.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardFooter>
                  </>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Content for other tabs would be similar structure */}
          {Object.keys(typeLabels).map(tabKey => (
            tabKey !== "all" && (
              <TabsContent key={tabKey} value={tabKey} className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
                  {/* Similar content as "all" tab but filtered for this specific type */}
                  <div className="border rounded-md h-[calc(100vh-16rem)] overflow-y-auto">
                    <ul className="divide-y divide-gray-200">
                      {filteredItems.length > 0 ? filteredItems.map(item => (
                        item.type === tabKey && (
                          <li 
                            key={item.id}
                            className={`p-4 cursor-pointer hover:bg-accent ${selectedItem.id === item.id ? 'bg-accent' : ''}`}
                            onClick={() => setSelectedItem(item)}
                          >
                            <div className="flex items-start">
                              <div className="bg-primary/10 p-1.5 rounded-full mr-3">
                                {typeIcons[item.type as keyof typeof typeIcons]}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <span className="font-medium text-base">{item.title}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 w-7 p-0" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavorite(item.id);
                                    }}
                                  >
                                    {item.favorite ? 
                                      <StarIcon className="h-5 w-5 text-yellow-400" /> : 
                                      <Star className="h-5 w-5" />
                                    }
                                  </Button>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                  <span>{item.date} • {item.time}</span>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {item.tags.map((tag: string) => (
                                    <span key={tag} className="bg-secondary/40 px-2 py-0.5 rounded-full text-xs">{tag}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </li>
                        )
                      )) : (
                        <div className="p-4 text-center text-muted-foreground">
                          No {typeLabels[tabKey as keyof typeof typeLabels]} found
                        </div>
                      )}
                    </ul>
                  </div>

                  <Card className="h-[calc(100vh-16rem)] overflow-hidden">
                    {/* Content preview - same as in "all" tab */}
                  </Card>
                </div>
              </TabsContent>
            )
          ))}
        </Tabs>
      </div>
    </div>
  )
} 