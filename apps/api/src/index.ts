import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { connectDB } from './db';
import { schema } from './schema';
import { createContext } from './context';

const isDev = process.env.NODE_ENV !== 'production';

async function main() {
  // ── 1. Connect to MongoDB ──────────────────────────────────────────────────
  await connectDB();

  // ── 2. Express app ─────────────────────────────────────────────────────────
  const app = express();
  const port = process.env.PORT || 4000;

  // ── 3. CORS ────────────────────────────────────────────────────────────────
  //
  // Strategy:
  //   • Requests with NO origin header (curl, Postman, server→server proxy)
  //     are always allowed. The Next.js /api/graphql proxy hits us this way.
  //   • Explicit browser origins are checked against an allowlist that also
  //     accepts any *.vercel.app preview URL so PR previews work automatically.
  //
  const explicitAllowed = [
    process.env.FRONTEND_URL,          // e.g. https://your-app.vercel.app
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean) as string[];

  app.use(
    cors<cors.CorsRequest>({
      origin: (origin, callback) => {
        // No origin = server-to-server / curl / Postman — always allow
        if (!origin) return callback(null, true);

        // Exact match
        if (explicitAllowed.includes(origin)) return callback(null, true);

        // Any Vercel preview deployment (*.vercel.app)
        if (origin.endsWith('.vercel.app')) return callback(null, true);

        // Any Render preview deployment (*.onrender.com)
        if (origin.endsWith('.onrender.com')) return callback(null, true);

        if (isDev) {
          // In dev, log the rejected origin to help debugging
          console.warn(`[CORS] ⛔ Rejected origin: ${origin}`);
          console.warn(`[CORS] Allowed list: ${explicitAllowed.join(', ')}`);
        }
        callback(new Error(`CORS: Origin ${origin} not allowed`));
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: '10mb' })); // 10 MB to accommodate base64 photos

  // ── 4. Request logging (dev + prod for GraphQL) ────────────────────────────
  app.use('/graphql', (req, _res, next) => {
    if (isDev) {
      const op = req.body?.operationName ?? '(unnamed)';
      const vars = req.body?.variables ? { ...req.body.variables } : {};
      // Truncate photoData to keep logs readable
      if (vars.input?.photoData) vars.input = { ...vars.input, photoData: '[base64 truncated]' };
      console.log(`[GraphQL] → operation: ${op}`);
      if (Object.keys(vars).length) {
        console.log(`[GraphQL]   variables: ${JSON.stringify(vars)}`);
      }
    }
    next();
  });

  // ── 5. Health check ────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      env: process.env.NODE_ENV,
      mongo: process.env.MONGO_URI ? 'configured' : 'NOT SET',
      frontendUrl: process.env.FRONTEND_URL || 'NOT SET',
    });
  });

  // ── 6. Shared HTTP server ──────────────────────────────────────────────────
  const httpServer = createServer(app);

  // ── 7. Apollo Server 4 ────────────────────────────────────────────────────
  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    formatError: (formattedError, error) => {
      // Always log server errors
      console.error('[GraphQL Error]', {
        message: formattedError.message,
        code: formattedError.extensions?.code,
        path: formattedError.path,
      });
      return formattedError;
    },
  });

  await server.start();

  // ── 8. Mount GraphQL at /graphql ───────────────────────────────────────────
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => createContext({ req }),
    })
  );

  // ── 9. Start ───────────────────────────────────────────────────────────────
  httpServer.listen(Number(port), '0.0.0.0', () => {
    console.log(`🚀 GraphQL ready  → http://localhost:${port}/graphql`);
    console.log(`❤️  Health check   → http://localhost:${port}/health`);
    console.log(`🌍 NODE_ENV       → ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄  MONGO_URI     → ${process.env.MONGO_URI ? '✅ set' : '❌ NOT SET (using localhost fallback)'}`);
    console.log(`🔗 FRONTEND_URL   → ${process.env.FRONTEND_URL || '❌ NOT SET'}`);
  });
}

main().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
