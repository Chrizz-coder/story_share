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

async function main() {
  // ── 1. Connect to MongoDB ────────────────────────────────────────────────
  await connectDB();

  // ── 2. Express app ───────────────────────────────────────────────────────
  const app = express();
  const port = process.env.PORT || 4000;

  // Allow requests from the frontend (Vercel) and local dev
  const allowedOrigins = [
    process.env.FRONTEND_URL,       // e.g. https://your-app.vercel.app
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean) as string[];

  app.use(
    cors<cors.CorsRequest>({
      origin: (origin, callback) => {
        // Allow requests with no origin (curl, Postman, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: Origin ${origin} not allowed`));
      },
      credentials: true,
    })
  );
  app.use(express.json());

  // ── 3. Health check ──────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // ── 4. Shared HTTP server ────────────────────────────────────────────────
  const httpServer = createServer(app);

  // ── 5. Apollo Server 4 ───────────────────────────────────────────────────
  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  // ── 6. Mount GraphQL at /graphql ─────────────────────────────────────────
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        return createContext({ req });
      },
    })
  );

  // ── 7. Start ─────────────────────────────────────────────────────────────
  httpServer.listen(Number(port), '0.0.0.0', () => {
    console.log(`🚀 GraphQL ready  → http://localhost:${port}/graphql`);
    console.log(`❤️  Health check   → http://localhost:${port}/health`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
