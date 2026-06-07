import type { Metadata } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy — StoryShare',
  description: 'Understand StoryShare\'s refund and cancellation policy for all purchases and subscriptions.',
};

const TOC = [
  { id: 'refunds', label: 'Refunds' },
  { id: 'what-this-means', label: 'What This Means' },
  { id: 'exceptions', label: 'Exceptions' },
  { id: 'how-to-cancel-a-subscription', label: 'How to Cancel' },
  { id: 'questions', label: 'Questions' },
];

export default async function RefundPage() {
  const filePath = path.join(process.cwd(), 'content', 'refund.md');
  const content = await fs.readFile(filePath, 'utf8');

  return (
    <LegalPage
      icon="💳"
      title="Refund & Cancellation Policy"
      lastUpdated="June 07, 2026"
      toc={TOC}
      content={content}
    />
  );
}
