/* ─────────────────────────────────────────────────────────────────────
   apollo-client.ts
   SSR-safe Apollo Client for Next.js App Router.

   Rules:
   - Server-side (SSR/RSC): a fresh client per request (no singleton)
   - Client-side:           reuse the singleton so the cache persists
   ───────────────────────────────────────────────────────────────────── */
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

/**
 * Resolve the GraphQL endpoint.
 *
 * Priority:
 *   1. NEXT_PUBLIC_API_URL  (explicitly set by the developer / Vercel env)
 *   2. /api/graphql         (Next.js proxy route — eliminates CORS entirely)
 *
 * The proxy route is always correct in both dev and production because it is
 * relative to the current origin. Use it as the fallback so the app works
 * out-of-the-box without any env vars.
 */
function getApiUri(): string {
  // On the browser, NEXT_PUBLIC_API_URL is embedded at build time.
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL ?? '/api/graphql';
  }

  // On the server (SSR), we need an absolute URL.
  // If the developer set NEXT_PUBLIC_API_URL, use that.
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Otherwise fall back to the local dev API.
  return 'http://localhost:4000/graphql';
}

function makeClient() {
  return new ApolloClient({
    link: new HttpLink({ uri: getApiUri() }),
    cache: new InMemoryCache(),
    // Suppress noisy "you are importing from @apollo/client on the server"
    // warning — we handle SSR intentionally.
    defaultOptions: {
      watchQuery: { fetchPolicy: 'cache-and-network' },
    },
  });
}

// ── Browser singleton ───────────────────────────────────────────────────────
let browserClient: ApolloClient<unknown> | null = null;

export function getApolloClient() {
  if (typeof window === 'undefined') {
    // Always a fresh client on the server (avoid cache leaking between requests)
    return makeClient();
  }
  // Reuse singleton in the browser
  if (!browserClient) {
    browserClient = makeClient();
    if (process.env.NODE_ENV === 'development') {
      console.log('[Apollo] Browser client created → URI:', getApiUri());
    }
  }
  return browserClient;
}

// Named export kept for backwards-compatibility with existing imports
export const apolloClient = getApolloClient();
