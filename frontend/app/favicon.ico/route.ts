// This route handler catches /favicon.ico requests and returns 204
// This prevents Next.js from trying to process it elsewhere and crashing
import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  // Return 204 No Content - browser stops requesting after this
  return new NextResponse(null, {
    status: 204,
  })
}
