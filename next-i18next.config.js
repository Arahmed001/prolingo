/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'fr'],
    localeDetection: true,
  },
  defaultNS: 'common',
  localePath: './locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
} 