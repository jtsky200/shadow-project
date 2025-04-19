# PDF to Web Assets Extraction Tool

This tool extracts content from PDF files and converts it into web-friendly formats including text, images, and structured JSON data.

## Prerequisites

Before running the script, make sure you have:

1. Node.js installed (v14 or higher recommended)
2. Poppler installed for PDF to image conversion:
   - **Windows**: Download from [Poppler for Windows](https://blog.alivate.com.au/poppler-windows/) or use the included poppler-25.04.0 directory
   - **macOS**: `brew install poppler`
   - **Linux**: `sudo apt-get install poppler-utils`

## Installation

1. Install the required Node.js dependencies:

```bash
npm install pdf-parse pdf-poppler tesseract.js fs-extra
```

## Usage

1. Place your PDF file in the appropriate location (default: `./pdf/LYRIQ-24-Owner-Manual-EU-EN.pdf`)
2. Run the script:

```bash
node extractPdfToWebAssets.js
```

3. The processed files will be available in `./public/assets/manual/`

## Configuration

You can modify the configuration section at the top of the script:

```javascript
const config = {
  inputPdfPath: './pdf/LYRIQ-24-Owner-Manual-EU-EN.pdf', // Path to your input PDF
  outputDir: './public/assets/manual', // Output directory for all generated files
  tempDir: './temp-output-pages', // Temporary directory for processing
  ocrLanguage: 'eng', // OCR language ('eng' for English, 'deu' for German, etc.)
  imageFormat: 'jpg', // Output image format (jpg, png)
  imageQuality: 80, // Image quality for JPEGs (1-100)
  dpi: 150 // DPI for image rendering
};
```

### Changing OCR Language

To change the OCR language, modify the `ocrLanguage` parameter in the configuration:

```javascript
ocrLanguage: 'eng', // English (default)
// ocrLanguage: 'deu', // German
// ocrLanguage: 'fra', // French
// ocrLanguage: 'spa', // Spanish
// ocrLanguage: 'ita', // Italian
// ocrLanguage: 'jpn', // Japanese
// ocrLanguage: 'kor', // Korean
// ocrLanguage: 'chi_sim', // Chinese (Simplified)
// ocrLanguage: 'chi_tra', // Chinese (Traditional)
```

For a complete list of supported languages, see the [Tesseract documentation](https://tesseract-ocr.github.io/tessdoc/Data-Files-in-different-versions.html).

## Output Files

The script generates the following files in the output directory:

1. **manual-text.txt**: Raw text extracted directly from the PDF
2. **ocr-full.txt**: Combined OCR text from all pages
3. **ocr-page-N.txt**: OCR text for each individual page
4. **page-N.jpg**: Image rendering of each page (JPG format by default)
5. **page-N.md**: Markdown file for each page containing both OCR and PDF text
6. **manual-content.json**: Structured JSON data containing all page information

### JSON Data Format

The generated JSON file follows this structure:

```json
[
  {
    "page": 1,
    "image": "page-1.jpg",
    "ocrText": "Text from OCR processing",
    "rawText": "Text directly extracted from PDF"
  },
  ...
]
```

## Markdown Format Sample

Each generated markdown file follows this format:

```markdown
## Page 1
![Page 1](page-1.jpg)

### OCR Text
```
Text extracted using OCR
```

### Parsed PDF Text
```
Text directly extracted from the PDF
```
```

## Troubleshooting

- If you encounter issues with Poppler, make sure it's correctly installed and accessible in your PATH
- For large PDFs, the process may take a long time due to OCR processing
- If memory issues occur, try processing the PDF in smaller batches

## License

This tool is provided as-is with no warranty. Use at your own risk. 