"use client"

import { useState, useEffect, useRef, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ChevronLeft, SendIcon, Car, BookOpen, RefreshCw, StopCircle, Paperclip, Search, Image, Clipboard, Download, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import React from "react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ManualMetadata {
  id: string
  title: string
  description: string
  fileSize: string
  pages: number
  year: string
  model: string
  path: string
  downloadPath: string
}

interface Message {
  role: "user" | "assistant" | "typing"
  content: string
  timestamp: Date
}

// Custom textarea component with centered placeholder
const CenteredTextarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "border-input placeholder:text-muted-foreground focus-visible:ring-ring flex w-full border-0 bg-transparent px-4 py-8 text-base shadow-xs outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm placeholder:text-center placeholder:translate-y-4 placeholder:text-lg",
          className
        )}
        {...props}
      />
    );
  }
);
CenteredTextarea.displayName = "CenteredTextarea";

// Search params component to be wrapped in Suspense
function ManualChatWithParams() {
  const searchParams = useSearchParams()
  const manualId = searchParams.get("manualId")
  
  return <ManualChatContent initialManualId={manualId} />
}

// Main content component
function ManualChatContent({ initialManualId }: { initialManualId: string | null }) {
  const [uniqueVehicles, setUniqueVehicles] = useState<ManualMetadata[]>([])
  const [selectedManual, setSelectedManual] = useState<ManualMetadata | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [inputMessage, setInputMessage] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [highlightedMessage, setHighlightedMessage] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const [lang, setLang] = useState<"en" | "de" | "fr">("en")
  const [quickQuestions] = useState<string[]>([
    "What are the key features of this vehicle?",
    "How do I charge the battery?",
    "What is the range of this EV?",
    "How do I set up Super Cruise?",
    "What safety features are included?",
    "How do I troubleshoot connectivity issues?",
    "What is the warranty coverage?",
    "How do I connect my phone?",
    "What are the maintenance requirements?",
    "How do I use the infotainment system?",
    "What driving modes are available?",
    "How does regenerative braking work?"
  ])
  
  // Auto-detect browser language
  useEffect(() => {
    const getBrowserLang = () => {
      const browserLang = document.documentElement.lang || navigator.language || "en"
      if (browserLang.startsWith("de")) return "de"
      if (browserLang.startsWith("fr")) return "fr" 
      return "en"
    }
    
    setLang(getBrowserLang() as "en" | "de" | "fr")
  }, [])

  // Scroll to bottom of chat when messages change - using a DOM method to avoid ResizeObserver loop
  useEffect(() => {
    // Use a timeout to ensure the DOM has updated before scrolling
    const timer = setTimeout(() => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, [messages.length]);

  // Fetch available manuals
  useEffect(() => {
    fetch('/assets/manuals/index.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch manuals: ${response.status} ${response.statusText}`)
        }
        return response.json()
      })
      .then(data => {
        if (Array.isArray(data)) {
          // Filter unique vehicles by model
          const vehicleMap = new Map<string, ManualMetadata>()
          data.forEach(manual => {
            const key = `${manual.year}-${manual.model}`
            // Only add if not already in the map, prioritizing manuals over other document types
            if (!vehicleMap.has(key) || manual.documentType === "manual") {
              vehicleMap.set(key, manual)
            }
          })
          setUniqueVehicles(Array.from(vehicleMap.values()))
          
          // If manual ID is in URL params, select it
          if (initialManualId) {
            const foundManual = data.find(manual => manual.id === initialManualId)
            if (foundManual) {
              setSelectedManual(foundManual)
              // Add initial system message based on language
              const welcomeMessage = {
                en: `I'm your Cadillac Vehicle Assistant. I'm here to help you with any questions about the ${foundManual.year} ${foundManual.model}. What would you like to know?`,
                de: `Ich bin dein Cadillac Fahrzeug-Assistent. Ich bin hier, um dir bei Fragen zu deinem ${foundManual.year} ${foundManual.model} zu helfen. Was möchtest du wissen?`,
                fr: `Je suis votre assistant véhicule Cadillac. Je suis là pour vous aider avec toutes vos questions sur la ${foundManual.year} ${foundManual.model}. Que voulez-vous savoir?`
              }
              
              setMessages([
                {
                  role: "assistant",
                  content: welcomeMessage[lang],
                  timestamp: new Date()
                }
              ])
            }
          }
        }
      })
      .catch(error => {
        console.error('Error fetching manuals:', error)
      })
  }, [initialManualId, lang])

  // Manual selection handler
  const handleManualSelect = (manual: ManualMetadata) => {
    setSelectedManual(manual)
    // Reset messages and add initial system message based on language
    const welcomeMessage = {
      en: `I'm your Cadillac Vehicle Assistant. I'm here to help you with any questions about the ${manual.year} ${manual.model}. What would you like to know?`,
      de: `Ich bin dein Cadillac Fahrzeug-Assistent. Ich bin hier, um dir bei Fragen zu deinem ${manual.year} ${manual.model} zu helfen. Was möchtest du wissen?`,
      fr: `Je suis votre assistant véhicule Cadillac. Je suis là pour vous aider avec toutes vos questions sur la ${manual.year} ${manual.model}. Que voulez-vous savoir?`
    }
    
    setMessages([
      {
        role: "assistant",
        content: welcomeMessage[lang],
        timestamp: new Date()
      }
    ])
  }

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setLoading(false)
      
      // Update the typing message to indicate it was stopped
      setMessages(prev => {
        const withoutTyping = prev.filter(m => m.role !== "typing")
        return [...withoutTyping]
      })
    }
  }

  const handleQuickQuestion = (question: string) => {
    // Set the input message
    setInputMessage(question)
    
    // Automatically send the message
    setTimeout(() => {
      const userMessage: Message = {
        role: "user",
        content: question,
        timestamp: new Date()
      }
      
      // Add user message to chat
      setMessages(prev => [...prev, userMessage])
      setInputMessage("")
      setLoading(true)
      
      // Call the send message logic with the question
      handleAIResponse(userMessage)
    }, 100)
  }
  
  // Simple toast implementation
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    // In a real app, you would use a proper toast component
    console.log(`Toast (${type}): ${message}`)
    // For now, just show an alert
    if (typeof window !== 'undefined') {
      alert(message)
    }
  }
  
  // Copy message to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        showToast("Message copied to clipboard")
      })
      .catch(err => {
        console.error('Failed to copy text: ', err)
        showToast("Failed to copy text", "error")
      })
  }
  
  // Save message as text file
  const saveAsTextFile = (text: string) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cadillac-assistant-${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    showToast("Message saved as text file")
  }
  
  // Handle message regeneration
  const regenerateMessage = (index: number) => {
    // Find the last user message before this assistant message
    let userMessageIndex = -1
    for (let i = index - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        userMessageIndex = i
        break
      }
    }
    
    if (userMessageIndex !== -1) {
      // Get the user message content
      const userMessage = messages[userMessageIndex]
      
      // Remove all messages after the user message
      const newMessages = messages.slice(0, index)
      setMessages(newMessages)
      
      // Set loading state
      setLoading(true)
      
      // Call AI response with the user message
      handleAIResponse(userMessage)
    }
  }

  // Use batched state updates to prevent cascading renders
  const updateMessages = (newMessages: Message[]) => {
    // Schedule a single update
    setMessages(newMessages);
  };

  // Detect if message is a follow-up
  const isFollowUp = (text: string) => {
    if (lang === "en") {
      return text.toLowerCase().startsWith("and") || 
             text.toLowerCase().startsWith("what about") ||
             text.toLowerCase().startsWith("how long");
    } else if (lang === "de") {
      return text.toLowerCase().startsWith("und") || 
             text.toLowerCase().startsWith("wie lange") ||
             text.toLowerCase().startsWith("was ist mit");
    } else if (lang === "fr") {
      return text.toLowerCase().startsWith("et") || 
             text.toLowerCase().startsWith("qu'en est-il") ||
             text.toLowerCase().startsWith("combien de temps");
    }
    return false;
  }

  // Extract the AI response logic to a separate function so it can be reused
  const handleAIResponse = async (userMessage: Message) => {
    if (!selectedManual) return
    
    // Process message for follow-ups
    let processedMessage = userMessage.content;
    
    // Check if this is a follow-up question and we have previous messages
    if (messages.length > 1 && isFollowUp(userMessage.content)) {
      // Find the last assistant message
      const lastAssistantMessage = [...messages].reverse().find(m => m.role === "assistant");
      
      if (lastAssistantMessage) {
        // Format the follow-up context based on language
        if (lang === "en") {
          processedMessage = `Follow-up to previous answer ("${lastAssistantMessage.content.substring(0, 100)}..."): ${userMessage.content}`;
        } else if (lang === "de") {
          processedMessage = `Follow-up zur vorherigen Antwort („${lastAssistantMessage.content.substring(0, 100)}..."): ${userMessage.content}`;
        } else if (lang === "fr") {
          processedMessage = `Suite à la réponse précédente ("${lastAssistantMessage.content.substring(0, 100)}..."): ${userMessage.content}`;
        }
      }
    }
    
    // Try streaming response first
    try {
      const controller = new AbortController()
      abortControllerRef.current = controller
      
      // Call chat-stream API endpoint with language parameter
      const response = await fetch('/api/chat-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: processedMessage,
          manualId: selectedManual.id,
          lang: lang
        }),
        signal: controller.signal
      })
      
      if (!response.ok) {
        throw new Error('Streaming failed, falling back to regular chat')
      }
      
      // Handle streaming response
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')
      
      const decoder = new TextDecoder()
      let streamedText = ""
      
      // Add typing indicator in a single update
      updateMessages([...messages, {
        role: "typing",
        content: "",
        timestamp: new Date()
      }])
      
      while (true) {
        const { value, done } = await reader.read()
        
        if (done) break
        
        const chunk = decoder.decode(value)
        streamedText += chunk
        
        // Batch updates to avoid cascading renders
        setMessages(prev => {
          const updatedMessages = [...prev];
          const typingIndex = updatedMessages.findIndex(m => m.role === "typing");
          
          if (typingIndex !== -1) {
            // Create a new message object instead of mutating
            updatedMessages[typingIndex] = {
              ...updatedMessages[typingIndex],
              content: streamedText
            };
          }
          
          return updatedMessages;
        })
      }
      
      // Convert the typing message to a regular assistant message
      setMessages(prev => {
        const withoutTyping = prev.filter(m => m.role !== "typing")
        return [...withoutTyping, {
          role: "assistant",
          content: streamedText,
          timestamp: new Date()
        }]
      })
      
    } catch (error) {
      console.warn('Streaming error, using fallback:', error)
      
      // Call with language parameter
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: processedMessage,
            manualId: selectedManual.id,
            model: selectedManual.model,
            year: selectedManual.year,
            lang: lang
          }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to get response from AI')
        }
        
        const data = await response.json()
        
        // Add AI response to chat
        setMessages(prev => {
          const withoutTyping = prev.filter(m => m.role !== "typing")
          return [...withoutTyping, {
            role: "assistant",
            content: data.response,
            timestamp: new Date()
          }]
        })
      } catch (error) {
        console.error('Error in AI response:', error)
        setMessages(prev => {
          const withoutTyping = prev.filter(m => m.role !== "typing")
          return [...withoutTyping, {
            role: "assistant",
            content: "I'm sorry, I encountered an error processing your request. Please try again later.",
            timestamp: new Date()
          }]
        })
      }
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedManual) return
    
    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: new Date()
    }
    
    // Add user message to chat
    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setLoading(true)
    
    // Use the extracted AI response logic
    handleAIResponse(userMessage)
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Function to highlight a message briefly
  const highlightMessage = (index: number) => {
    setHighlightedMessage(index);
    
    // Remove highlight after 1.5 seconds
    setTimeout(() => {
      setHighlightedMessage(null);
    }, 1500);
  };

  // Function to check if content is an image or PDF
  const isImageLink = (content: string): boolean => {
    return !!content.match(/\.(jpg|jpeg|png|webp|gif)$/i);
  }
  
  const isPdfLink = (content: string): boolean => {
    return content.toLowerCase().endsWith('.pdf');
  }

  // Enhance messageList to handle PDF and image content
  const messageList = useMemo(() => {
    return messages.map((message, index) => (
      <div
        key={`message-${index}-${message.timestamp.getTime()}`}
        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} chat-message mb-6 ${
          highlightedMessage === index ? 'animate-highlight bg-yellow-100 dark:bg-yellow-900/30 rounded-lg transition-colors' : ''
        }`}
      >
        {message.role === "user" ? (
          // User message with blue bubble
          <div className="bg-primary text-white ml-12 rounded-lg p-3 shadow-sm">
            <div className="flex flex-col">
              <div className="whitespace-pre-wrap">
                {message.content}
              </div>
              <div className="mt-1 text-xs opacity-70 text-right">
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          </div>
        ) : (
          // AI message with no bubble
          <div className="w-full mr-4 group">
            <div className="text-foreground">
              {isPdfLink(message.content) ? (
                <div>
                  <iframe src={message.content} width="100%" height="250px" title="PDF Preview" className="border rounded" />
                  <a href={message.content} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">PDF öffnen</a>
                </div>
              ) : isImageLink(message.content) ? (
                <a href={message.content} target="_blank" rel="noreferrer">
                  <img src={message.content} alt="Bildvorschau" className="w-32 h-auto rounded shadow" />
                </a>
              ) : (
                <>
                  {message.content}
                  {message.role === "typing" && (
                    <span className="inline-block w-2 h-4 ml-1 bg-primary/80 animate-pulse"></span>
                  )}
                </>
              )}
            </div>
            <div className="mt-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="p-1 rounded-full hover:bg-muted transition-colors" 
                    title="Copy to clipboard"
                    onClick={() => copyToClipboard(message.content)}
                  >
                    <Clipboard className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy to clipboard</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="p-1 rounded-full hover:bg-muted transition-colors" 
                    title="Save as file"
                    onClick={() => saveAsTextFile(message.content)}
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save as file</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="p-1 rounded-full hover:bg-muted transition-colors" 
                    title="Regenerate"
                    onClick={() => regenerateMessage(index)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Regenerate</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}
      </div>
    ));
  }, [messages, highlightedMessage, formatTimestamp, copyToClipboard, saveAsTextFile, regenerateMessage]);

  return (
    <div className="container py-8 relative min-h-screen">
      {/* Fixed Back to Manuals button positioned below the top navigation bar */}
      <div className="fixed top-20 right-8 z-20">
        <Button variant="default" size="sm" asChild>
          <Link href="/manuals">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Manuals
          </Link>
        </Button>
      </div>

      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manual AI Chat</h1>
            <p className="text-muted-foreground">Ask questions about your Cadillac vehicle</p>
          </div>
          
          {/* Add language selector */}
          <div>
            <Select value={lang} onValueChange={(value) => setLang(value as "en" | "de" | "fr")}>
              <SelectTrigger className="w-[140px]">
                <div className="flex items-center">
                  <Globe className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Language" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">🇬🇧 English</SelectItem>
                <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                <SelectItem value="fr">🇫🇷 Français</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar with flowing sections, no fixed positioning */}
          <div className="w-full md:w-1/5">
            {/* Vehicle Manuals section */}
            <div className="bg-background border rounded-lg shadow-sm mb-4">
              <div className="p-4 border-b">
                <h3 className="text-lg font-medium">Vehicle Manuals</h3>
              </div>
              <div className="p-2">
                <div className="space-y-1">
                  {uniqueVehicles.map((vehicle) => (
                    <Button
                      key={`${vehicle.year}-${vehicle.model}`}
                      variant={selectedManual?.model === vehicle.model ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleManualSelect(vehicle)}
                    >
                      <Car className="mr-2 h-4 w-4" />
                      <span className="truncate">{vehicle.year} {vehicle.model}</span>
                    </Button>
                  ))}
                </div>
              </div>
              
              {selectedManual && (
                <div className="p-3 border-t">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/manual?id=${selectedManual.id}`}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      View Manual
                    </Link>
                  </Button>
                </div>
              )}
            </div>
            
            {/* Quick Questions section */}
            {selectedManual && (
              <div className="bg-background border rounded-lg shadow-sm mb-4">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-medium">Quick Questions</h3>
                </div>
                <div className="p-2">
                  <div className="flex flex-col gap-2">
                    {quickQuestions.slice(0, 5).map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="justify-start h-auto py-3 px-4 font-normal text-left break-words whitespace-normal"
                        onClick={() => handleQuickQuestion(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Chat History Section */}
            {selectedManual && messages.length > 1 && (
              <div className="bg-background border rounded-lg shadow-sm">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-medium">Chat History</h3>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  <div className="flex flex-col">
                    {messages.slice(1).map((message, index) => (
                      <div 
                        key={index}
                        className={`p-3 text-sm cursor-pointer hover:bg-accent/50 ${
                          message.role === "user" 
                            ? "bg-primary/5 border-l-4 border-primary" 
                            : "bg-accent/30 border-l-4 border-accent"
                        }`}
                        onClick={() => {
                          // Scroll to this message
                          const messageElements = document.querySelectorAll('.chat-message');
                          if (messageElements[index + 1]) {
                            messageElements[index + 1].scrollIntoView({ behavior: 'smooth' });
                            // Highlight the message
                            highlightMessage(index + 1);
                          }
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium ${message.role === "user" ? "text-primary" : "text-accent-foreground"}`}>
                            {message.role === "user" ? "You" : "Assistant"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </div>
                        <div className="truncate text-foreground">
                          {message.content.length > 50 
                            ? message.content.substring(0, 50) + "..." 
                            : message.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Chat content */}
          <div className="w-full md:w-4/5">
            {selectedManual ? (
              <div className="h-[75vh] flex flex-col mx-auto max-w-5xl">
                <div className="border-b pb-3 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 font-medium">
                      <Car className="h-5 w-5" />
                      <span>{selectedManual.year} {selectedManual.model} Assistant</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => {
                      setMessages([{
                        role: "assistant",
                        content: `I'm your Cadillac Vehicle Assistant. I'm here to help you with any questions about the ${selectedManual.year} ${selectedManual.model}. What would you like to know?`,
                        timestamp: new Date()
                      }])
                    }}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      New Chat
                    </Button>
                  </div>
                </div>
                
                <TooltipProvider>
                  <div 
                    ref={scrollAreaRef} 
                    className="flex-1 px-4 overflow-y-auto h-full" 
                    style={{ maxHeight: "calc(100vh - 300px)" }}
                  >
                    <div className="space-y-6 py-4 max-w-4xl mx-auto">
                      {messageList}
                      <div ref={messagesEndRef} />
                      
                      {/* Add larger padding at the bottom to prevent content from being hidden behind the floating input */}
                      <div className="h-[240px]"></div>
                    </div>
                  </div>
              
                  <div className="fixed bottom-6 left-0 right-0 z-10">
                    <div className="max-w-4xl mx-auto relative px-6">
                      <div className="absolute top-2 right-8 flex items-center py-1 px-2 gap-2 z-10">
                        <Button variant="ghost" size="icon" className="rounded-full" title="Upload file">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full" title="Search manual">
                          <Search className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full" title="Generate image">
                          <Image className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="bg-background border rounded-xl shadow-sm">
                        <div className="min-h-[120px] flex items-center">
                          <CenteredTextarea
                            placeholder="Ask a question about your vehicle..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                handleSendMessage()
                              }
                            }}
                            className="resize-none text-center h-full min-h-[120px]"
                            disabled={loading}
                          />
                        </div>
                        <div className="flex justify-end px-3 py-3 border-t">
                          {loading ? (
                            <Button onClick={stopGeneration} size="sm" variant="destructive" className="rounded-md">
                              <StopCircle className="h-4 w-4 mr-1" />
                              Stop generating
                            </Button>
                          ) : (
                            <Button onClick={handleSendMessage} size="sm" disabled={!inputMessage.trim() || loading} className="rounded-md">
                              <SendIcon className="h-4 w-4 mr-1" />
                              Send
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </TooltipProvider>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[75vh] max-w-5xl mx-auto">
                <div className="text-center">
                  <BookOpen className="h-16 w-16 mx-auto mb-6 text-muted-foreground opacity-50" />
                  <h3 className="text-2xl font-medium mb-3">Select a manual to begin</h3>
                  <p className="text-muted-foreground text-lg">Choose a vehicle from the list on the left to start your AI-assisted manual experience</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Main export with Suspense boundary
export default function ManualChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <ManualChatWithParams />
    </Suspense>
  )
} 