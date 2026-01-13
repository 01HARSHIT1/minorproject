import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // CRITICAL: Exclude ALL static files from middleware
  // This prevents crashes when browser requests static assets like favicon.ico
  if (
    path === '/favicon.ico' ||
    path.startsWith('/_next') ||
    path.startsWith('/_vercel') ||
    path.startsWith('/api/favicon') ||
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
    // Let Next.js serve static files directly - don't process them
    return NextResponse.next()
  }

  // All other routes continue normally
  return NextResponse.next()
}

export const config = {
  // IMPORTANT: Exclude static files completely from middleware
  // This matcher prevents middleware from running on static assets
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - All file extensions (static assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|json|xml|woff|woff2|ttf)).*)',
  ],
}
