'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from '@/app/(landing)/legal.module.css';

interface TocEntry {
  id: string;
  label: string;
}

interface LegalPageProps {
  icon: string;
  title: string;
  lastUpdated: string;
  toc: TocEntry[];
  content: string;
}

export default function LegalPage({ icon, title, lastUpdated, toc, content }: LegalPageProps) {
  const handleTocClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroIcon}>{icon}</div>
        <h1 className={styles.heroTitle}>{title}</h1>
        <p className={styles.heroMeta}>Last updated {lastUpdated}</p>
      </div>

      {/* ── Body ── */}
      <div className={styles.layout}>
        {/* Sidebar TOC */}
        <aside className={styles.sidebar}>
          <nav className={styles.tocCard} aria-label="Table of contents">
            <p className={styles.tocTitle}>On this page</p>
            <ul className={styles.tocList}>
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={styles.tocItem}
                    onClick={(e) => handleTocClick(e, item.id)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Markdown Content */}
        <article className={styles.content}>
          <div className={styles.markdown}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Add id anchors to h2 elements so TOC links work
                h2: ({ children, ...props }) => {
                  const text = String(children);
                  const id = text
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .trim()
                    .replace(/\s+/g, '-');
                  return (
                    <h2 id={id} {...props}>
                      {children}
                    </h2>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  );
}
