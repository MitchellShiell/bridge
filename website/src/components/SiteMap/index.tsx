import React from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

import iconSong from './icons/icon-song.png';
import iconScore from './icons/icon-score.png';
import iconMaestro from './icons/icon-maestro.png';
import iconArranger from './icons/icon-arranger.png';
import iconStage from './icons/icon-stage.png';

interface SiteMap {
  title: string;
  link: string;
  image: string; 
  description: React.ReactNode;
  category: string;
}

const categoriesDict = {
  core: {
    title: 'Core Products',
    description: 'The building blocks of the Overture genomics data platform.'
  },
  development: {
    title: 'Under Development',
    description: 'New components not quite ready for production.'
  },
  platform: {
    title: 'Platform Documentation',
    description: 'Bringing it all together into one cohesive platform.'
  },
  misc: {
    title: 'Supporting Software',
    description: 'Miscellaneous software packages created to support Overture development.'
  },
};

const products: SiteMap[] = [
  {
    title: 'Song Docs',
    link: '/docs/Song',
    image: iconSong,
    description: 'Metadata Management',
    category: 'core',
  },
  {
    title: 'Score Docs',
    link: '/docs/Score',
    image: iconScore,
    description: 'File Data Transfers',
    category: 'core',
  },
  {
    title: 'Maestro Docs',
    link: '/docs/Maestro',
    image: iconMaestro,
    description: 'Metadata Indexing',
    category: 'core',
  },
  {
    title: 'Arranger Docs',
    link: '/docs/Arranger',
    image: iconArranger,
    description: 'Search API and UI generation',
    category: 'core',
  },
  {
    title: 'Stage Docs',
    link: '/docs/Stage',
    image: iconStage,
    description: 'Front-end Data Portal UI',
    category: 'core',
  },
  {
    title: 'Lectern Docs',
    link: '/docs/Lectern',
    image: iconStage,
    description: 'Tabular Data Schema Manager',
    category: 'development',
  },
  {
    title: 'Lyric Docs',
    link: '/docs/Lyric',
    image: iconStage,
    description: 'Tabular Data Submission System',
    category: 'development',
  },
  {
    title: 'Deployment Docs',
    link: '/docs/Lyric',
    image: iconStage,
    description: 'Server Deployment',
    category: 'platform',
  },
  {
    title: 'QuickStart Docs',
    link: '/docs/Lyric',
    image: iconStage,
    description: 'Overture QuickStart',
    category: 'platform',
  },
  {
    title: 'Bridge Docs',
    link: '/docs/Bridge',
    image: iconStage,
    description: 'Documentation Site Generation',
    category: 'misc',
  },
  {
    title: 'Conductor Docs',
    link: '/docs/Conductor',
    image: iconStage,
    description: 'Software Setup Automation',
    category: 'misc',
  },
];

function groupByCategory(items) {
  return items.reduce((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});
}

function CubeCard({ title, description, link, image }) {
  return (
    <div className={styles.cubeContainer}>
      <a href={link}>
        <div className={styles.cube}>
          <div className={`${styles.face} ${styles.front} ${styles.iconTitle}`}>
            <img src={image} alt={`${title} icon`} className={styles.cubeImage} />
            <Heading as="h4">{description}</Heading>
          </div>
          <div className={`${styles.face} ${styles.back}`}></div>
          <div className={`${styles.face} ${styles.right}`}></div>
          <div className={`${styles.face} ${styles.left}`}>
            <Heading as="h2" className={styles.serviceTitle}>{title}</Heading>
          </div>
          <div className={`${styles.face} ${styles.top}`}></div>
          <div className={`${styles.face} ${styles.bottom}`}></div>
        </div>
      </a>
    </div>
  );
}

export default function SiteMap() {
  const categorizedSiteMap = groupByCategory(products);

  return (
    <section className={styles.cards}>
      <div className={styles.container}>
        <div className={styles.categoryWrapper}>
          {Object.entries(categorizedSiteMap).map(([category, items]) => (
            <div key={category} className={`${styles.categorySection} ${items.length < 3 ? styles.smallCategory : ''}`}>
              <Heading as="h2" className={styles.categoryHeader}>{categoriesDict[category].title}</Heading>
              <Heading as="h4" className={styles.categorySubheader}>{categoriesDict[category].description}</Heading>
              <div className={styles.cubeRow}>
                {items.map((props, idx) => (
                  <CubeCard key={idx} {...props} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}