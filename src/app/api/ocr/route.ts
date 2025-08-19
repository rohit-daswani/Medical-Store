import { NextRequest, NextResponse } from 'next/server';
import { processFileWithVision } from '@/lib/google-vision';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { base64File, fileType } = body;

    if (!base64File || !fileType) {
      return NextResponse.json(
        { error: 'Missing base64File or fileType' },
        { status: 400 }
      );
    }

    if (!['image', 'pdf'].includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Must be "image" or "pdf"' },
        { status: 400 }
      );
    }

    // Process the file with Google Cloud Vision
    const result = await processFileWithVision(base64File, fileType as 'image' | 'pdf');

    if (!result.success) {
      // Check if it's a configuration error, provide fallback mock data
      const errorMessage = result.error || 'Failed to process file';
      const isConfigError = errorMessage.includes('Google Cloud Vision API is not properly configured');
      
      if (isConfigError) {
        // Provide mock data based on common pharmacy invoice structure
        const mockHeaders = ['HSN Code', 'Description', 'Pack', 'Mfr', 'Batch No', 'Exp Dt', 'Qty', 'Free', 'MRP', 'Rate', 'Disc%', 'CGST%', 'Amount'];
        const mockData = [
          {
            'HSN Code': '12345678',
            'Description': 'Belladonna 30',
            'Pack': '100 ml',
            'Mfr': 'WS',
            'Batch No': '025488',
            'Exp Dt': '10-2025',
            'Qty': '10',
            'Free': '2',
            'MRP': '165',
            'Rate': '157.14',
            'Disc%': '10',
            'CGST%': '5',
            'Amount': '1484.98'
          },
          {
            'HSN Code': '12345678',
            'Description': '1/2 dram plastic',
            'Pack': '1 GROSS',
            'Mfr': 'ZDef',
            'Batch No': 'd3706',
            'Exp Dt': '',
            'Qty': '5',
            'Free': '0',
            'MRP': '180',
            'Rate': '180',
            'Disc%': '0',
            'CGST%': '12',
            'Amount': '1008'
          }
        ];

        return NextResponse.json({
          success: true,
          data: mockData,
          headers: mockHeaders,
          message: `Demo mode: Showing sample pharmacy invoice structure with ${mockData.length} medicine records and ${mockHeaders.length} columns. Configure Google Cloud Vision API for real OCR processing.`,
          isDemo: true
        });
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      headers: result.headers,
      message: `Successfully extracted ${result.data.length} medicine records with ${result.headers.length} columns`
    });

  } catch (error) {
    console.error('OCR API Error:', error);
    
    // Check if it's a Google Cloud Vision configuration error
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const isConfigError = errorMessage.includes('Google Cloud Vision API is not properly configured');
    
    return NextResponse.json(
      { 
        error: isConfigError 
          ? 'OCR service is currently unavailable. Please contact the administrator to configure Google Cloud Vision API credentials.'
          : errorMessage,
        details: isConfigError 
          ? 'The required environment variables for Google Cloud Vision API are missing or invalid.'
          : 'Failed to process OCR request',
        configurationRequired: isConfigError
      },
      { status: isConfigError ? 503 : 500 }
    );
  }
}
