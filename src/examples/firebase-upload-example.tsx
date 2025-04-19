"use client";

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileUpload } from '@/components/ui/file-upload'
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'
import { firestore, storage } from '@/lib/firebase'
import { Trash2, FileIcon, ExternalLink } from 'lucide-react'

interface StoredFile {
  id: string
  name: string
  url: string
  contentType: string
  size: number
  createdAt: Date
  path: string
}

export function FirebaseStorageExample() {
  const [files, setFiles] = useState<StoredFile[]>([])
  const [loading, setLoading] = useState(true)

  // Collection reference
  const filesCollectionRef = collection(firestore, 'uploadedFiles')

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      setLoading(true)
      const querySnapshot = await getDocs(query(filesCollectionRef, orderBy('createdAt', 'desc')))
      
      const fetchedFiles: StoredFile[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        fetchedFiles.push({
          id: doc.id,
          name: data.name,
          url: data.url,
          contentType: data.contentType,
          size: data.size,
          createdAt: data.createdAt.toDate(),
          path: data.path
        })
      })
      
      setFiles(fetchedFiles)
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadComplete = async (url: string, file: File) => {
    try {
      // Store file metadata in Firestore
      const path = `uploads/${file.name}-${Date.now()}`
      
      await addDoc(filesCollectionRef, {
        name: file.name,
        url: url,
        contentType: file.type,
        size: file.size,
        createdAt: new Date(),
        path: path
      })
      
      // Refresh the file list
      fetchFiles()
    } catch (error) {
      console.error('Error storing file metadata:', error)
    }
  }

  const handleDelete = async (fileId: string, filePath: string) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(firestore, 'uploadedFiles', fileId))
      
      // Delete from Storage
      const storageRef = ref(storage, filePath)
      await deleteObject(storageRef)
      
      // Update UI
      setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId))
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes'
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / 1048576).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Files to Firebase Storage</CardTitle>
          <CardDescription>
            Upload files to Firebase Storage and manage them with Firestore
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload
            onUploadComplete={handleUploadComplete}
            folder="uploads"
            maxSizeMB={10}
            buttonText="Upload a File (Max 10MB)"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Files</CardTitle>
          <CardDescription>
            View and manage your uploaded files
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading files...</p>
          ) : files.length === 0 ? (
            <p>No files uploaded yet.</p>
          ) : (
            <div className="space-y-4">
              {files.map((file) => (
                <Card key={file.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <FileIcon className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <div className="text-sm text-muted-foreground">
                            {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => window.open(file.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDelete(file.id, file.path)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 