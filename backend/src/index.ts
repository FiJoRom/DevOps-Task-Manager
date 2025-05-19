import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';

const fastify = Fastify({ logger: true });

fastify.register(fastifyCors, {
  origin: 'http://localhost:5173',
});

fastify.get('/api/ping', async () => {
  return { pong: true };
});

fastify.listen({ port: 3001 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});

