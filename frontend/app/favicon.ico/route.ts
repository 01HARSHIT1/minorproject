import { NextResponse } from 'next/server'

// Route handler for favicon.ico
// Returns 204 No Content to prevent 500 errors
export async function GET() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Content-Type': 'image/x-icon',
    },
  })
}
