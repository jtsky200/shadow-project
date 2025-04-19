"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Download, FileText, Upload, MessageSquare, Send, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Document, Page, pdfjs } from "react-pdf"
import { Avatar } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

// Set pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface Message {
  role: "user" | "assistant" 
  content: string
  timestamp: Date
}

export default function PdfChatPage() {
  // PDF state
  const [currentPage, setCurrentPage] = useState(1)
  const [numPages, setNumPages] = useState<number>(1)
  const [pdfFile, setPdfFile] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>("No file selected")
  const [sessionId, setSessionId] = useState<string>("")
  
  // Chat state
  const [loading, setLoading] = useState<boolean>(false)
  const [inputMessage, setInputMessage] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Upload a PDF file, and I'll help you understand its contents. You can ask me questions about the document once it's uploaded.",
      timestamp: new Date()
    }
  ])

  // Handle PDF file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      const fileUrl = URL.createObjectURL(file)
      setPdfFile(fileUrl)
      setCurrentPage(1)
      
      // Reset chat when new file is uploaded
      setMessages([
        {
          role: "assistant",
          content: `I'm ready to help you with "${file.name}". What would you like to know about this document?`,
          timestamp: new Date()
        }
      ])
      
      // Upload PDF to the server for processing
      try {
        const formData = new FormData()
        formData.append('pdf', file)
        
        const response = await fetch('/api/upload-pdf', {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) {
          throw new Error('Failed to upload PDF')
        }
        
        const data = await response.json()
        setSessionId(data.sessionId)
        
        // Add system message about successful processing
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "I've processed the PDF. You can now ask me questions about its content.",
          timestamp: new Date()
        }])
      } catch (error) {
        console.error('Error uploading PDF:', error)
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "I encountered an error processing your PDF. You can still view the document, but I may not be able to answer questions about its specific content.",
          timestamp: new Date()
        }])
      }
    }
  }

  // Handle chat message sending
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return
    
    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: new Date()
    }
    
    // Add user message to chat
    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setLoading(true)
    
    try {
      // Call chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: inputMessage,
          pdfSessionId: sessionId
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to get response from AI')
      }
      
      const data = await response.json()
      
      // Add AI response to chat
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.response,
        timestamp: new Date()
      }])
    } catch (error) {
      console.error('Error in AI response:', error)
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try again later.",
        timestamp: new Date()
      }])
    } finally {
      setLoading(false)
    }
  }

  // Handle navigation between PDF pages
  const handleNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }

  // Format timestamp for messages
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">PDF Chat Assistant</h1>
          <p className="text-muted-foreground">Upload a PDF and chat with AI about its contents</p>
        </div>
        
        <div className="flex items-center mt-4 md:mt-0">
          <Button variant="outline" asChild className="mr-2">
            <Link href="/manuals">
              <FileText className="mr-2 h-4 w-4" />
              Vehicle Manuals
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <label htmlFor="pdf-upload" className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Upload PDF
            </label>
          </Button>
          <input
            id="pdf-upload"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Viewer */}
        <Card className="h-[calc(100vh-12rem)] flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle>{fileName}</CardTitle>
            <CardDescription>
              {pdfFile ? `Page ${currentPage} of ${numPages}` : "Upload a PDF file to view its contents"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow overflow-auto">
            {pdfFile ? (
              <div className="flex justify-center">
                <Document
                  file={pdfFile}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  loading={<div className="flex justify-center py-8">Loading PDF...</div>}
                >
                  <Page 
                    pageNumber={currentPage} 
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    width={450}
                  />
                </Document>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <FileText className="h-20 w-20 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No PDF file selected</p>
                <Button asChild>
                  <label htmlFor="pdf-upload-center" className="cursor-pointer">
                    Upload PDF
                  </label>
                </Button>
                <input
                  id="pdf-upload-center"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </CardContent>
          {pdfFile && (
            <CardFooter className="border-t flex justify-between items-center pt-4">
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleNextPage}
                  disabled={currentPage >= numPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {numPages}
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </CardFooter>
          )}
        </Card>
        
        {/* Chat Interface */}
        <Card className="h-[calc(100vh-12rem)] flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <span>Chat Assistant</span>
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setMessages([{
                    role: "assistant",
                    content: pdfFile 
                      ? `I'm ready to help you with "${fileName}". What would you like to know about this document?` 
                      : "Upload a PDF file, and I'll help you understand its contents. You can ask me questions about the document once it's uploaded.",
                    timestamp: new Date()
                  }])
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-grow p-0">
            <ScrollArea className="h-full px-4">
              <div className="space-y-4 pt-2 pb-4">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                      <Avatar className="h-8 w-8 mt-0.5">
                        <div className={`h-full w-full flex items-center justify-center text-primary-foreground 
                          ${message.role === "assistant" ? "bg-primary" : "bg-muted-foreground"}`}
                        >
                          {message.role === "user" ? "U" : "A"}
                        </div>
                      </Avatar>
                      <div>
                        <div className={`rounded-lg px-4 py-2 ${
                          message.role === "assistant" 
                            ? "bg-muted text-foreground" 
                            : "bg-primary text-primary-foreground"
                        }`}>
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimestamp(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="flex gap-3 max-w-[80%]">
                      <Avatar className="h-8 w-8 mt-0.5">
                        <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground">
                          A
                        </div>
                      </Avatar>
                      <div>
                        <div className="rounded-lg px-4 py-2 bg-muted text-foreground">
                          <p className="text-sm">Thinking...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <Separator />
          <CardFooter className="pt-4">
            <div className="flex w-full items-center gap-2">
              <Textarea
                placeholder="Ask a question about the PDF..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-grow resize-none"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                disabled={loading || !pdfFile}
              />
              <Button 
                size="icon"
                disabled={loading || !inputMessage.trim() || !pdfFile}
                onClick={handleSendMessage}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 