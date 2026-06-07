import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact Us — StoryShare',
  description: 'Get in touch with the StoryShare team. We\'re here to help with any questions or issues.',
};

export default function ContactPage() {
  return <ContactClient />;
}
