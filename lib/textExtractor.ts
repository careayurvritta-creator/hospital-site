/**
 * Client-side text extraction for document analysis
 * Extracts text from PDFs before sending to Nvidia
 */

export async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    return await extractTextFromPDF(file);
  }
  
  if (file.type.startsWith('image/')) {
    return await extractTextFromImage(file);
  }
  
  throw new Error('Unsupported file type. Please upload PDF or image files.');
}

async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Load pdf.js from CDN
    const pdfjsPath = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
    
    // Dynamically load pdf.js
    await new Promise<void>((resolve, reject) => {
      if ((window as any).pdfjsLib) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = pdfjsPath + 'pdf.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load PDF.js'));
      document.head.appendChild(script);
    });
    
    // Set worker path
    (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsPath + 'pdf.worker.min.js';
    
    const pdf = await (window as any).pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText.trim() || 'No text found in PDF. The document may be image-based.';
  } catch (error) {
    console.error('[TextExtractor] PDF extraction failed:', error);
    throw new Error('Failed to extract text from PDF. Please try an image file instead.');
  }
}

async function extractTextFromImage(file: File): Promise<string> {
  try {
    // Load Tesseract.js from CDN
    const tesseractPath = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
    
    await new Promise<void>((resolve, reject) => {
      if ((window as any).Tesseract) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = tesseractPath;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Tesseract.js'));
      document.head.appendChild(script);
    });
    
    const base64 = await fileToBase64(file);
    
    const result = await (window as any).Tesseract.recognize(base64, 'eng', {
      logger: (m: any) => {
        if (m.status === 'recognizing text') {
          console.log(`[TextExtractor] OCR progress: ${(m.progress * 100).toFixed(0)}%`);
        }
      }
    });
    
    return result.data.text.trim() || 'No text found in image.';
  } catch (error) {
    console.error('[TextExtractor] Image OCR failed:', error);
    throw new Error('Failed to extract text from image. Please try a clearer image or PDF.');
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
