import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import acceptLanguage from 'accept-language'
import { i18n } from './next-i18next.config.js'

acceptLanguage.languages(i18n.locales)

export function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const pathname = request.nextUrl.pathname
  
  // Check if there's already a locale in the pathname
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return NextResponse.next()

  // Get the preferred locale from the cookie or accept-language header
  let locale
  // Check in cookie
  const preferredLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (preferredLocale && i18n.locales.includes(preferredLocale)) {
    locale = preferredLocale
  } else {
    // If no cookie, use accept-language header
    locale = acceptLanguage.get(request.headers.get('accept-language'))
    // If no accept-language header, use default locale
    if (!locale) locale = i18n.defaultLocale
  }

  // Redirect if locale is not in pathname
  return NextResponse.redirect(
    new URL(`/${locale}${pathname === '/' ? '' : pathname}${request.nextUrl.search}`, request.url)
  )
}

export const config = {
  // Match all pathnames except those starting with /api, /_next, or containing a dot (like favicon.ico)
  matcher: ['/((?!api|_next|.*\\..*).*)'],
} 