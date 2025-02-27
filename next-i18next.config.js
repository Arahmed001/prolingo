/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'fr'],
    localeDetection: false,
  },
  defaultNS: 'common',
  localePath: './locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
} 