import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { useEffect, useState, useMemo } from 'react';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

import { 
  Search, 
  Download, 
  ChevronDown, 
  ChevronUp,
  FileDown, 
  ImageDown, 
  FileText, 
  Languages,
  BookOpen,
  Tag,
  Brain,
  Sparkles,
  MessageSquare
} from 'lucide-react';

import axios from 'axios';

const ITEMS_PER_PAGE = 5;
const AVAILABLE_LANGUAGES = ['English', 'German', 'French', 'Spanish'];

// Cosine similarity function for finding semantically similar content
const cosineSimilarity = (a, b) => {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
};

export default function ManualViewer() {
  // URL query param handling with Next.js
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);

  // State
  const [manualData, setManualData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('both'); // 'ocr', 'pdf', or 'both'
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [selectedPageFilter, setSelectedPageFilter] = useState('all');
  const [expandedPages, setExpandedPages] = useState({});
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  
  // Semantic search state
  const [semanticQuery, setSemanticQuery] = useState('');
  const [sortedResults, setSortedResults] = useState([]);
  const [semanticSearchLoading, setSemanticSearchLoading] = useState(false);
  
  // DeepSeek chat state
  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Fetch manual data
  useEffect(() => {
    const fetchManualData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/assets/manual/manual-content.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch manual data: ${response.status}`);
        }
        const data = await response.json();
        setManualData(data);
        
        // Extract all unique tags across pages
        const allTags = new Set();
        data.forEach(page => {
          if (page.tags && Array.isArray(page.tags)) {
            page.tags.forEach(tag => allTags.add(tag));
          }
        });
        setAvailableTags(Array.from(allTags));
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchManualData();
  }, []);

  // Update URL when page changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', currentPage.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  }, [currentPage, router, searchParams]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
    
    // Update URL to page 1
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    router.push(`?${params.toString()}`, { scroll: false });
  }, [searchQuery, selectedPageFilter, selectedTags, router, searchParams]);

  // Toggle expand/collapse for a page
  const toggleExpand = (pageNumber) => {
    setExpandedPages(prev => ({
      ...prev,
      [pageNumber]: !prev[pageNumber]
    }));
  };

  // Toggle tag selection
  const toggleTag = (tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  // Semantic search function
  const handleSemanticSearch = async () => {
    try {
      setSemanticSearchLoading(true);
      
      // Get embedding for query
      const response = await axios.post('/api/embeddings', {
        text: semanticQuery
      });
      
      const queryEmbedding = response.data.embedding;
      
      // Filter and calculate similarity scores
      const results = manualData
        .filter(p => p.embedding)
        .map(entry => ({
          ...entry,
          similarity: cosineSimilarity(queryEmbedding, entry.embedding),
        }))
        .sort((a, b) => b.similarity - a.similarity);
      
      setSortedResults(results);
      setSemanticSearchLoading(false);
    } catch (err) {
      console.error('Semantic search error:', err);
      setError('Failed to perform semantic search');
      setSemanticSearchLoading(false);
    }
  };
  
  // DeepSeek chat function
  const handleChatQuery = async () => {
    try {
      setChatLoading(true);
      
      // Find relevant context using embeddings
      const response = await axios.post('/api/embeddings', {
        text: chatQuery
      });
      
      const queryEmbedding = response.data.embedding;
      
      // Get top 5 most relevant entries
      const topMatches = manualData
        .filter(entry => entry.embedding)
        .map(entry => ({
          ...entry,
          score: cosineSimilarity(queryEmbedding, entry.embedding),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      
      const contextText = topMatches.map(m => m.ocrText || m.rawText).join('\n---\n');
      
      // Ask DeepSeek with context
      const chatResponse = await axios.post('/api/chat', {
        message: chatQuery,
        manualId: 'cadillac',
        context: contextText
      });
      
      setChatResponse(chatResponse.data.response);
      setChatLoading(false);
    } catch (err) {
      console.error('Chat query error:', err);
      setError('Failed to process chat query');
      setChatLoading(false);
    }
  };

  // Filter and search
  const filteredData = useMemo(() => {
    // If we have semantic search results, use those instead
    if (sortedResults.length > 0) {
      return sortedResults;
    }
    
    return manualData.filter(page => {
      // Filter by page number if specific page selected
      if (selectedPageFilter !== 'all' && page.page !== parseInt(selectedPageFilter, 10)) {
        return false;
      }
      
      // Filter by tags if any selected
      if (selectedTags.length > 0) {
        if (!page.tags || !selectedTags.some(tag => page.tags.includes(tag))) {
          return false;
        }
      }

      // Search functionality
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const ocrMatch = page.ocrText && page.ocrText.toLowerCase().includes(query);
        const rawMatch = page.rawText && page.rawText.toLowerCase().includes(query);
        return ocrMatch || rawMatch;
      }
      
      return true;
    });
  }, [manualData, searchQuery, selectedPageFilter, selectedTags, sortedResults]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const displayData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  // Get all available page numbers for the filter dropdown
  const availablePages = useMemo(() => {
    return manualData.map(page => page.page);
  }, [manualData]);

  // Highlight search terms in text
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800">{part}</mark> 
        : part
    );
  };

  // Handle page downloads
  const handleDownloadImage = (page) => {
    const url = `/assets/manual/page-${page.page}.jpg`;
    window.open(url, '_blank');
  };

  const handleDownloadOcrText = (page) => {
    const blob = new Blob([page.ocrText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `page-${page.page}-ocr.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadFullManual = () => {
    window.open('/assets/manual/manual.pdf', '_blank');
  };

  // Clear search results
  const handleClearSearchResults = () => {
    setSortedResults([]);
    setSemanticQuery('');
  };

  // Render loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Manual Viewer</h1>
        <div className="grid gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 mb-4" />
                <Skeleton className="h-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Manual Viewer</h1>
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Error Loading Manual</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manual Viewer</h1>
      
      {/* New: Tabs for different search methods */}
      <Tabs defaultValue="standard" className="mb-6">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px] mx-auto mb-4">
          <TabsTrigger value="standard">
            <Search className="h-4 w-4 mr-2" />
            Standard Search
          </TabsTrigger>
          <TabsTrigger value="semantic">
            <Brain className="h-4 w-4 mr-2" />
            Semantic Search
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageSquare className="h-4 w-4 mr-2" />
            AI Chat
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="standard">
          {/* Standard Controls */}
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
            {/* Search */}
            <div className="flex items-center w-full md:w-1/3 relative">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search manual content..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* View mode toggle */}
            <Tabs defaultValue={viewMode} className="w-full md:w-auto" onValueChange={setViewMode}>
              <TabsList className="grid grid-cols-3 w-full md:w-[300px]">
                <TabsTrigger value="ocr">OCR Text</TabsTrigger>
                <TabsTrigger value="pdf">PDF Text</TabsTrigger>
                <TabsTrigger value="both">Both</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Page filter */}
            <Select value={selectedPageFilter} onValueChange={setSelectedPageFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All pages</SelectItem>
                {availablePages.map(page => (
                  <SelectItem key={page} value={page.toString()}>Page {page}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Language switcher */}
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Languages className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_LANGUAGES.map(lang => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Download full manual */}
            <Button variant="outline" onClick={handleDownloadFullManual} className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              Download Manual
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="semantic">
          {/* Semantic Search Controls */}
          <div className="space-y-4 max-w-3xl mx-auto mb-6">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Semantic Search</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Search by meaning instead of exact text matches. This leverages AI embeddings to find contextually relevant manual content.
            </p>
            <div className="flex gap-2">
              <Input 
                placeholder="Ask about the manual..." 
                value={semanticQuery} 
                onChange={e => setSemanticQuery(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleSemanticSearch}
                disabled={semanticSearchLoading || !semanticQuery.trim()}
                className="gap-2"
              >
                {semanticSearchLoading ? (
                  <>Loading...</>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Search by Meaning
                  </>
                )}
              </Button>
              
              {sortedResults.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={handleClearSearchResults}
                >
                  Clear Results
                </Button>
              )}
            </div>
            
            {sortedResults.length > 0 && (
              <Alert className="bg-primary/5 mb-4">
                <AlertTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Semantic Search Results
                </AlertTitle>
                <AlertDescription>
                  Showing {sortedResults.length} results ranked by semantic relevance to your query.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="chat">
          {/* AI Chat Controls */}
          <div className="space-y-4 max-w-3xl mx-auto mb-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">AI Chat Assistant</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Ask questions about the manual and get AI-generated answers based on the manual content.
            </p>
            <div className="space-y-4">
              <Textarea 
                placeholder="Ask a question about the manual..." 
                value={chatQuery} 
                onChange={e => setChatQuery(e.target.value)}
                className="min-h-[100px]"
              />
              <Button 
                onClick={handleChatQuery}
                disabled={chatLoading || !chatQuery.trim()}
                className="gap-2 w-full"
              >
                {chatLoading ? (
                  <>Generating Answer...</>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4" />
                    Ask AI Assistant
                  </>
                )}
              </Button>
              
              {chatResponse && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-md">AI Response</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm whitespace-pre-wrap">
                      {chatResponse}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Tags filter */}
      {availableTags.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold mb-2 flex items-center">
            <Tag className="h-4 w-4 mr-2" />
            Filter by tags:
          </h2>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <Badge 
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Content */}
      {filteredData.length > 0 ? (
        <div className="space-y-6">
          {displayData.map(page => (
            <Collapsible 
              key={page.page} 
              open={expandedPages[page.page]} 
              onOpenChange={() => toggleExpand(page.page)}
              className="w-full"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Page {page.page}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleDownloadImage(page)}>
                      <ImageDown className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDownloadOcrText(page)}>
                      <FileText className="h-4 w-4" />
                    </Button>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon">
                        {expandedPages[page.page] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Page image */}
                  <div className="mb-4">
                    <img 
                      src={`/assets/manual/${page.image || `page-${page.page}.jpg`}`} 
                      alt={`Page ${page.page}`} 
                      className="mx-auto max-h-[300px] object-contain rounded border"
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = '/assets/manual/placeholder.jpg';
                        if (!e.target.getAttribute('data-error-logged')) {
                          console.error(`Failed to load image for page ${page.page}`);
                          e.target.setAttribute('data-error-logged', 'true');
                        }
                      }}
                    />
                  </div>
                  
                  {/* Page tags if available */}
                  {page.tags && page.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {page.tags.map(tag => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Show similarity score for semantic search results */}
                  {page.similarity !== undefined && (
                    <div className="mb-4 flex items-center gap-2">
                      <Badge variant="outline" className="bg-primary/5">
                        Relevance: {(page.similarity * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  )}

                  {/* Collapsible content */}
                  <CollapsibleContent>
                    {/* OCR Text */}
                    {(viewMode === 'ocr' || viewMode === 'both') && (
                      <div className="mt-4 mb-6">
                        <h3 className="text-lg font-semibold mb-2">OCR Text</h3>
                        <div className="p-4 bg-muted rounded text-sm font-mono whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                          {searchQuery ? highlightText(page.ocrText, searchQuery) : page.ocrText}
                        </div>
                      </div>
                    )}
                    
                    {/* PDF Text */}
                    {(viewMode === 'pdf' || viewMode === 'both') && (
                      <div className="mt-4 mb-6">
                        <h3 className="text-lg font-semibold mb-2">PDF Text</h3>
                        <div className="p-4 bg-muted rounded text-sm font-mono whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                          {searchQuery ? highlightText(page.rawText, searchQuery) : page.rawText}
                        </div>
                      </div>
                    )}
                  </CollapsibleContent>
                </CardContent>
              </Card>
            </Collapsible>
          ))}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNumber = i + 1;
                  // Show current page, first, last, and neighbors; use ellipsis for large gaps
                  if (
                    pageNumber === 1 || 
                    pageNumber === totalPages || 
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink 
                          onClick={() => setCurrentPage(pageNumber)}
                          isActive={currentPage === pageNumber}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (
                    (pageNumber === 2 && currentPage > 3) ||
                    (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                  ) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      ) : (
        <Card className="bg-muted">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
            <p className="text-muted-foreground text-center">
              {searchQuery 
                ? `No matches found for "${searchQuery}". Try a different search term.` 
                : 'No manual pages match the current filters.'}
            </p>
            {(searchQuery || selectedPageFilter !== 'all' || selectedTags.length > 0 || sortedResults.length > 0) && (
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedPageFilter('all');
                  setSelectedTags([]);
                  setSortedResults([]);
                  setSemanticQuery('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}