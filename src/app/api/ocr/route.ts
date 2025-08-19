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
      return NextResponse.json(
        { error: result.error || 'Failed to process file' },
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
