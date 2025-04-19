"use client"

import { useState, useEffect, useMemo } from "react"
import { 
  ChevronRight, 
  FileText, 
  Search,
  MessageSquare,
  Download
} from "lucide-react"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ClickableTag } from "@/components/ui/clickable-tag"
import { manualsService, type Manual as ManualType } from "@/lib/firebase-service"

// Replace existing Manual interface with the type from firebase-service
type Manual = ManualType;

interface TagFilter {
  name: string
  color: string
  key: string
  value: string
}

export default function ManualsPage() {
  const [manuals, setManuals] = useState<Manual[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [availableManuals, setAvailableManuals] = useState<Manual[]>([])
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  
  // Available tag filters - memoize to prevent recreation on every render
  const tagFilters = useMemo<TagFilter[]>(() => [
    { name: "Manual", color: "#4f46e5", key: "documentType", value: "manual" },
    { name: "Specs", color: "#9333ea", key: "documentType", value: "specification" },
    { name: "Guide", color: "#10b981", key: "documentType", value: "quickstart" },
    { name: "New", color: "#f43f5e", key: "label", value: "New" },
    { name: "LYRIQ", color: "#64748b", key: "model", value: "LYRIQ" },
    { name: "OPTIQ", color: "#64748b", key: "model", value: "OPTIQ" }
  ], []);
  
  // Add helper function to get document type details
  const getDocumentTypeTag = (documentType: string) => {
    let bgColor = "";
    const textColor = "text-white";
    let label = "";
    
    switch(documentType) {
      case "manual":
        bgColor = "bg-blue-500";
        label = "Manual";
        break;
      case "specification":
        bgColor = "bg-purple-500";
        label = "Specs";
        break;
      case "quickstart":
        bgColor = "bg-green-500";
        label = "Guide";
        break;
      default:
        bgColor = "bg-slate-500";
        label = "Document";
    }
    
    return { bgColor, textColor, label };
  };
  
  // Filter manuals based on search and active filters
  useEffect(() => {
    // Skip if manuals haven't loaded yet
    if (manuals.length === 0) return;
    
    // Create a local copy to avoid modifying the original array
    let filtered = [...manuals];
    
    // TEMPORARILY DISABLE THE NEW TAG CHECKING TO FIX INFINITE LOOP
    /* 
    // Check for viewed items in localStorage
    if (typeof window !== 'undefined') {
      const viewedNewTags = JSON.parse(localStorage.getItem('viewedNewTags') || '[]')
      
      // Update the manuals array with viewed status
      filtered = filtered.map(manual => {
        if (manual.label === "New") {
          const tagIdentifier = `${manual.id}-manual`
          if (viewedNewTags.includes(tagIdentifier)) {
            return { ...manual, label: undefined } // Remove the "New" label for viewed items
          }
        }
        return manual
      })
    }
    */
    
    // Apply text search filter
    if (searchQuery) {
      filtered = filtered.filter(manual => 
        manual.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        manual.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        manual.model.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Apply tag filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter(manual => {
        return activeFilters.some(filterName => {
          const filter = tagFilters.find(f => f.name === filterName)
          if (!filter) return false
          
          if (filter.key === "documentType") {
            if (filter.name === "Specs" && manual.documentType === "specification") return true
            if (filter.name === "Manual" && manual.documentType === "manual") return true
            if (filter.name === "Guide" && manual.documentType === "quickstart") return true
            return false
          } else if (filter.key === "model") {
            return manual.model === filter.value
          } else if (filter.key === "label") {
            return manual.label === filter.value
          }
          return false
        })
      })
    }
    
    setAvailableManuals(filtered)
  }, [searchQuery, activeFilters, tagFilters, manuals])
  
  // Load manuals from Firebase
  useEffect(() => {
    const fetchManuals = async () => {
      setLoading(true);
      try {
        const fetchedManuals = await manualsService.getAllManuals();
        if (fetchedManuals.length) {
          setManuals(fetchedManuals);
          setAvailableManuals(fetchedManuals);
        } else {
          // If no manuals in Firestore yet, use hardcoded data for initial setup (can be removed later)
          const defaultManuals: Manual[] = [
            {
              id: "lyriq-manual",
              title: "LYRIQ Owner's Manual",
              description: "Comprehensive guide to your LYRIQ's features, operations and maintenance",
              fileSize: "6.5 MB",
              pages: 350,
              year: "2024",
              model: "LYRIQ",
              path: "/manual?id=lyriq-manual",
              downloadPath: "/pdf/LYRIQ-24-Owner-Manual-EU-EN.pdf",
              label: "New",
              labelColor: "bg-green-500",
              documentType: "manual",
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: "lyriq-specifications",
              title: "LYRIQ Specifications",
              description: "Detailed technical specifications for the LYRIQ, including dimensions, performance, and features",
              fileSize: "550 KB",
              pages: 15,
              year: "2024",
              model: "LYRIQ",
              path: "/manual?id=lyriq-specifications",
              downloadPath: "/pdf/2024-CADILLAC-LYRIQ-SPECIFICATIONS-ENGLISH.pdf",
              documentType: "specification",
              createdAt: new Date(),
              updatedAt: new Date()
            }
            // Add other default manuals as needed
          ];
          setManuals(defaultManuals);
          setAvailableManuals(defaultManuals);
        }
      } catch (error) {
        console.error("Error fetching manuals:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchManuals();
  }, []);
  
  // Toggle a filter tag
  const handleTagClick = (tagName: string) => {
    setActiveFilters(prevFilters => 
      prevFilters.includes(tagName)
        ? prevFilters.filter(f => f !== tagName)
        : [...prevFilters, tagName]
    )
  }
  
  // Clear all filters
  const clearFilters = () => {
    setActiveFilters([])
    setSearchQuery("")
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Cadillac Vehicle Documentation</h1>
          <p className="text-muted-foreground text-lg">Access owner&apos;s manuals, specifications and guides for your Cadillac vehicle</p>
        </div>
        
        <div className="flex items-center mt-6 md:mt-0 space-x-4">
          <Button variant="outline" size="lg" asChild>
            <Link href="/documents?upload=true">
              <FileText className="mr-2 h-5 w-5" aria-hidden="true" />
              Upload Document
            </Link>
          </Button>
          <Button variant="default" size="lg" asChild>
            <Link href="/manual-chat">
              <MessageSquare className="mr-2 h-5 w-5" aria-hidden="true" />
              Ask About Manuals
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-sm font-medium mr-2">Filter by:</span>
        {tagFilters.map(filter => {
          let tagColor = filter.color;
          // Ensure tag colors match the screenshot
          if (filter.name === "Manual") tagColor = "#4f46e5";
          if (filter.name === "Specs") tagColor = "#9333ea";
          if (filter.name === "Guide") tagColor = "#10b981";
          if (filter.name === "New") tagColor = "#f43f5e";
          if (filter.name === "LYRIQ") tagColor = "#64748b";
          if (filter.name === "OPTIQ") tagColor = "#64748b";
          
          return (
            <ClickableTag
              key={filter.name}
              name={filter.name}
              color={tagColor}
              isActive={activeFilters.includes(filter.name)}
              onClick={handleTagClick}
              isNew={filter.name === "New"}
            />
          );
        })}
        {activeFilters.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="ml-2 h-7"
          >
            Clear filters
          </Button>
        )}
      </div>
      
      {/* Search bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" aria-hidden="true" />
        <Input 
          placeholder="Search manuals by title, model or description..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 py-6 text-lg"
          aria-label="Search manuals"
        />
      </div>
      
      {/* Tabs for different views */}
      <div className="border-b mb-8">
        <div className="flex space-x-6">
          <button 
            className={`pb-2 px-1 font-medium ${activeFilters.length === 0 && !searchQuery ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground'}`}
            onClick={clearFilters}
          >
            All Documents
          </button>
          <button 
            className={`pb-2 px-1 font-medium ${activeFilters.includes('Manual') ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground'}`}
            onClick={() => {
              setActiveFilters(['Manual']);
              setSearchQuery('');
            }}
          >
            Manuals
          </button>
          <button 
            className={`pb-2 px-1 font-medium ${activeFilters.includes('Specs') ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground'}`}
            onClick={() => {
              setActiveFilters(['Specs']);
              setSearchQuery('');
            }}
          >
            Specifications
          </button>
          <button 
            className={`pb-2 px-1 font-medium ${activeFilters.includes('LYRIQ') ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground'}`}
            onClick={() => {
              setActiveFilters(['LYRIQ']);
              setSearchQuery('');
            }}
          >
            LYRIQ
          </button>
          <button 
            className={`pb-2 px-1 font-medium ${activeFilters.includes('OPTIQ') ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground'}`}
            onClick={() => {
              setActiveFilters(['OPTIQ']);
              setSearchQuery('');
            }}
          >
            OPTIQ
          </button>
        </div>
      </div>
      
      {/* Document grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading manuals...</p>
        </div>
      ) : availableManuals.length === 0 ? (
        <div className="col-span-3 text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
          <h3 className="text-xl font-medium mb-2">No manuals found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or search query
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableManuals.map(manual => (
            <Card key={manual.id} className="overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{manual.title}</CardTitle>
                  {manual.label && (
                    <div 
                      className="h-4 w-4 rounded-full bg-[#ff7b00]" 
                      title="New document" 
                      aria-label="New document"
                    ></div>
                  )}
                </div>
              </CardHeader>
              
              <div className="px-6 pb-2 flex-grow">
                {/* Year/Model/Document Type Tags */}
                <div className="flex mb-4 gap-1 flex-wrap">
                  {/* Document type tag */}
                  {(() => {
                    const { bgColor, textColor, label } = getDocumentTypeTag(manual.documentType);
                    return (
                      <div className={`${bgColor} ${textColor} text-xs px-2 py-0.5 rounded flex items-center mr-1`}>
                        {label}
                      </div>
                    );
                  })()}
                  <div className="bg-slate-100 text-slate-700 px-2 py-0.5 text-xs rounded border border-slate-200">
                    {manual.year}
                  </div>
                  <div className="bg-slate-600 text-white px-2 py-0.5 text-xs rounded">
                    {manual.model}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">{manual.description}</p>
                
                {/* Empty box for thumbnails as shown in screenshot */}
                <div className="border border-slate-200 rounded-md h-24 mb-4 flex items-center justify-center text-muted-foreground">
                  {/* Thumbnail placeholder */}
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" aria-hidden="true" />
                    <span>{manual.pages} pages</span>
                  </div>
                  <span className="mx-1">•</span>
                  <span>{manual.fileSize}</span>
                </div>
              </div>
              
              <CardFooter className="flex justify-between pt-3 pb-3 border-t mt-auto">
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href={manual.downloadPath} 
                    download
                    aria-label={`Download ${manual.title}`}
                  >
                    <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                    Download
                  </a>
                </Button>
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600" asChild>
                  <Link 
                    href={manual.path}
                    aria-label={`View ${manual.documentType === "specification" ? "Specs" : "Manual"} for ${manual.title}`}
                  >
                    {manual.documentType === "specification" ? "View Specs" : "View Manual"}
                    <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 