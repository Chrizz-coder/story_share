import type { Metadata } from 'next';
import './globals.css';
import ApolloWrapper from '@/components/ApolloWrapper';
import { AudioProvider } from '@/context/AudioContext';
import NextAuthProvider from '@/components/NextAuthProvider';

export const metadata: Metadata = {
  title: 'StoryShare — Create & Share Your Moments',
  description:
    'Join thousands sharing their most memorable moments. Premium stories, real-time reactions, and beautiful 24-hour content.',
  keywords: 'stories, sharing, social, moments, creator platform',
  openGraph: {
    title: 'StoryShare — Create & Share Your Moments',
    description: 'Join thousands sharing their most memorable moments.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ApolloWrapper>
          <NextAuthProvider>
            <AudioProvider>
              {children}
            </AudioProvider>
          </NextAuthProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
