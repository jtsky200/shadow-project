"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, Check, FileText, RefreshCw, Upload, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface UploadedDocument {
  id: string
  name: string
  size: number
  type: string
  data: string | ArrayBuffer | null
}

interface SystemSection {
  id: string
  name: string
  description: string
  selected: boolean
  recommendedUpdate: boolean
  lastUpdated: string
}

export default function UpdateSystemPage() {
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [systemSections, setSystemSections] = useState<SystemSection[]>([
    {
      id: "manuals",
      name: "Vehicle Manuals",
      description: "Update vehicle manual content and specifications",
      selected: false,
      recommendedUpdate: false,
      lastUpdated: "2 weeks ago"
    },
    {
      id: "product-info",
      name: "Product Information",
      description: "Update vehicle features and specifications",
      selected: false,
      recommendedUpdate: false,
      lastUpdated: "1 month ago"
    },
    {
      id: "sales-templates",
      name: "Sales Templates",
      description: "Update sales objection handling and approaches",
      selected: false,
      recommendedUpdate: false,
      lastUpdated: "3 weeks ago"
    },
    {
      id: "service-info",
      name: "Service Information",
      description: "Update service and maintenance procedures",
      selected: false,
      recommendedUpdate: false,
      lastUpdated: "2 months ago"
    },
    {
      id: "chat-knowledge",
      name: "Chat Knowledge Base",
      description: "Update general knowledge for the chat system",
      selected: false,
      recommendedUpdate: false,
      lastUpdated: "2 weeks ago"
    }
  ])

  // File dropzone handling
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(async file => {
      const reader = new FileReader()
      
      reader.onload = async () => {
        const newFile = {
          id: `file-${Date.now()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result
        }
        
        setUploadedDocuments(prevFiles => [...prevFiles, newFile])
        
        // Start analysis of the document to make recommendations
        await analyzeDocument(newFile)
      }
      
      reader.readAsDataURL(file)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 5
  })

  const analyzeDocument = async (document: UploadedDocument) => {
    setProcessing(true)
    setProgress(10)
    setError(null)
    
    try {
      // Simulate document analysis process
      await new Promise(resolve => setTimeout(resolve, 500))
      setProgress(30)
      
      await new Promise(resolve => setTimeout(resolve, 500))
      setProgress(60)
      
      await new Promise(resolve => setTimeout(resolve, 500))
      setProgress(90)
      
      // Update recommendations based on document content
      // This would be replaced with actual AI analysis in production
      const updatedSections = systemSections.map(section => {
        // Simple simulation - recommend updates based on document name
        let shouldRecommend = false
        
        if (document.name.toLowerCase().includes("manual") && section.id === "manuals") {
          shouldRecommend = true
        } else if (document.name.toLowerCase().includes("product") && section.id === "product-info") {
          shouldRecommend = true
        } else if (document.name.toLowerCase().includes("sales") && section.id === "sales-templates") {
          shouldRecommend = true
        } else if (document.name.toLowerCase().includes("service") && section.id === "service-info") {
          shouldRecommend = true
        } else if (section.id === "chat-knowledge") {
          // Always recommend updating the general knowledge base
          shouldRecommend = true
        }
        
        return {
          ...section,
          recommendedUpdate: shouldRecommend,
          // Auto-select recommended sections
          selected: shouldRecommend ? true : section.selected
        }
      })
      
      setSystemSections(updatedSections)
      setProgress(100)
      
    } catch (err) {
      console.error('Error analyzing document:', err)
      setError('Failed to analyze document')
    } finally {
      setTimeout(() => {
        setProcessing(false)
      }, 500)
    }
  }

  const removeDocument = (id: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== id))
  }

  const toggleSectionSelection = (id: string) => {
    setSystemSections(prev => 
      prev.map(section => 
        section.id === id 
          ? { ...section, selected: !section.selected }
          : section
      )
    )
  }

  const handleUpdate = async () => {
    setProcessing(true)
    setProgress(0)
    setError(null)
    setSuccess(null)
    
    try {
      // Get selected sections
      const selectedSections = systemSections.filter(section => section.selected)
      
      if (selectedSections.length === 0) {
        throw new Error("Please select at least one section to update")
      }
      
      if (uploadedDocuments.length === 0) {
        throw new Error("Please upload at least one document")
      }
      
      // Simulate update process
      setProgress(20)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setProgress(50)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setProgress(80)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setProgress(100)
      
      // Update last updated timestamp
      setSystemSections(prev => 
        prev.map(section => 
          section.selected 
            ? { ...section, lastUpdated: "Just now", selected: false, recommendedUpdate: false }
            : section
        )
      )
      
      setSuccess(`Successfully updated ${selectedSections.length} system ${selectedSections.length === 1 ? 'section' : 'sections'}`)
      
      // Clear uploaded documents after successful update
      setUploadedDocuments([])
      
    } catch (err: unknown) {
      console.error('Error updating system:', err)
      setError(err instanceof Error ? err.message : 'Failed to update system')
    } finally {
      setTimeout(() => {
        setProcessing(false)
      }, 500)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Update System</h1>
          <p className="text-muted-foreground mt-2">
            Upload documents to update specific parts of the system with new information
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>
                Upload PDF, DOCX, or text files to update the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {uploadedDocuments.length > 0 ? (
                <div className="space-y-4">
                  {uploadedDocuments.map(doc => (
                    <Card key={doc.id} className="border-dashed">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium truncate max-w-[200px]">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(doc.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeDocument(doc.id)}
                            disabled={processing}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors ${
                      isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                    <p className="text-sm text-center text-muted-foreground">
                      {isDragActive
                        ? 'Drop files here...'
                        : 'Add more documents'}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors ${
                    isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-center font-medium">
                    {isDragActive
                      ? 'Drop files here...'
                      : 'Drag & drop files here, or click to select'}
                  </p>
                  <p className="text-xs text-center text-muted-foreground mt-1">
                    Supports PDF, DOCX, and text files (max 5 files)
                  </p>
                </div>
              )}
              
              {processing && (
                <div className="mt-4">
                  <Progress value={progress} className="h-1" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {progress < 100 ? 'Analyzing documents...' : 'Analysis complete'}
                  </p>
                </div>
              )}
              
              {error && (
                <div className="mt-4">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Select Sections to Update</CardTitle>
              <CardDescription>
                Choose which parts of the system to update with the new information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {systemSections.map(section => (
                    <div key={section.id} className="flex items-start space-x-3 p-2 rounded hover:bg-muted/50">
                      <Checkbox 
                        id={`section-${section.id}`} 
                        checked={section.selected}
                        onCheckedChange={() => toggleSectionSelection(section.id)}
                      />
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Label 
                            htmlFor={`section-${section.id}`}
                            className="font-medium cursor-pointer"
                          >
                            {section.name}
                          </Label>
                          {section.recommendedUpdate && (
                            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{section.description}</p>
                        <div className="flex items-center">
                          <p className="text-xs">Last updated: {section.lastUpdated}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="mt-4">
                <Button 
                  onClick={handleUpdate} 
                  disabled={processing || uploadedDocuments.length === 0}
                  className="w-full"
                >
                  {processing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update System'
                  )}
                </Button>
                
                {success && (
                  <Alert className="mt-4 border-green-200 bg-green-50 text-green-800">
                    <Check className="h-4 w-4" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 