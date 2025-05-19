import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';

const fastify = Fastify({ logger: true });

fastify.register(fastifyCors, {
  origin: 'http://localhost:3000',
});

// Test ob Kommunikation Backend und Frontend funktioniert, Antwort auf Ping aus Frontend
fastify.get('/api/ping', async () => {
  return { message: 'pong' };
});

fastify.listen({ port: 3001, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});

