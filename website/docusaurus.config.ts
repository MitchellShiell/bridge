import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'OvertureDev',
  tagline: 'Docs for Developers & Informaticians',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://overture-dev.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'overture-stack', // Usually your GitHub org/user name.
  projectName: 'OvertureDev', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    './docsPlugin.ts',
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'guides',
        path: 'guides',
        routeBasePath: 'guides',
        sidebarPath: require.resolve('./guidesSidebars.ts'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
    {
      id: 'community',
      path: 'community',
      routeBasePath: 'community',
      sidebarPath: require.resolve('./communitySidebars.ts'),
    },
    ],
    [
      '@docusaurus/plugin-content-docs',
    {
      id: 'casestudies',
      path: 'casestudies',
      routeBasePath: 'casestudies',
      sidebarPath: require.resolve('./casestudiesSidebars.ts'),
    },
    ],
  ],

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/overture-stack/OvertureDev',
        },
        // Please change this to your repo.
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/overture-stack/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        }, 
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'OvertureDev',
      logo: {
        alt: 'Overture Dev Logo',
        src: 'img/Overture-logo.png',
      },
      items: [
        {to: '/guides/getting-started', label: 'Guides', position: 'left'},
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {to: '/casestudies/introduction', label: 'Case Studies', position: 'left'},
        {to: '/community/support', label: 'Community', position: 'left'},
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/overture-stack',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Platform Guides',
              to: 'https://www.overture.bio/documentation/guides/',
            },
            {
              label: 'Developer Documentation',
              to: '/docs/getting-started',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Support',
              href: '/community/support',
            },
            {
              label: 'Contributing',
              href: '/community/contribution',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'Case Studies',
              href: '/casestudies/introduction',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/overture-stack',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Overture, Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    algolia: {
      // application ID provided by Algolia
      appId: 'E70KV3D0W2',
      // Public API key
      apiKey: '296266a1c98ef42e60e0d9cb2f0c48a7',
      indexName: 'overtureDev',
    },
  } satisfies Preset.ThemeConfig,
};

export default config;