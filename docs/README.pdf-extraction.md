# PDF Content Extraction System

This system extracts content from PDF manuals and converts it to web-friendly formats, making it accessible through our application's document viewer.

## Overview

The extraction process:
1. Parses PDF text content directly
2. Renders each page as an image
3. Performs OCR on the images to improve text recognition
4. Creates JSON data structures linking all content
5. Generates markdown files for easy viewing

## Setup Requirements

1. **Node.js** (v14 or higher)
2. **Poppler** for PDF-to-image conversion
3. **Tesseract.js** for OCR processing (installed automatically)

## Installation

### Step 1: Install Dependencies

All Node.js dependencies will be installed automatically when you run:
```bash
npm install
```

### Step 2: Install Poppler

For Windows:
1. Download Poppler from [GitHub Releases](https://github.com/oschwartz10612/poppler-windows/releases/)
2. Extract to a folder named `poppler-bin` in the project root

For macOS:
```bash
brew install poppler
```

For Linux:
```bash
sudo apt-get install poppler-utils
```

## Running the Extraction

### Option 1: Using the Batch File (Windows)

Simply double-click the `extract-pdf.bat` file. It will:
- Check if Node.js is installed
- Check if Poppler is installed
- Run the extraction process

### Option 2: Manual Execution

Run:
```bash
node extractPdfToWebAssets.js
```

## Configuration

You can modify the configuration in `extractPdfToWebAssets.js`:

```javascript
const config = {
  inputPdfPath: './pdf/LYRIQ-24-Owner-Manual-EU-EN.pdf',
  outputDir: './public/assets/manual',
  tempDir: './temp-output-pages',
  ocrLanguage: 'eng',
  imageFormat: 'jpg',
  imageQuality: 80,
  dpi: 150
};
```

### Changing Languages

To process PDFs in different languages, change the `ocrLanguage` parameter:
- English: `'eng'`
- German: `'deu'`
- French: `'fra'`
- Spanish: `'spa'`
- See [Tesseract documentation](https://tesseract-ocr.github.io/tessdoc/Data-Files-in-different-versions.html) for more languages

## Output Files

The extraction process generates these files in `public/assets/manual/`:

- **manual-text.txt**: Raw text from PDF
- **ocr-full.txt**: All OCR text combined
- **ocr-page-N.txt**: OCR text for each page
- **page-N.jpg**: Image of each page
- **page-N.md**: Markdown file for each page
- **manual-content.json**: Structured JSON data

## Integration with Document Viewer

The extracted content integrates with our document viewer:

1. The document viewer loads `manual-content.json`
2. It displays the extracted text and images
3. Users can navigate through pages and search content

## Troubleshooting

- **Poppler errors**: Ensure Poppler is correctly installed and in PATH
- **Memory issues**: For large PDFs, try processing fewer pages at once
- **OCR issues**: Try adjusting the DPI or image quality

## Updating Content

When new PDF manuals are added:

1. Place the PDF in the `pdf/` directory
2. Update the `inputPdfPath` in the configuration
3. Run the extraction process again

## License & Credits

This extraction system uses:
- [pdf-parse](https://www.npmjs.com/package/pdf-parse) for text extraction
- [pdf-poppler](https://www.npmjs.com/package/pdf-poppler) for rendering
- [tesseract.js](https://www.npmjs.com/package/tesseract.js) for OCR
- [fs-extra](https://www.npmjs.com/package/fs-extra) for file operations 