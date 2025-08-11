// src/server.ts
import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { logicRoutes } from './routes/logicRoutes';

//Release test

const app = Fastify({ logger: true });

app.register(fastifyCors, {
  origin: 'http://localhost:3000',
});

app.register(logicRoutes);

app.get('/api/ping', async () => {
  return { message: 'pong' };
});

// nur starten, wenn nicht im Testmodus
if (process.env.NODE_ENV !== 'test') {
  app.listen({ port: 3001, host: '0.0.0.0' })
    .then(address => {
      app.log.info(`Server listening at ${address}`);
    })
    .catch(err => {
      app.log.error(err);
      process.exit(1);
    });
}

export default app;
