import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const BASE_URL = 'https://brownianlab.github.io/stochastic-differential-equations';

const jsonLdCourse = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'Stochastic Differential Equations',
  description:
    'A rigorous open-access graduate web-book on stochastic differential equations for mathematical finance. Covers Brownian motion, Itô calculus, SDEs, Black–Scholes, Feynman–Kac, stochastic volatility, interest rate models, and geometric methods.',
  url: BASE_URL,
  provider: {
    '@type': 'Organization',
    name: 'BrownianLab',
    url: 'https://github.com/brownianlab',
  },
  educationalLevel: 'Graduate',
  inLanguage: 'en',
  isAccessibleForFree: true,
  hasCourseInstance: [
    { '@type': 'CourseInstance', name: 'Chapter 1 — From Random Walks to Brownian Motion', url: `${BASE_URL}/chapter-01-random-walks-to-brownian-motion` },
    { '@type': 'CourseInstance', name: 'Chapter 2 — Construction of the Itô Integral', url: `${BASE_URL}/chapter-02-ito-integral` },
    { '@type': 'CourseInstance', name: "Chapter 3 — Itô's Formula", url: `${BASE_URL}/chapter-03-ito-formula` },
    { '@type': 'CourseInstance', name: 'Chapter 4 — SDE Definition and Existence', url: `${BASE_URL}/chapter-04-sde-existence` },
    { '@type': 'CourseInstance', name: 'Chapter 5 — Explicitly Solvable Models', url: `${BASE_URL}/chapter-05-explicit-models` },
    { '@type': 'CourseInstance', name: 'Chapter 6 — Martingales and Change of Measure', url: `${BASE_URL}/chapter-06-girsanov` },
    { '@type': 'CourseInstance', name: 'Chapter 7 — Black–Scholes from First Principles', url: `${BASE_URL}/chapter-07-black-scholes` },
    { '@type': 'CourseInstance', name: 'Chapter 8 — Multi-Dimensional Itô Calculus', url: `${BASE_URL}/chapter-08-multidimensional` },
    { '@type': 'CourseInstance', name: 'Chapter 9 — Diffusions and Generators', url: `${BASE_URL}/chapter-09-generators` },
    { '@type': 'CourseInstance', name: 'Chapter 10 — The Feynman–Kac Formula', url: `${BASE_URL}/chapter-10-feynman-kac` },
    { '@type': 'CourseInstance', name: 'Chapter 11 — Local and Stochastic Volatility', url: `${BASE_URL}/chapter-11-stochastic-vol` },
    { '@type': 'CourseInstance', name: 'Chapter 12 — Interest Rate Models', url: `${BASE_URL}/chapter-12-interest-rates` },
    { '@type': 'CourseInstance', name: 'Chapter 13 — Numerical Methods for SDEs', url: `${BASE_URL}/chapter-13-numerical-methods` },
    { '@type': 'CourseInstance', name: 'Chapter 14 — Advanced Geometry of SDEs', url: `${BASE_URL}/chapter-14-advanced-geometry` },
  ],
};

const config: Config = {
  title: 'Stochastic Differential Equations',
  tagline: 'A rigorous open-access graduate web-book on SDEs and mathematical finance',
  url: 'https://brownianlab.github.io',
  baseUrl: '/stochastic-differential-equations/',
  organizationName: 'brownianlab',
  projectName: 'stochastic-differential-equations',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: { defaultLocale: 'en', locales: ['en'] },

  headTags: [
    {
      tagName: 'script',
      attributes: { type: 'application/ld+json' },
      innerHTML: JSON.stringify(jsonLdCourse),
    },
    {
      tagName: 'link',
      attributes: { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    },
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl: undefined,
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
        blog: false,
        sitemap: {
          filename: 'sitemap.xml',
        },
        theme: { customCss: './src/css/custom.css' },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    metadata: [
      { name: 'description', content: 'A rigorous open-access graduate web-book on stochastic differential equations. Covers Brownian motion, Itô calculus, Black–Scholes, Feynman–Kac, Girsanov, and advanced geometry of SDEs — with interactive visualizations.' },
      { name: 'keywords', content: 'stochastic differential equations, Itô calculus, Brownian motion, Black-Scholes, Feynman-Kac, Girsanov theorem, mathematical finance, stochastic volatility, Heston model, interest rate models, numerical SDE, graduate mathematics' },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'Stochastic Differential Equations — Graduate Web Book' },
      { property: 'og:description', content: 'Open-access graduate course on SDEs: Itô calculus, Black–Scholes, Feynman–Kac, and advanced geometry, with interactive charts.' },
      { property: 'og:url', content: BASE_URL },
      { property: 'og:site_name', content: 'SDE Web Book' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Stochastic Differential Equations — Graduate Web Book' },
      { name: 'twitter:description', content: 'Open-access graduate course on SDEs: Itô calculus, Black–Scholes, Feynman–Kac, and advanced geometry, with interactive charts.' },
      { name: 'robots', content: 'index, follow' },
      { name: 'author', content: 'BrownianLab' },
    ],
    navbar: {
      title: 'SDE Web Book',
      items: [
        { type: 'docSidebar', sidebarId: 'courseSidebar', position: 'left', label: 'Chapters' },
        {
          href: 'https://github.com/brownianlab/stochastic-differential-equations',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Course',
          items: [
            { label: 'Start Reading', to: '/' },
            { label: 'Chapter 1 — Brownian Motion', to: '/chapter-01-random-walks-to-brownian-motion' },
            { label: 'Chapter 7 — Black–Scholes', to: '/chapter-07-black-scholes' },
            { label: 'Chapter 10 — Feynman–Kac', to: '/chapter-10-feynman-kac' },
          ],
        },
        {
          title: 'Topics',
          items: [
            { label: 'Itô Calculus', to: '/chapter-02-ito-integral' },
            { label: 'Girsanov Theorem', to: '/chapter-06-girsanov' },
            { label: 'Stochastic Volatility', to: '/chapter-11-stochastic-vol' },
            { label: 'Numerical Methods', to: '/chapter-13-numerical-methods' },
          ],
        },
        {
          title: 'Source',
          items: [
            { label: 'GitHub Repository', href: 'https://github.com/brownianlab/stochastic-differential-equations' },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} BrownianLab — Open-access graduate course on stochastic differential equations. Free to use for educational purposes.`,
    },
    prism: {
      theme: require('prism-react-renderer').themes.github,
      darkTheme: require('prism-react-renderer').themes.dracula,
    },
    colorMode: { defaultMode: 'light', disableSwitch: false },
  } satisfies Preset.ThemeConfig,
  markdown: { mermaid: true },
  themes: ['@docusaurus/theme-mermaid'],
};

export default config;
