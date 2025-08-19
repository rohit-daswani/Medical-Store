import { ImageAnnotatorClient } from '@google-cloud/vision';

// Check if all required environment variables are present
const hasValidCredentials = () => {
  return !!(
    process.env.GOOGLE_CLOUD_PROJECT_ID &&
    process.env.GOOGLE_CLOUD_CLIENT_EMAIL &&
    process.env.GOOGLE_CLOUD_PRIVATE_KEY
  );
};

// Initialize Google Cloud Vision client only if credentials are available
let vision: ImageAnnotatorClient | null = null;

if (hasValidCredentials()) {
  try {
    vision = new ImageAnnotatorClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
    });
  } catch (error) {
    console.error('Failed to initialize Google Cloud Vision client:', error);
    vision = null;
  }
}

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
    // Check if Google Vision client is available
    if (!vision) {
      throw new Error('Google Cloud Vision API is not properly configured. Please check your environment variables: GOOGLE_CLOUD_PROJECT_ID, GOOGLE_CLOUD_CLIENT_EMAIL, and GOOGLE_CLOUD_PRIVATE_KEY');
    }

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
    // Check if Google Vision client is available
    if (!vision) {
      throw new Error('Google Cloud Vision API is not properly configured. Please check your environment variables: GOOGLE_CLOUD_PROJECT_ID, GOOGLE_CLOUD_CLIENT_EMAIL, and GOOGLE_CLOUD_PRIVATE_KEY');
    }

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
    console.log('Raw extracted text:', text);
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length === 0) {
      return {
        success: false,
        data: [],
        headers: [],
        error: 'No text content found'
      };
    }

    // Look for table headers more intelligently
    let headerLineIndex = -1;
    let headers: string[] = [];
    
    // Common pharmacy invoice/table headers to look for
    const tableHeaderKeywords = [
      'hsn', 'code', 'description', 'pack', 'mfr', 'batch', 'exp', 'qty', 'quantity', 
      'free', 'mrp', 'rate', 'price', 'disc', 'cgst', 'sgst', 'igst', 'amount',
      'medicine', 'name', 'manufacturer', 'expiry', 'gst'
    ];

    // Find the line that looks most like table headers
    for (let i = 0; i < Math.min(lines.length, 50); i++) {
      const line = lines[i].toLowerCase();
      const originalLine = lines[i];
      const columns = parseLineIntoColumns(originalLine);
      
      console.log(`Line ${i}: "${originalLine}" -> Columns:`, columns);
      
      // Check if this line contains multiple table header keywords
      const headerMatches = tableHeaderKeywords.filter(keyword => 
        line.includes(keyword)
      ).length;
      
      console.log(`Line ${i} header matches:`, headerMatches, 'Keywords found:', tableHeaderKeywords.filter(keyword => line.includes(keyword)));
      
      // Special check for the exact header pattern we see in the logs
      const isExactHeaderPattern = line.includes('hsn code') && line.includes('description') && line.includes('pack') && line.includes('mfr');
      
      // If we find a line with multiple header keywords and multiple columns, it's likely the header
      if ((headerMatches >= 3 && columns.length >= 4) || isExactHeaderPattern) {
        headerLineIndex = i;
        headers = columns;
        console.log('Found header line at index:', i, 'Headers:', headers);
        break;
      }
    }

    // If no clear headers found, look for lines that seem to be structured data
    if (headerLineIndex === -1) {
      // Look for lines with numbers and text that could be medicine data
      for (let i = 0; i < Math.min(lines.length, 15); i++) {
        const columns = parseLineIntoColumns(lines[i]);
        const line = lines[i].toLowerCase();
        
        // Check if line contains medicine-like data (has numbers, text, possibly dates)
        const hasNumbers = /\d/.test(line);
        const hasText = /[a-zA-Z]/.test(line);
        const seemsLikeData = hasNumbers && hasText && columns.length >= 4;
        
        if (seemsLikeData) {
          // Create headers based on common pharmacy invoice structure
          if (columns.length >= 8) {
            headers = ['HSN Code', 'Description', 'Pack', 'Mfr', 'Batch No', 'Exp Dt', 'Qty', 'Free', 'MRP', 'Rate', 'Disc%', 'CGST%', 'Amount'].slice(0, columns.length);
          } else if (columns.length >= 6) {
            headers = ['Medicine Name', 'Batch No', 'Expiry Date', 'Quantity', 'MRP', 'Amount'].slice(0, columns.length);
          } else {
            headers = ['Medicine Name', 'Quantity', 'Price', 'Amount'].slice(0, columns.length);
          }
          headerLineIndex = i - 1; // Start data from this line
          console.log('Inferred headers based on data structure:', headers);
          break;
        }
      }
    }

    // If still no headers, use defaults but try to extract actual columns from the text
    if (headerLineIndex === -1) {
      // Look for any line with multiple columns that could be data
      for (let i = 0; i < Math.min(lines.length, 10); i++) {
        const columns = parseLineIntoColumns(lines[i]);
        if (columns.length >= 4) {
          headers = ['Column 1', 'Column 2', 'Column 3', 'Column 4', 'Column 5', 'Column 6', 'Column 7', 'Column 8', 'Column 9', 'Column 10'].slice(0, columns.length);
          headerLineIndex = i - 1;
          console.log('Using generic headers for', columns.length, 'columns');
          break;
        }
      }
    }

    // Extract data lines
    const dataStartIndex = Math.max(0, headerLineIndex + 1);
    const dataLines = lines.slice(dataStartIndex);
    
    console.log('Data starts at line:', dataStartIndex, 'Total data lines:', dataLines.length);

    // Parse data lines
    const data: ExtractedData[] = [];
    for (const line of dataLines.slice(0, 15)) { // Limit to first 15 items
      const columns = parseLineIntoColumns(line);
      
      // Skip lines that don't seem to be data (too few columns, or contain common non-data text)
      const lineText = line.toLowerCase();
      const skipKeywords = ['total', 'subtotal', 'discount', 'tax', 'amount', 'bank', 'details', 'terms', 'conditions', 'page', 'advance', 'payment'];
      const shouldSkip = skipKeywords.some(keyword => lineText.includes(keyword)) && !lineText.includes('belladonna');
      
      if (columns.length >= 2 && !shouldSkip) {
        const row: ExtractedData = {};
        headers.forEach((header, index) => {
          row[header] = columns[index] || '';
        });
        
        // Only add if we have meaningful data in the first column
        const firstColumnData = row[headers[0]]?.trim();
        if (firstColumnData && firstColumnData.length > 0 && !firstColumnData.match(/^\d+$/)) {
          data.push(row);
          console.log('Added row:', row);
        }
      }
    }

    console.log('Final parsed data:', data);
    console.log('Final headers:', headers);

    if (data.length === 0) {
      return {
        success: false,
        data: [],
        headers: [],
        error: 'No structured medicine data found in the text. The extracted text may not contain a recognizable table format.'
      };
    }

    return {
      success: true,
      data,
      headers,
    };
  } catch (error) {
    console.error('Error parsing extracted text:', error);
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
  // Clean the line first
  const cleanLine = line.trim();
  
  // Try different separators in order of preference
  const separators = ['\t', '|'];
  
  for (const separator of separators) {
    const columns = cleanLine.split(separator).map(col => col.trim()).filter(col => col.length > 0);
    if (columns.length > 1) {
      return columns;
    }
  }
  
  // For pharmacy invoices, try to split by multiple spaces (common in table layouts)
  // This handles cases where columns are separated by multiple spaces
  let spaceColumns = cleanLine.split(/\s{3,}/).map(col => col.trim()).filter(col => col.length > 0);
  if (spaceColumns.length > 1) {
    return spaceColumns;
  }
  
  // Try splitting by 2 or more spaces
  spaceColumns = cleanLine.split(/\s{2,}/).map(col => col.trim()).filter(col => col.length > 0);
  if (spaceColumns.length > 1) {
    return spaceColumns;
  }
  
  // For structured data like "12345678 Belladonna 30 100 ml WS 025488", 
  // try to split intelligently by looking for patterns
  const words = cleanLine.split(/\s+/);
  if (words.length >= 4) {
    // Try to group words that belong together
    const columns: string[] = [];
    let currentColumn = '';
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      // If it's a number and we have a current column, start a new column
      if (/^\d+$/.test(word) && currentColumn.trim()) {
        columns.push(currentColumn.trim());
        currentColumn = word;
      }
      // If it's a date-like pattern (like "10-2025"), start new column
      else if (/^\d{1,2}-\d{4}$/.test(word) && currentColumn.trim()) {
        columns.push(currentColumn.trim());
        currentColumn = word;
      }
      // If it's a decimal number and we have content, start new column
      else if (/^\d+\.\d+$/.test(word) && currentColumn.trim()) {
        columns.push(currentColumn.trim());
        currentColumn = word;
      }
      else {
        currentColumn += (currentColumn ? ' ' : '') + word;
      }
    }
    
    // Add the last column
    if (currentColumn.trim()) {
      columns.push(currentColumn.trim());
    }
    
    if (columns.length > 1) {
      return columns;
    }
  }
  
  // Try comma separation as last resort
  const commaColumns = cleanLine.split(',').map(col => col.trim()).filter(col => col.length > 0);
  if (commaColumns.length > 1) {
    return commaColumns;
  }
  
  // Fallback: return the whole line as a single column
  return [cleanLine];
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
