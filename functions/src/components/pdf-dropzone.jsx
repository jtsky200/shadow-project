import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function PdfDropzone({ onPdfProcessed }) {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    
    setFiles(acceptedFiles);
    setProcessing(true);
    setProgress(10);
    setError(null);
    
    try {
      // Check if file is too large (>10MB)
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File too large. Maximum size is 10MB.');
      }

      setProgress(30);
      
      // Create FormData to send the file
      const formData = new FormData();
      formData.append('pdf', file);
      
      // Send to API endpoint
      const response = await fetch('/api/processPdf', {
        method: 'POST',
        body: formData,
      });
      
      setProgress(70);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process PDF');
      }
      
      const data = await response.json();
      setProgress(100);
      
      // Call the callback with processed data
      if (onPdfProcessed) {
        onPdfProcessed(data);
      }
    } catch (err) {
      console.error('Error processing PDF:', err);
      setError(err.message || 'Failed to process PDF');
    } finally {
      setProcessing(false);
    }
  }, [onPdfProcessed]);

  const removeFile = useCallback(() => {
    setFiles([]);
    setError(null);
    setProgress(0);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div className="w-full mb-4">
      {files.length > 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm max-w-xs truncate">
                  {files[0].name} ({(files[0].size / 1024 / 1024).toFixed(2)} MB)
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={removeFile}
                disabled={processing}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {processing && (
              <div className="mt-2">
                <Progress value={progress} className="h-1" />
                <div className="text-xs text-muted-foreground mt-1">
                  Processing PDF...
                </div>
              </div>
            )}
            
            {error && (
              <div className="mt-2 flex items-center text-xs text-destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-center text-muted-foreground">
            {isDragActive
              ? 'Drop PDF here...'
              : 'Drag & drop a PDF file here, or click to select'}
          </p>
          <p className="text-xs text-center text-muted-foreground mt-1">
            Max file size: 10MB
          </p>
        </div>
      )}
    </div>
  );
} 