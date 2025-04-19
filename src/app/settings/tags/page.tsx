"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AlertCircle, Check, Edit, Plus, Trash } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface TagItem {
  id: string
  name: string
  color: string
  pageAssociations: string[]
}

interface PageItem {
  id: string
  name: string
  path: string
}

export default function TagsManagementPage() {
  const [tags, setTags] = useState<TagItem[]>([
    { 
      id: "tag-manual", 
      name: "Manual", 
      color: "#4f46e5", 
      pageAssociations: ["manuals", "documents"]
    },
    { 
      id: "tag-specs", 
      name: "Specs", 
      color: "#9333ea", 
      pageAssociations: ["specifications", "documents"]
    },
    { 
      id: "tag-guide", 
      name: "Guide", 
      color: "#10b981", 
      pageAssociations: ["guides", "documents"]
    },
    { 
      id: "tag-new", 
      name: "New", 
      color: "#f43f5e", 
      pageAssociations: ["manuals", "documents", "library"]
    }
  ])

  const pages: PageItem[] = [
    { id: "page-manuals", name: "Manuals", path: "/manuals" },
    { id: "page-specifications", name: "Specifications", path: "/specifications" },
    { id: "page-documents", name: "Documents", path: "/documents" },
    { id: "page-guides", name: "Quick Guides", path: "/guides" },
    { id: "page-library", name: "Library", path: "/library" }
  ]

  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState("#4f46e5")
  const [selectedPages, setSelectedPages] = useState<string[]>([])
  const [editTagId, setEditTagId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isDialogOpen) {
      setNewTagName("")
      setNewTagColor("#4f46e5")
      setSelectedPages([])
      setEditTagId(null)
      setError(null)
    }
  }, [isDialogOpen])

  // Populate form when editing a tag
  useEffect(() => {
    if (editTagId) {
      const tagToEdit = tags.find(tag => tag.id === editTagId)
      if (tagToEdit) {
        setNewTagName(tagToEdit.name)
        setNewTagColor(tagToEdit.color)
        setSelectedPages(tagToEdit.pageAssociations)
      }
    }
  }, [editTagId, tags])

  const handleEditTag = (id: string) => {
    setEditTagId(id)
    setIsDialogOpen(true)
  }

  const handleDeleteTag = (id: string) => {
    setTags(prevTags => prevTags.filter(tag => tag.id !== id))
    setSuccess("Tag deleted successfully")
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleSaveTag = () => {
    // Validation
    if (!newTagName.trim()) {
      setError("Tag name is required")
      return
    }

    if (selectedPages.length === 0) {
      setError("Please select at least one page association")
      return
    }

    // Check if tag name already exists (except for the one being edited)
    const nameExists = tags.some(tag => 
      tag.name.toLowerCase() === newTagName.toLowerCase() && 
      (!editTagId || tag.id !== editTagId)
    )

    if (nameExists) {
      setError(`A tag named "${newTagName}" already exists`)
      return
    }

    if (editTagId) {
      // Update existing tag
      setTags(prevTags => 
        prevTags.map(tag => 
          tag.id === editTagId 
            ? { ...tag, name: newTagName, color: newTagColor, pageAssociations: selectedPages }
            : tag
        )
      )
      setSuccess("Tag updated successfully")
    } else {
      // Create new tag
      const newTag: TagItem = {
        id: `tag-${Date.now()}`,
        name: newTagName,
        color: newTagColor,
        pageAssociations: selectedPages
      }
      setTags(prevTags => [...prevTags, newTag])
      setSuccess("New tag created successfully")
    }

    // Close dialog and reset form
    setIsDialogOpen(false)
    setTimeout(() => setSuccess(null), 3000)
  }

  const togglePageSelection = (pageId: string) => {
    setSelectedPages(prevSelected => 
      prevSelected.includes(pageId)
        ? prevSelected.filter(id => id !== pageId)
        : [...prevSelected, pageId]
    )
  }

  const colorOptions = [
    { value: "#4f46e5", label: "Blue" },
    { value: "#9333ea", label: "Purple" },
    { value: "#10b981", label: "Green" },
    { value: "#f43f5e", label: "Red" },
    { value: "#fb923c", label: "Orange" },
    { value: "#64748b", label: "Gray" }
  ]

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tag Management</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage tags for content organization
          </p>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Available Tags</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditTagId(null)
                setNewTagName("")
                setNewTagColor("#4f46e5")
                setSelectedPages([])
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editTagId ? "Edit Tag" : "Create New Tag"}</DialogTitle>
                <DialogDescription>
                  {editTagId 
                    ? "Make changes to the existing tag" 
                    : "Define a new tag to organize content"
                  }
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="tag-name">Tag Name</Label>
                  <Input 
                    id="tag-name" 
                    value={newTagName} 
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Enter tag name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tag-color">Tag Color</Label>
                  <Select 
                    value={newTagColor}
                    onValueChange={setNewTagColor}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a color" />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map(color => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-2" 
                              style={{ backgroundColor: color.value }}
                            />
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      className="px-2 py-1"
                      style={{ 
                        backgroundColor: newTagColor,
                        color: 'white',
                      }}
                    >
                      {newTagName || "Tag Name"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Page Associations</Label>
                  <p className="text-sm text-muted-foreground">
                    Select which pages this tag should appear on
                  </p>
                  <ScrollArea className="h-[200px] rounded-md border p-2">
                    <div className="space-y-2">
                      {pages.map(page => (
                        <div key={page.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={page.id}
                            checked={selectedPages.includes(page.id.replace('page-', ''))}
                            onCheckedChange={() => togglePageSelection(page.id.replace('page-', ''))}
                          />
                          <Label 
                            htmlFor={page.id}
                            className="cursor-pointer"
                          >
                            {page.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveTag}>
                  {editTagId ? "Save Changes" : "Create Tag"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <Check className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/5">Tag</TableHead>
                  <TableHead className="w-1/5">Color</TableHead>
                  <TableHead className="w-2/5">Page Associations</TableHead>
                  <TableHead className="w-1/5 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tags.map(tag => (
                  <TableRow key={tag.id}>
                    <TableCell>
                      <Badge 
                        className="px-2 py-1"
                        style={{ 
                          backgroundColor: tag.color,
                          color: 'white',
                        }}
                      >
                        {tag.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: tag.color }}  
                        />
                        <span>
                          {colorOptions.find(c => c.value === tag.color)?.label || tag.color}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {tag.pageAssociations.map(pageId => {
                          const page = pages.find(p => p.id === `page-${pageId}`)
                          return page ? (
                            <Badge key={pageId} variant="outline">
                              {page.name}
                            </Badge>
                          ) : null
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditTag(tag.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteTag(tag.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 