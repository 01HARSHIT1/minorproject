import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // CRITICAL: Handle favicon FIRST - return 204 immediately
  // This prevents any processing that could cause a crash
  if (pathname === '/favicon.ico') {
    return new NextResponse(null, { status: 204 })
  }
  
  // Pass through all other requests
  return NextResponse.next()
}

export const config = {
  // Run middleware for all routes including favicon.ico
  // We handle favicon early above, so it returns immediately
  matcher: [
    '/((?!_next/static|_next/image|.*\\.(?:ico|svg|png|jpg|jpeg|gif|webp|css|js|json|xml|woff|woff2|ttf)).*)',
  ],
}
