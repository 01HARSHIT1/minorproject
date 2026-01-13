import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Simply pass through all requests - no processing needed
  // Favicon is excluded by matcher config below
  return NextResponse.next()
}

export const config = {
  // CRITICAL: Exclude favicon.ico completely from middleware
  // If middleware doesn't run, it can't crash
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - favicon.ico (completely excluded)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - All file extensions (static assets)
     */
    '/((?!favicon.ico|_next/static|_next/image|.*\\.(?:ico|svg|png|jpg|jpeg|gif|webp|css|js|json|xml|woff|woff2|ttf)).*)',
  ],
}
