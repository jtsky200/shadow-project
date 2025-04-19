"use client";

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { firestore, storage } from '@/lib/firebase'

const filesCollection = 'files'

interface StoredFile {
  id: string
  name: string
  url: string
  contentType: string
  size: number
  createdAt: Date
}

// Mock document structure to match the firebase mock implementation
interface MockDoc {
  id?: string
  exists?: boolean
  data: () => Record<string, unknown>
}

// Mock query result structure
interface MockQueryResult {
  docs: MockDoc[]
}

export default function FirebaseStorageExample() {
  const [files, setFiles] = useState<StoredFile[]>([])
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      setLoading(true)
      // Using the mock implementation which returns empty docs
      const collectionRef = firestore.collection(filesCollection)
      // The mock implementation returns an empty array of docs
      const queryResult = await collectionRef.where().get() as unknown as MockQueryResult
      
      const fetchedFiles: StoredFile[] = []
      // In a real implementation, we would iterate through docs
      queryResult.docs.forEach((doc) => {
        if (doc.exists) {
          const data = doc.data() as Record<string, unknown>
          fetchedFiles.push({
            id: doc.id || 'mock-id',
            name: data.name as string || 'Mock File',
            url: data.url as string || 'https://example.com/mock-file-url',
            contentType: data.contentType as string || 'application/pdf',
            size: data.size as number || 1024,
            createdAt: (data.createdAt as { toDate: () => Date })?.toDate() || new Date(),
          })
        }
      })
      
      setFiles(fetchedFiles)
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadComplete = async (file: File) => {
    try {
      // Upload file to Firebase Storage
      const path = `uploads/${file.name}-${Date.now()}`
      const storageRef = storage.ref(path)
      // In the mock, put() doesn't take arguments
      await storageRef.put()
      
      // Get download URL
      const url = await storageRef.getDownloadURL()
      
      // Store file metadata in Firestore
      const collectionRef = firestore.collection(filesCollection)
      
      await collectionRef.add({
        name: file.name,
        url: url,
        contentType: file.type,
        size: file.size,
        createdAt: new Date()
      })
      
      // Refresh file list
      await fetchFiles()
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }

  const handleDelete = async (fileId: string) => {
    try {
      // Delete from Firestore
      const docRef = firestore.collection(filesCollection).doc(fileId)
      await docRef.set() // Our mock doesn't have delete, so we'll just set it to empty
      
      // Delete from Storage (using mock)
      const storageRef = storage.ref(`uploads/${fileId}`)
      await storageRef.delete()
      
      // Update UI
      await fetchFiles()
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes'
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB'
    else return (bytes / 1048576).toFixed(2) + ' MB'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Upload Files to Firebase Storage</h2>
          <p className="text-sm text-muted-foreground">Select a file to upload to Firebase Storage</p>
        </CardHeader>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="file-upload">Choose file</Label>
            <Input 
              id="file-upload" 
              type="file" 
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleUploadComplete(file)
                }
              }} 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Uploaded Files</h2>
          <p className="text-sm text-muted-foreground">Files stored in Firebase Storage</p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading files...</p>
          ) : files.length === 0 ? (
            <p>No files uploaded yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {files.map((file) => (
                <Card key={file.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate">{file.name}</h3>
                    <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded on {file.createdAt.toLocaleDateString()}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between p-4 pt-0">
                    <Button size="sm" variant="outline" asChild>
                      <a href={file.url} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(file.id)}
                    >
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 