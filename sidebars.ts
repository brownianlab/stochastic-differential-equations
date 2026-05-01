import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  courseSidebar: [
    'index',
    {
      type: 'category',
      label: 'Part I — Brownian Motion and Itô Calculus',
      collapsed: false,
      items: [
        'chapter-01-random-walks-to-brownian-motion',
        'chapter-02-ito-integral',
        'chapter-03-ito-formula',
      ],
    },
    {
      type: 'category',
      label: 'Part II — Stochastic Differential Equations',
      collapsed: false,
      items: [
        'chapter-04-sde-existence',
        'chapter-05-explicit-models',
        'chapter-06-girsanov',
      ],
    },
    {
      type: 'category',
      label: 'Part III — Quantitative Finance Core',
      collapsed: false,
      items: [
        'chapter-07-black-scholes',
        'chapter-08-multidimensional',
        'chapter-09-generators',
        'chapter-10-feynman-kac',
      ],
    },
    {
      type: 'category',
      label: 'Part IV — Advanced Topics',
      collapsed: false,
      items: [
        'chapter-11-stochastic-vol',
        'chapter-12-interest-rates',
        'chapter-13-numerical-methods',
        'chapter-14-advanced-geometry',
      ],
    },
  ],
};

export default sidebars;
