import { ImageAnnotatorClient } from '@google-cloud/vision';

// Initialize Google Cloud Vision client
const vision = new ImageAnnotatorClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

export interface ExtractedData {
  [key: string]: string;
}

export interface OCRResult {
  success: boolean;
  data: ExtractedData[];
  headers: string[];
  error?: string;
}

/**
 * Extract text from image using Google Cloud Vision API
 */
export async function extractTextFromImage(base64Image: string): Promise<string> {
  try {
    // Remove data URL prefix if present
    const imageBuffer = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
    
    const [result] = await vision.textDetection({
      image: {
        content: imageBuffer,
      },
    });

    const detections = result.textAnnotations;
    if (!detections || detections.length === 0) {
      throw new Error('No text detected in image');
    }

    // Return the full text detected
    return detections[0].description || '';
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw error;
  }
}

/**
 * Extract structured data from PDF using Google Cloud Vision API
 */
export async function extractTextFromPDF(base64PDF: string): Promise<string> {
  try {
    // Remove data URL prefix if present
    const pdfBuffer = base64PDF.replace(/^data:application\/pdf;base64,/, '');
    
    const [result] = await vision.documentTextDetection({
      image: {
        content: pdfBuffer,
      },
    });

    const fullTextAnnotation = result.fullTextAnnotation;
    if (!fullTextAnnotation || !fullTextAnnotation.text) {
      throw new Error('No text detected in PDF');
    }

    return fullTextAnnotation.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

/**
 * Parse extracted text into structured medicine data
 */
export function parseExtractedText(text: string, fileType: 'image' | 'pdf'): OCRResult {
  try {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length === 0) {
      return {
        success: false,
        data: [],
        headers: [],
        error: 'No text content found'
      };
    }

    // Try to detect if the first line contains headers
    const firstLine = lines[0].toLowerCase();
    const commonHeaders = ['medicine', 'name', 'quantity', 'price', 'batch', 'expiry', 'manufacturer', 'mrp'];
    const hasHeaders = commonHeaders.some(header => firstLine.includes(header));

    let headers: string[] = [];
    let dataLines: string[] = [];

    if (hasHeaders) {
      // First line contains headers
      headers = parseLineIntoColumns(lines[0]);
      dataLines = lines.slice(1);
    } else {
      // No headers detected, create default headers based on file type
      if (fileType === 'pdf') {
        headers = ['Medicine Name', 'Quantity', 'Purchase Price', 'Expiry Date', 'Batch No'];
      } else {
        headers = ['Medicine Name', 'Manufacturer', 'Batch No', 'MRP'];
      }
      dataLines = lines;
    }

    // Parse data lines
    const data: ExtractedData[] = [];
    for (const line of dataLines.slice(0, 10)) { // Limit to first 10 items
      const columns = parseLineIntoColumns(line);
      if (columns.length >= 2) { // At least medicine name and one other field
        const row: ExtractedData = {};
        headers.forEach((header, index) => {
          row[header] = columns[index] || '';
        });
        
        // Only add if we have a medicine name
        if (row[headers[0]] && row[headers[0]].trim().length > 0) {
          data.push(row);
        }
      }
    }

    if (data.length === 0) {
      return {
        success: false,
        data: [],
        headers: [],
        error: 'No structured medicine data found in the text'
      };
    }

    return {
      success: true,
      data,
      headers,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      headers: [],
      error: error instanceof Error ? error.message : 'Unknown parsing error'
    };
  }
}

/**
 * Parse a line of text into columns (handles various separators)
 */
function parseLineIntoColumns(line: string): string[] {
  // Try different separators in order of preference
  const separators = ['\t', '|', ',', ' '];
  
  for (const separator of separators) {
    const columns = line.split(separator).map(col => col.trim()).filter(col => col.length > 0);
    if (columns.length > 1) {
      return columns;
    }
  }
  
  // If no separator works well, try to split by multiple spaces
  const spaceColumns = line.split(/\s{2,}/).map(col => col.trim()).filter(col => col.length > 0);
  if (spaceColumns.length > 1) {
    return spaceColumns;
  }
  
  // Fallback: return the whole line as a single column
  return [line.trim()];
}

/**
 * Main function to process file and extract medicine data
 */
export async function processFileWithVision(
  base64File: string, 
  fileType: 'image' | 'pdf'
): Promise<OCRResult> {
  try {
    let extractedText: string;
    
    if (fileType === 'pdf') {
      extractedText = await extractTextFromPDF(base64File);
    } else {
      extractedText = await extractTextFromImage(base64File);
    }
    
    return parseExtractedText(extractedText, fileType);
  } catch (error) {
    return {
      success: false,
      data: [],
      headers: [],
      error: error instanceof Error ? error.message : 'Failed to process file'
    };
  }
}
