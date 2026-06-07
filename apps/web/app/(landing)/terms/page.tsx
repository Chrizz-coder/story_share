import type { Metadata } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Use — StoryShare',
  description: 'Read the Terms of Use governing your access to and use of StoryShare services.',
};

const TOC = [
  { id: '1-our-services', label: '1. Our Services' },
  { id: '2-intellectual-property-rights', label: '2. Intellectual Property' },
  { id: '3-user-representations', label: '3. User Representations' },
  { id: '4-prohibited-activities', label: '4. Prohibited Activities' },
  { id: '5-user-generated-contributions', label: '5. Contributions' },
  { id: '6-contribution-license', label: '6. Contribution License' },
  { id: '7-services-management', label: '7. Services Management' },
  { id: '8-term-and-termination', label: '8. Termination' },
  { id: '9-modifications-and-interruptions', label: '9. Modifications' },
  { id: '10-governing-law', label: '10. Governing Law' },
  { id: '11-dispute-resolution', label: '11. Dispute Resolution' },
  { id: '13-disclaimer', label: '13. Disclaimer' },
  { id: '14-limitations-of-liability', label: '14. Liability' },
  { id: '19-contact-us', label: '19. Contact Us' },
];

export default async function TermsPage() {
  const filePath = path.join(process.cwd(), 'content', 'terms.md');
  const content = await fs.readFile(filePath, 'utf8');

  return (
    <LegalPage
      icon="📋"
      title="Terms of Use"
      lastUpdated="June 07, 2026"
      toc={TOC}
      content={content}
    />
  );
}
