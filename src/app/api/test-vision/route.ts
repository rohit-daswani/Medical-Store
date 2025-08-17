import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check if environment variables are set
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY;

    const envCheck = {
      projectId: !!projectId,
      clientEmail: !!clientEmail,
      privateKey: !!privateKey,
      values: {
        projectId: projectId || 'NOT SET',
        clientEmail: clientEmail || 'NOT SET',
        privateKeyLength: privateKey ? privateKey.length : 0
      }
    };

    // Try to import the Vision client
    let visionClientStatus = 'OK';
    try {
      const { ImageAnnotatorClient } = await import('@google-cloud/vision');
      const vision = new ImageAnnotatorClient({
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        credentials: {
          client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
      });
      visionClientStatus = 'Vision client initialized successfully';
    } catch (error) {
      visionClientStatus = `Vision client error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    return NextResponse.json({
      status: 'Google Cloud Vision API Test',
      environment: envCheck,
      visionClient: visionClientStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to test Google Cloud Vision setup'
      },
      { status: 500 }
    );
  }
}
