import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Handle favicon.ico requests immediately - return 204 No Content
  // This prevents any processing and crashes
  if (path === '/favicon.ico') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Content-Type': 'image/x-icon',
      },
    })
  }

  // Exclude all other static files from middleware
  if (
    path.startsWith('/_next') ||
    path.startsWith('/_vercel') ||
    path.includes('.ico') ||
    path.includes('.png') ||
    path.includes('.jpg') ||
    path.includes('.jpeg') ||
    path.includes('.gif') ||
    path.includes('.svg') ||
    path.includes('.webp') ||
    path.includes('.css') ||
    path.includes('.js') ||
    path.includes('.json') ||
    path.includes('.xml') ||
    path.includes('.woff') ||
    path.includes('.woff2') ||
    path.includes('.ttf')
  ) {
    return NextResponse.next()
  }

  // All other routes continue normally
  return NextResponse.next()
}

export const config = {
  // Run middleware for all routes - but favicon is handled early above
  matcher: [
    '/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|json|xml|woff|woff2|ttf)).*)',
  ],
}
