"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Upload, X, Check, File } from 'lucide-react'
import { uploadFileWithProgress, generateFilePath } from '@/lib/fileUpload'

interface FileUploadProps {
  onUploadComplete?: (url: string, file: File) => void
  onUploadError?: (error: Error) => void
  accept?: string
  maxSizeMB?: number
  folder?: string
  userId?: string
  buttonText?: string
  className?: string
}

export function FileUpload({
  onUploadComplete,
  onUploadError,
  accept = '*',
  maxSizeMB = 5,
  folder = 'uploads',
  userId,
  buttonText = 'Upload File',
  className = '',
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [uploadComplete, setUploadComplete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const maxSizeBytes = maxSizeMB * 1024 * 1024 // Convert MB to bytes

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setError(null)
    setUploadComplete(false)

    if (!selectedFile) {
      setFile(null)
      return
    }

    // Check file size
    if (selectedFile.size > maxSizeBytes) {
      setError(`File size exceeds the maximum limit of ${maxSizeMB}MB`)
      setFile(null)
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      setUploading(true)
      setProgress(0)
      setError(null)

      // Generate a unique path for the file
      const path = generateFilePath(file, userId, folder)

      // Try to use our utility function, but catch any errors
      try {
        // Upload the file to Firebase Storage
        const downloadURL = await uploadFileWithProgress(
          file, 
          path,
          (progress: number) => {
            setProgress(progress)
          }
        )

        // Set upload as complete
        setUploadComplete(true)
        setUploading(false)

        // Call the onUploadComplete callback with the download URL
        if (onUploadComplete) {
          onUploadComplete(downloadURL, file)
        }
      } catch (uploadError) {
        console.error('Firebase storage upload failed, trying API fallback:', uploadError);
        
        // Fallback to server API
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Upload API error: ${response.status}`);
        }
        
        const data = await response.json();
        setUploadComplete(true);
        setUploading(false);
        
        if (onUploadComplete && data.url) {
          onUploadComplete(data.url, file);
        }
      }
    } catch (err) {
      setUploading(false)
      const error = err instanceof Error ? err : new Error('Unknown upload error')
      setError(error.message)
      
      if (onUploadError) {
        onUploadError(error)
      }
    }
  }

  const clearFile = () => {
    setFile(null)
    setError(null)
    setUploadComplete(false)
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
        id="file-upload"
      />
      
      {!file && (
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-32 border-dashed flex flex-col gap-2"
          >
            <Upload className="h-6 w-6" />
            <span>{buttonText}</span>
          </Button>
        </div>
      )}

      {file && (
        <div className="border rounded-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <File className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!uploading && !uploadComplete && (
                <>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleUpload}
                  >
                    Upload
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={clearFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              {uploadComplete && (
                <div className="flex items-center text-green-500">
                  <Check className="h-5 w-5 mr-1" />
                  <span>Complete</span>
                </div>
              )}
            </div>
          </div>
          
          {uploading && (
            <div className="mt-4 space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center">{Math.round(progress)}% uploaded</p>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
} 