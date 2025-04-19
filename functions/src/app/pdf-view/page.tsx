"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { FileText, ChevronLeft, ChevronRight, Upload, Download } from "lucide-react"
import Link from "next/link"
import { Document, Page, pdfjs } from "react-pdf"

// Set pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

export default function PdfViewPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [numPages, setNumPages] = useState<number>(1)
  const [pdfFile, setPdfFile] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>("No file selected")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      const fileUrl = URL.createObjectURL(file)
      setPdfFile(fileUrl)
      setCurrentPage(1)
    }
  }

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

  return (
    <div className="flex flex-col h-full min-h-screen p-6 bg-background">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">PDF Viewer</h1>
        <div className="flex space-x-4">
          <Button variant="outline" asChild>
            <Link href="/manuals">
              <FileText className="h-4 w-4 mr-2" />
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

      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 h-full">
        <Card className="w-full h-[calc(100vh-10rem)] flex flex-col">
          <CardHeader>
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
                    width={600}
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
      </div>

      <div className="mt-6">
        <p className="text-muted-foreground text-sm">
          For vehicle-specific documentation, please visit the <Link href="/manuals" className="underline">Vehicle Manuals</Link> section.
        </p>
      </div>
    </div>
  )
} 