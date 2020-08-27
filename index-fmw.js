const http = require('http');
const router = require('find-my-way')({
  ignoreTrailingSlash: false,
});

router.on('GET', '/static/param1', (req, res, params) => {
  res.end('param1');
});

router.on('GET', '/static/param2', (req, res, params) => {
  res.end('param2');
});

router.on('GET', '/static/:paramA/next', (req, res, params) => {
  res.end(JSON.stringify({ route: 'next', ...params }));
});

router.on('GET', '/static/param1/next/param3', (req, res, params) => {
  res.end('param1-3');
});

// router.on('GET', '/static/param1/next/param4', (req, res, params) => {
//   res.end('param1-4');
// });

router.on('GET', '/static/:paramA/next/:paramB/next', (req, res, params) => {
  res.end(JSON.stringify({ route: 'next', ...params }));
});

router.on('GET', '/static/:paramA/next/:paramB/other', (req, res, params) => {
  res.end(JSON.stringify({ route: 'other', ...params }));
});

router.on('GET', '/static/param1/next/param2/other/param3', (req, res, params) => {
  res.end('param1-2-3');
});

router.on('GET', '/static/param1/next/param2/other/param4', (req, res, params) => {
  res.end('param1-2-4');
});

router.on('GET', '/static/:paramA/next/:paramB/other/:paramC/last', (req, res, params) => {
  res.end(JSON.stringify({ route: 'last', ...params }));
});

router.on('GET', '/dynamic/param1', (req, res, params) => {
  res.end('param1');
});

router.on('GET', '/dynamic/param2', (req, res, params) => {
  res.end('param2');
});

router.on('GET', '/dynamic/:paramA/next', (req, res, params) => {
  res.end(JSON.stringify({ route: 'next', ...params }));
});

router.on('GET', '/dynamic/:paramA/next/param3', (req, res, params) => {
  res.end('paramA-3');
});

router.on('GET', '/dynamic/:paramA/next/param4', (req, res, params) => {
  res.end('paramA-4');
});

router.on('GET', '/dynamic/:paramA/next/:paramB/next', (req, res, params) => {
  res.end(JSON.stringify({ route: 'other', ...params }));
});

router.on('GET', '/dynamic/:paramA/next/:paramB/other', (req, res, params) => {
  res.end(JSON.stringify({ route: 'other', ...params }));
});

const server = http.createServer((req, res) => {
  router.lookup(req, res);
});

server.listen(3111, err => {
  if (err) throw err;
  console.log('Server listening on: http://localhost:3111');
  console.log(router.prettyPrint());
});
