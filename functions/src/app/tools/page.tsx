"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  PenLine, 
  Code, 
  FileText, 
  Search, 
  Image as ImageIcon, 
  FileVideo, 
  Layout,
  Globe,
  Calculator,
  BarChart3,
  Database,
  Bot
} from "lucide-react"

export default function ToolsPage() {
  const [activeEditor, setActiveEditor] = useState("text")

  return (
    <div className="flex flex-col space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tools</h2>
        <p className="text-muted-foreground">
          Access specialized AI tools and research assistants
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
        {/* Tools Sidebar */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tools..."
              className="w-full pl-8"
            />
          </div>

          <div className="border rounded-md">
            <div className="p-2">
              <h3 className="font-medium text-sm mb-2">Content Creation</h3>
              <div className="space-y-1">
                <Button 
                  variant={activeEditor === "text" ? "secondary" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveEditor("text")}
                >
                  <PenLine className="h-4 w-4 mr-2" />
                  Text Editor
                </Button>
                <Button 
                  variant={activeEditor === "code" ? "secondary" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setActiveEditor("code")}
                >
                  <Code className="h-4 w-4 mr-2" />
                  Code Editor
                </Button>
                <Button 
                  variant={activeEditor === "canvas" ? "secondary" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setActiveEditor("canvas")}
                >
                  <Layout className="h-4 w-4 mr-2" />
                  Canvas
                </Button>
              </div>
            </div>
            <div className="border-t p-2">
              <h3 className="font-medium text-sm mb-2">Research & Analysis</h3>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start">
                  <Search className="h-4 w-4 mr-2" />
                  Web Research
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Document Analysis
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Data Analysis
                </Button>
              </div>
            </div>
            <div className="border-t p-2">
              <h3 className="font-medium text-sm mb-2">Generation</h3>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Image Generation
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <FileVideo className="h-4 w-4 mr-2" />
                  Video Generation
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Globe className="h-4 w-4 mr-2" />
                  Language Translation
                </Button>
              </div>
            </div>
            <div className="border-t p-2">
              <h3 className="font-medium text-sm mb-2">Specialized Tools</h3>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start">
                  <Calculator className="h-4 w-4 mr-2" />
                  Math Solver
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  SQL Assistant
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Bot className="h-4 w-4 mr-2" />
                  Chatbot Builder
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div>
          <Tabs defaultValue={activeEditor} value={activeEditor} onValueChange={setActiveEditor} className="h-full">
            <TabsContent value="text" className="mt-0">
              <Card className="h-[calc(100vh-12rem)]">
                <CardHeader>
                  <CardTitle>Text Editor</CardTitle>
                  <CardDescription>
                    Rich text editing environment with AI-assisted content generation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    className="h-[calc(100vh-24rem)] resize-none" 
                    placeholder="Start writing or describe what you want to create..."
                  />
                </CardContent>
                <CardFooter className="border-t p-4 flex justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Format</Button>
                    <Button variant="outline" size="sm">Improve</Button>
                    <Button variant="outline" size="sm">Summarize</Button>
                  </div>
                  <Button>Generate with AI</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="code" className="mt-0">
              <Card className="h-[calc(100vh-12rem)]">
                <CardHeader>
                  <CardTitle>Code Editor</CardTitle>
                  <CardDescription>
                    Code editing with syntax highlighting and AI code assistance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    className="h-[calc(100vh-24rem)] resize-none font-mono text-sm" 
                    placeholder="// Write or describe the code you want to generate"
                  />
                </CardContent>
                <CardFooter className="border-t p-4 flex justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Format</Button>
                    <Button variant="outline" size="sm">Debug</Button>
                    <Button variant="outline" size="sm">Explain</Button>
                  </div>
                  <Button>Generate Code</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="canvas" className="mt-0">
              <Card className="h-[calc(100vh-12rem)]">
                <CardHeader>
                  <CardTitle>Canvas</CardTitle>
                  <CardDescription>
                    Visual workspace for diagrams, flowcharts, and mind maps
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[calc(100vh-20rem)]">
                  <div className="flex items-center justify-center h-full border-2 border-dashed rounded-md">
                    <div className="text-center p-4">
                      <Layout className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium">Canvas Workspace</h3>
                      <p className="text-muted-foreground">
                        This is where your canvas workspace will appear
                      </p>
                      <Button className="mt-4">Create New Canvas</Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t p-4 flex justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Elements</Button>
                    <Button variant="outline" size="sm">Templates</Button>
                  </div>
                  <Button>AI Assist</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 