import * as pdfjsLib from 'pdfjs-dist';

// Set up worker source for browser pdf parsing
try {
  // Use official CDN or bundled worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
} catch {
  // worker fallback
}

/**
 * Extracts plain text from an uploaded File (PDF or text file)
 */
export async function extractTextFromFile(file: File): Promise<{ text: string; pageCount?: number }> {
  const fileName = file.name.toLowerCase();

  // If plain text / markdown / csv / doc txt
  if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.csv') || file.type.startsWith('text/')) {
    const text = await file.text();
    return { text };
  }

  // If PDF file
  if (fileName.endsWith('.pdf') || file.type === 'application/pdf') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;
      let fullText = '';

      // Extract up to 25 pages
      const pagesToExtract = Math.min(totalPages, 25);
      for (let pageNum = 1; pageNum <= pagesToExtract; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageItems = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ');
        fullText += `--- Page ${pageNum} ---\n${pageItems}\n\n`;
      }

      const cleanText = fullText.trim();
      if (!cleanText || cleanText.length < 20) {
        throw new Error('Could not extract readable text from this PDF (it may contain only scanned images).');
      }

      return {
        text: cleanText,
        pageCount: totalPages,
      };
    } catch (err: any) {
      console.warn('PDF extraction issue:', err);
      // If pdfjs fails, try basic fallback
      throw new Error(err.message || 'Unable to parse text from the PDF file. Please ensure it is not password-protected or purely scanned images.');
    }
  }

  // Fallback for other file types
  try {
    const text = await file.text();
    return { text };
  } catch {
    throw new Error(`Unsupported file type: ${file.name}. Please upload a PDF or text file.`);
  }
}
