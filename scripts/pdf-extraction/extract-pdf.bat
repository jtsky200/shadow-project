@echo off
echo ======================================================
echo     Cadillac Vehicle Documentation Extraction Tool
echo ======================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo ERROR: Node.js is not installed or not in PATH.
  echo Please install Node.js from https://nodejs.org/
  pause
  exit /b 1
)

REM Check if Poppler is available
if not exist "poppler-bin\utils\pdfinfo.exe" (
  echo Poppler binaries not found. Please download from:
  echo https://github.com/oschwartz10612/poppler-windows/releases/
  echo and extract to a folder named 'poppler-bin' in this directory.
  echo.
  echo Press any key to open the download page...
  pause >nul
  start "" "https://github.com/oschwartz10612/poppler-windows/releases/"
  echo.
  echo After downloading and extracting, run this script again.
  pause
  exit /b 1
)

REM Make sure Poppler is in PATH
set PATH=%PATH%;%~dp0poppler-bin\utils

echo Using Poppler from: %~dp0poppler-bin\utils
echo.

REM Check if PDF files exist
if not exist "pdf\LYRIQ-24-Owner-Manual-EU-EN.pdf" (
  echo ERROR: PDF files not found in the pdf directory.
  echo Please ensure all required PDF files are in the pdf directory.
  pause
  exit /b 1
)

echo Found PDF files for processing:
echo - LYRIQ-24-Owner-Manual-EU-EN.pdf
echo - 2024-CADILLAC-LYRIQ-SPECIFICATIONS-ENGLISH.pdf
echo - GME_Cadillac_LYRIQ_QUICKSTART_GUIDE_EN.pdf
echo - 2025-optiq-owners-manual.pdf
echo.
echo Warning: This process can take several minutes depending on the size of the PDFs.
echo Only the first 10 pages of each PDF will be processed by default.
echo.
echo Press any key to start processing...
pause >nul

REM Create output directory if it doesn't exist
if not exist "public\assets\manuals" mkdir "public\assets\manuals"

REM Run the extraction script
echo Running PDF extraction script...
node extractPdfToWebAssets.js

echo.
if %ERRORLEVEL% equ 0 (
  echo PDF extraction completed successfully!
  echo Output files are available in public/assets/manuals/
  echo.
  echo The following directories were created:
  echo - public/assets/manuals/lyriq-manual
  echo - public/assets/manuals/lyriq-specifications
  echo - public/assets/manuals/lyriq-quickstart
  echo - public/assets/manuals/optiq-manual
  echo.
  echo Each directory contains:
  echo - content.json: Extracted content with OCR text
  echo - metadata.json: PDF metadata
  echo - manual-text.txt: Raw text from PDF
  echo - ocr-*.txt: OCR extracted text
  echo - page-*.jpg: Page images
  echo - page-*.md: Markdown files for each page
) else (
  echo ERROR: PDF extraction failed with error code %ERRORLEVEL%
)

pause 