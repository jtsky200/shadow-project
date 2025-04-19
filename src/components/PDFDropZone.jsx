import { useDropzone } from 'react-dropzone';

import { useState } from 'react';

import { Loader2 } from 'lucide-react';

const PDFDropZone = ({ onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': [] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      
      setUploading(true);
      setUploadError(null);
      
      const formData = new FormData();
      formData.append('pdf', acceptedFiles[0]);
      
      try {
        const res = await fetch('/api/upload-pdf', {
          method: 'POST',
          body: formData,
        });
        
        if (!res.ok) {
          throw new Error(`Upload failed: ${res.status}`);
        }
        
        const data = await res.json();
        onUpload(data);
      } catch (err) {
        console.error('PDF upload error:', err);
        setUploadError(err.message || 'Upload failed. Please try again.');
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div 
      {...getRootProps()} 
      className={`border-dashed border-2 p-4 rounded-lg text-center transition-colors cursor-pointer
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/30'}
        ${uploading ? 'opacity-50 pointer-events-none' : ''}
        hover:border-primary hover:bg-primary/5`}
    >
      <input {...getInputProps()} />
      
      {uploading ? (
        <div className="flex flex-col items-center justify-center py-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Uploading PDF...</p>
        </div>
      ) : (
        <div className="py-2">
          <p className="text-sm font-medium">
            {isDragActive 
              ? "Drop the PDF here..." 
              : "📎 Drag & drop a PDF manual, or click to browse"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            PDF content will be used as context for your conversation
          </p>
          
          {uploadError && (
            <p className="mt-2 text-xs text-destructive">{uploadError}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PDFDropZone; 