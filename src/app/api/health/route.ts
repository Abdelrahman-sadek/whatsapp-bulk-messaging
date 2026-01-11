import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if Convex URL is configured
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    
    if (!convexUrl) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Convex URL not configured',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      services: {
        frontend: 'online',
        convex: convexUrl ? 'configured' : 'not configured',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}