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

  app.use(cors<cors.CorsRequest>());
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
