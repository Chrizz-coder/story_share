/**
 * /api/graphql — Next.js proxy route
 *
 * Forwards all GraphQL requests from the browser to the backend API.
 * Benefits:
 *  - Eliminates all CORS issues (same-origin from the browser's perspective)
 *  - Works in dev (→ localhost:4000) and production (→ Render URL)
 *
 * Environment variable priority (server-side only):
 *  1. API_URL           — server-only var, set this in Vercel for production
 *                         e.g. API_URL=https://<service>.onrender.com/graphql
 *  2. NEXT_PUBLIC_API_URL — fallback only; prefer API_URL to avoid accidental
 *                           misuse (NEXT_PUBLIC_ vars are also embedded in the
 *                           browser bundle and should not hold backend URLs)
 *  3. http://localhost:4000/graphql — local dev fallback
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.API_URL ||               // server-only var — always check first
  process.env.NEXT_PUBLIC_API_URL ||   // public/build-time var — secondary fallback
  'http://localhost:4000/graphql';     // local dev fallback

// Warn loudly in production if neither variable is configured.
// This surfaces immediately in Vercel Runtime Logs.
if (
  process.env.NODE_ENV === 'production' &&
  !process.env.API_URL &&
  !process.env.NEXT_PUBLIC_API_URL
) {
  console.error(
    '[GraphQL Proxy] ❌ CRITICAL: No backend URL configured. ' +
    'Set API_URL=https://<your-render-service>.onrender.com/graphql ' +
    'in Vercel environment variables and redeploy.'
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();

  // ── Debug logging (dev only) ───────────────────────────────────────
  if (process.env.NODE_ENV === 'development') {
    try {
      const parsed = JSON.parse(body);
      console.log('[GraphQL Proxy] →', BACKEND_URL);
      console.log('[GraphQL Proxy] operation:', parsed.operationName ?? '(unnamed)');
      if (parsed.variables) {
        // Truncate photoData to avoid flooding the console
        const vars = { ...parsed.variables };
        if (vars.input?.photoData) vars.input.photoData = '[base64 truncated]';
        console.log('[GraphQL Proxy] variables:', JSON.stringify(vars, null, 2));
      }
    } catch {
      console.log('[GraphQL Proxy] raw body (non-JSON):', body.slice(0, 200));
    }
  }

  let response: Response;
  try {
    response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward relevant headers
        ...(req.headers.get('authorization')
          ? { Authorization: req.headers.get('authorization')! }
          : {}),
      },
      body,
    });
  } catch (err: any) {
    console.error('[GraphQL Proxy] ❌ Failed to reach backend:', BACKEND_URL, err.message);
    return NextResponse.json(
      {
        errors: [
          {
            message: `Cannot reach the API server. Is it running at ${BACKEND_URL}?`,
            extensions: {
              code: 'BACKEND_UNREACHABLE',
              backendUrl: BACKEND_URL,
              originalError: err.message,
            },
          },
        ],
      },
      { status: 502 }
    );
  }

  const responseText = await response.text();

  if (process.env.NODE_ENV === 'development') {
    try {
      const parsed = JSON.parse(responseText);
      if (parsed.errors) {
        console.error('[GraphQL Proxy] ⚠ GraphQL errors:', JSON.stringify(parsed.errors, null, 2));
      } else {
        console.log('[GraphQL Proxy] ✅ Status:', response.status);
      }
    } catch {
      console.log('[GraphQL Proxy] Response (non-JSON):', responseText.slice(0, 200));
    }
  }

  return new NextResponse(responseText, {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Apollo Studio / GraphQL clients may send OPTIONS preflight
export async function GET(req: NextRequest) {
  return NextResponse.json({ status: 'GraphQL proxy active', backend: BACKEND_URL });
}
