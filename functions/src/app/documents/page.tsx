"use client"

import { useState, useEffect } from "react"
import { FileUpload } from "@/components/ui/file-upload"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, FileText, Download, Trash2 } from "lucide-react"
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore"
import { firestore } from "@/lib/firebase"

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
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([])
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Fetch documents on mount
  useEffect(() => {
    fetchDocuments()
  }, [])

  // Filter documents when search query changes
  useEffect(() => {
    if (!searchQuery) {
      setFilteredDocs(documents)
      return
    }

    const filtered = documents.filter(doc => 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    setFilteredDocs(filtered)
  }, [searchQuery, documents])

  // Filter documents based on active tab
  useEffect(() => {
    if (activeTab === "all") {
      setFilteredDocs(documents)
      return
    }
    
    const filtered = documents.filter(doc => {
      if (activeTab === "pdf") return doc.type === "application/pdf"
      if (activeTab === "images") return doc.type.startsWith("image/")
      if (activeTab === "other") {
        return !doc.type.startsWith("image/") && doc.type !== "application/pdf"
      }
      return true
    })
    
    setFilteredDocs(filtered)
  }, [activeTab, documents])

  async function fetchDocuments() {
    try {
      const docsRef = collection(firestore, "documents")
      const q = query(docsRef, orderBy("createdAt", "desc"))
      const snapshot = await getDocs(q)
      
      const docs: Document[] = []
      snapshot.forEach(doc => {
        const data = doc.data() as Omit<Document, 'id' | 'createdAt'> & { createdAt: { toDate: () => Date } }
        docs.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate()
        })
      })
      
      setDocuments(docs)
      setFilteredDocs(docs)
    } catch (error) {
      console.error("Error fetching documents:", error)
    }
  }

  async function handleUploadComplete(url: string, file: File) {
    try {
      // Add document to Firestore
      const docRef = await addDoc(collection(firestore, "documents"), {
        name: file.name,
        description: description,
        url: url,
        type: file.type,
        size: file.size,
        createdAt: new Date(),
        // Add user ID if authentication is implemented
        // userId: currentUser.uid
      })
      
      // Add the new document to state
      const newDoc: Document = {
        id: docRef.id,
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
      // Delete from Firestore
      await deleteDoc(doc(firestore, "documents", id))
      
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
      <div className="border rounded-md p-8 text-center">
        <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No documents found</h3>
        <p className="text-muted-foreground">
          Upload a document to get started or adjust your search.
        </p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {documents.map(doc => (
        <Card key={doc.id}>
          <div className="flex items-start p-4">
            <div className="mr-4">
              {getFileIcon(doc.type)}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{doc.name}</h3>
              {doc.description && (
                <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
              )}
              <div className="flex mt-2 text-xs text-muted-foreground">
                <span>{formatFileSize(doc.size)}</span>
                <span className="mx-2">•</span>
                <span>{doc.createdAt.toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                asChild
              >
                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </a>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onDelete(doc.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
} 