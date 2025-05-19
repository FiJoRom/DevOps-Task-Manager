import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

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
