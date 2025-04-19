declare module 'pdf-parse' {
  interface PDFData {
    text: string;
    numpages: number;
    info: {
      PDFFormatVersion?: string;
      IsAcroFormPresent?: boolean;
      IsXFAPresent?: boolean;
      Title?: string;
      Author?: string;
      Subject?: string;
      Keywords?: string;
      Creator?: string;
      Producer?: string;
      CreationDate?: string;
      ModDate?: string;
      [key: string]: unknown;
    };
    metadata: Record<string, unknown>;
    version: string;
  }

  interface PDFOptions {
    pagerender?: (pageData: Record<string, unknown>) => string;
    max?: number;
    version?: string;
  }

  function pdfParse(
    dataBuffer: Buffer, 
    options?: PDFOptions
  ): Promise<PDFData>;

  export = pdfParse;
} 