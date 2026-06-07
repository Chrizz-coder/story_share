import type { Metadata } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy — StoryShare',
  description: 'Learn how StoryShare collects, uses, and protects your personal information.',
};

const TOC = [
  { id: '1-what-information-do-we-collect', label: '1. Information We Collect' },
  { id: '2-how-do-we-process-your-information', label: '2. How We Process It' },
  { id: '3-when-and-with-whom-do-we-share-your-personal-information', label: '3. Sharing' },
  { id: '4-how-long-do-we-keep-your-information', label: '4. Retention' },
  { id: '5-how-do-we-keep-your-information-safe', label: '5. Security' },
  { id: '6-what-are-your-privacy-rights', label: '6. Your Rights' },
  { id: '7-controls-for-do-not-track-features', label: '7. Do-Not-Track' },
  { id: '8-do-we-make-updates-to-this-notice', label: '8. Updates' },
  { id: '9-how-can-you-contact-us-about-this-notice', label: '9. Contact' },
];

export default async function PrivacyPage() {
  const filePath = path.join(process.cwd(), 'content', 'privacy.md');
  const content = await fs.readFile(filePath, 'utf8');

  return (
    <LegalPage
      icon="🔒"
      title="Privacy Policy"
      lastUpdated="June 07, 2026"
      toc={TOC}
      content={content}
    />
  );
}
