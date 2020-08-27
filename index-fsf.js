const fastify = require('fastify');

const server = fastify({
  ignoreTrailingSlash: true,
});

server.get('/static/param1', (request, reply) => {
  reply.send('param1');
});

server.get('/static/param2', (request, reply) => {
  reply.send('param2');
});

server.get('/static/:paramA/next', (request, reply) => {
  reply.send({ route: 'next', ...request.params });
});

server.get('/static/param1/next/param3', (request, reply) => {
  reply.send('param1-3');
});

server.get('/static/param1/next/param4', (request, reply) => {
  reply.send('param1-4');
});

server.get('/static/:paramA/next/:paramB/next', (request, reply) => {
  reply.send({ route: 'next', ...request.params });
});

server.get('/static/:paramA/next/:paramB/other', (request, reply) => {
  reply.send({ route: 'other', ...request.params });
});

server.get('/static/param1/next/param2/other/param3', (request, reply) => {
  reply.send('param1-2-3');
});

server.get('/static/param1/next/param2/other/param4', (request, reply) => {
  reply.send('param1-2-4');
});

server.get('/static/:paramA/next/:paramB/other/:paramC/last', (request, reply) => {
  reply.send({ route: 'other', ...request.params });
});

server.get('/dynamic/param1', (request, reply) => {
  reply.send('param1');
});

server.get('/dynamic/param2', (request, reply) => {
  reply.send('param2');
});

server.get('/dynamic/:paramA/next', (request, reply) => {
  reply.send({ route: 'next', ...request.params });
});

server.get('/dynamic/:paramA/next/param3', (request, reply) => {
  reply.send('paramA-3');
});

server.get('/dynamic/:paramA/next/param4', (request, reply) => {
  reply.send('paramA-4');
});

server.get('/dynamic/:paramA/next/:paramB/other', (request, reply) => {
  reply.send({ route: 'next', ...request.params });
});

server.listen(3111, (err) => {
  if (err) throw err;
  console.log('Server listening on port 3111');
  console.log(server.printRoutes());
});
