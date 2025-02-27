import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import acceptLanguage from 'accept-language'

// Define supported locales
const locales = ['en', 'es', 'fr']
const defaultLocale = 'en'

acceptLanguage.languages(locales)

export function middleware(request: NextRequest) {
  // Skip for API routes and static files
  const { pathname } = request.nextUrl
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check if the pathname already includes a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return NextResponse.next()

  // Get the preferred locale from the cookie or accept-language header
  let locale
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  
  if (cookieLocale && locales.includes(cookieLocale)) {
    locale = cookieLocale
  } else {
    locale = acceptLanguage.get(request.headers.get('accept-language')) || defaultLocale
  }

  // For App Router, we'll just set a cookie rather than redirecting
  const response = NextResponse.next()
  response.cookies.set('NEXT_LOCALE', locale)
  
  return response
}

export const config = {
  // Match all pathnames except those starting with /api, /_next, or containing a dot (like favicon.ico)
  matcher: ['/((?!api|_next|.*\\..*).*)'],
} 