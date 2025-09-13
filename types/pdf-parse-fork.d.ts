declare module 'pdf-parse-fork' {
  interface PDFData {
    text: string;
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
  }

  function pdfParse(buffer: Buffer | Uint8Array): Promise<PDFData>;

  export = pdfParse;
}