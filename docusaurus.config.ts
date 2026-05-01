import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const config: Config = {
  title: 'Stochastic Differential Equations',
  tagline: 'A rigorous geometric web-book for math finance students',
  url: 'https://brownianlab.github.io',
  baseUrl: '/stochastic-differential-equations/',
  organizationName: 'brownianlab',
  projectName: 'stochastic-differential-equations',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: { defaultLocale: 'en', locales: ['en'] },
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
        theme: { customCss: './src/css/custom.css' },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    navbar: {
      title: 'SDE Web Book',
      items: [
        { type: 'docSidebar', sidebarId: 'courseSidebar', position: 'left', label: 'Chapters' },
      ],
    },
    footer: {
      style: 'dark',
      links: [{ title: 'Course', items: [{ label: 'Start', to: '/' }] }],
      copyright: `Built for offline study.`,
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
