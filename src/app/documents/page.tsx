"use client"

import React, { useState, useEffect } from "react"
import { firestore } from "@/lib/firebase"
import { 
  Card, CardHeader, CardTitle, CardDescription, CardContent
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Search, ExternalLink, Trash } from "lucide-react"
import { FileUpload } from "@/components/ui/file-upload"

interface Document {
  id: string
  name: string
  description?: string
  url: string
  type: string
  size: number
  createdAt: Date
  userId?: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([])
  const [activeTab, setActiveTab] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  
  useEffect(() => {
    fetchDocuments()
  }, [])
  
  useEffect(() => {
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const filtered = documents.filter(doc => 
        doc.name.toLowerCase().includes(query) || 
        (doc.description && doc.description.toLowerCase().includes(query))
      )
      setFilteredDocs(filtered)
      return
    }
    
    // Filter by document type tab
    const filtered = documents.filter(doc => {
      if (activeTab === "all") return true
      if (activeTab === "pdf") return doc.type === "application/pdf"
      if (activeTab === "images") return doc.type.startsWith("image/")
      if (activeTab === "other") {
        return !doc.type.startsWith("image/") && doc.type !== "application/pdf"
      }
      return true
    })
    
    setFilteredDocs(filtered)
  }, [activeTab, documents, searchQuery])

  async function fetchDocuments() {
    try {
      // Use the mock firestore API which doesn't return real data
      const collectionRef = firestore.collection("documents")
      // We don't need the result since we'll use mock data
      await collectionRef.where().get()
      
      // Mock data since our API doesn't return any
      const mockDocuments: Document[] = [
        {
          id: "doc1",
          name: "Vehicle Manual.pdf",
          description: "2023 Vehicle Owner's Manual",
          url: "https://example.com/mock-manual.pdf",
          type: "application/pdf",
          size: 2500000,
          createdAt: new Date(Date.now() - 86400000 * 2) // 2 days ago
        },
        {
          id: "doc2",
          name: "Dashboard.jpg",
          description: "Dashboard picture",
          url: "https://example.com/mock-dashboard.jpg",
          type: "image/jpeg",
          size: 1200000,
          createdAt: new Date(Date.now() - 86400000) // 1 day ago
        }
      ]
      
      setDocuments(mockDocuments)
      setFilteredDocs(mockDocuments)
    } catch (error) {
      console.error("Error fetching documents:", error)
    }
  }

  async function handleUploadComplete(url: string, file: File) {
    try {
      // Add document to Firestore using the mock implementation
      const collectionRef = firestore.collection("documents")
      const docRef = await collectionRef.add({
        name: file.name,
        description: description,
        url: url,
        type: file.type,
        size: file.size,
        createdAt: new Date(),
      })
      
      // Add the new document to state
      const newDoc: Document = {
        id: docRef.id || 'mock-id',
        name: file.name,
        description: description,
        url: url,
        type: file.type,
        size: file.size,
        createdAt: new Date()
      }
      
      setDocuments(prev => [newDoc, ...prev])
      setUploadSuccess(true)
      setDescription("")
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUploadSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error saving document to Firestore:", error)
      setUploadError("Error saving document. Please try again.")
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setUploadError(null)
      }, 5000)
    }
  }

  async function handleDeleteDocument(id: string) {
    if (!confirm("Are you sure you want to delete this document?")) {
      return
    }
    
    try {
      // Delete from Firestore using the mock implementation
      const docRef = firestore.collection("documents").doc(id)
      await docRef.set() // Our mock doesn't have delete, so we'll just set it to empty
      
      // Update state
      setDocuments(prev => prev.filter(doc => doc.id !== id))
    } catch (error) {
      console.error("Error deleting document:", error)
      alert("Error deleting document. Please try again.")
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  function getFileIcon(type: string) {
    if (type.startsWith("image/")) {
      return <div className="bg-blue-100 p-3 rounded-md"><FileText className="h-6 w-6 text-blue-500" /></div>
    } else if (type === "application/pdf") {
      return <div className="bg-red-100 p-3 rounded-md"><FileText className="h-6 w-6 text-red-500" /></div>
    } else {
      return <div className="bg-gray-100 p-3 rounded-md"><FileText className="h-6 w-6 text-gray-500" /></div>
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Documents</h1>
        <p className="text-muted-foreground text-lg">Upload and manage your documents</p>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="all">All Files</TabsTrigger>
            <TabsTrigger value="pdf">PDFs</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search documents..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Upload New Document</CardTitle>
              <CardDescription>
                Upload files to your document library
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description (optional)
                  </label>
                  <Input
                    id="description"
                    placeholder="Enter a description for this file"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <FileUpload
                  onUploadComplete={handleUploadComplete}
                  onUploadError={(error) => setUploadError(error.message)}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  maxSizeMB={10}
                  folder="documents"
                  buttonText="Choose a file to upload"
                />
                
                {uploadSuccess && (
                  <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">
                    File uploaded successfully!
                  </div>
                )}
                
                {uploadError && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                    {uploadError}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="md:col-span-2">
            <TabsContent value="all" className="m-0">
              <DocumentList 
                documents={filteredDocs} 
                onDelete={handleDeleteDocument}
                formatFileSize={formatFileSize}
                getFileIcon={getFileIcon}
              />
            </TabsContent>
            
            <TabsContent value="pdf" className="m-0">
              <DocumentList 
                documents={filteredDocs} 
                onDelete={handleDeleteDocument}
                formatFileSize={formatFileSize}
                getFileIcon={getFileIcon}
              />
            </TabsContent>
            
            <TabsContent value="images" className="m-0">
              <DocumentList 
                documents={filteredDocs} 
                onDelete={handleDeleteDocument}
                formatFileSize={formatFileSize}
                getFileIcon={getFileIcon}
              />
            </TabsContent>
            
            <TabsContent value="other" className="m-0">
              <DocumentList 
                documents={filteredDocs} 
                onDelete={handleDeleteDocument}
                formatFileSize={formatFileSize}
                getFileIcon={getFileIcon}
              />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}

interface DocumentListProps {
  documents: Document[]
  onDelete: (id: string) => void
  formatFileSize: (bytes: number) => string
  getFileIcon: (type: string) => React.ReactNode
}

function DocumentList({ documents, onDelete, formatFileSize, getFileIcon }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No documents found</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <Card key={doc.id} className="overflow-hidden">
          <div className="p-4 flex items-start space-x-4">
            {getFileIcon(doc.type)}
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{doc.name}</h3>
              {doc.description && (
                <p className="text-muted-foreground text-sm mb-1">{doc.description}</p>
              )}
              <div className="flex space-x-4 text-sm text-muted-foreground">
                <span>{formatFileSize(doc.size)}</span>
                <span>
                  {new Date(doc.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                asChild
              >
                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-8 w-8 p-0"
                onClick={() => onDelete(doc.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
} 