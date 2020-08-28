This issue is similar too https://github.com/delvedor/find-my-way/issues/149
but with even more strange behaviour

I found those problems while working with a Fastify server.

## setup

Given a basic setup file like

```
const http = require('http');
const router = require('find-my-way')({
  ignoreTrailingSlash: true,
});

// ...ROUTES DEFINITIONS HERE

const server = http.createServer((req, res) => {
  router.lookup(req, res);
});

server.listen(3111, err => {
  if (err) throw err;
  console.log('Server listening on: http://localhost:3111');
  console.log(router.prettyPrint());
});
```

I have a lot of different troubles when mixing parameter and static routes

## only one parameter, with or without ignoreTrailingSlash option

with routes definitions like
```
router.on('GET', '/static/param1', (req, res, params) => {
  res.end('param1');
});
router.on('GET', '/static/param2', (req, res, params) => {
  res.end('param2');
});
router.on('GET', '/static/:paramA/next', (req, res, params) => {
  res.end(JSON.stringify({ route: 'next', ...params }));
});
```

Route print output:
```
Server listening on: http://localhost:3111
└── /
    └── static/
        ├── param
        │   ├── 1 (GET)
        │   └── 2 (GET)
        └── :
            └── /next (GET)
```

Requests
- `GET /static/param1`
  -> 200 `param1`
- `GET /static/param2`
  -> 200 `param2`
- `GET /static/paramOther/next`
  -> 200 `{ route="next", paramA="paramOther" }`
- `GET /static/param1/next` without `ignoreTrailingSlash`
  -> 200 `{ route="next", paramA="param1" }`
- `GET /static/param1/next` with `ignoreTrailingSlash`
  -> 200 `{ route="next", paramA="" }` -> first problem here

So I read https://github.com/fastify/fastify/issues/2261#issuecomment-626457767 and I can understand the "greedy match algorithm" logic and conclusion, but behaviour can get even more strange, as I show in following examples.

## one route with two parameters vs fully-static routes

with ADDED routes definitions like
```
... // SAME ROUTES AS BEFORE
router.on('GET', '/static/param1/next/param3', (req, res, params) => {
  res.end('param1-3');
});
router.on('GET', '/static/param1/next/param4', (req, res, params) => {
  res.end('param1-4');
});
router.on('GET', '/static/:paramA/next/:paramB/other', (req, res, params) => {
  res.end(JSON.stringify({ route: 'other', ...params }));
});
```

Route print output
```
Server listening on: http://localhost:3111
└── /
    └── static/
        ├── param
        │   ├── 1 (GET)
        │   │   └── /next/param
        │   │       ├── 3 (GET)
        │   │       └── 4 (GET)
        │   └── 2 (GET)
        └── :
            └── /next (GET)
                └── /
                    └── :
                        └── /other (GET)
```

Requests
- `GET /static/param1/next/param3`
  -> 200 `param1-3`
- `GET /static/param1/next/param4`
  -> 200 `param1-4`
- `GET /static/paramOther/next/paramOther2/other`
  -> 200 `{ route="other", paramA="paramOther", paramB="paramOther2"}`
- `GET /static/param1/next/paramOther/other` without `ignoreTrailingSlash`
  -> 200 `{ route="other", paramA="", paramB="paramOther" }`
  -> same problem here, paramA disappears, but ! without ignoreTrailingSlash
- `GET /static/param1/next/paramOther/other` with`ignoreTrailingSlash`
  -> 404
  -> yet another behaviour
- `GET /static/param1/next/param3/other` with or without `ignoreTrailingSlash`
  -> 404
  -> in both cases

## one route with two parameters and multiple path fragments with the same text, vs fully-static routes

with ADDED routes definitions like
```
... // SAME ROUTES AS BEFORE
router.on('GET', '/static/:paramA/next/:paramB/next', (req, res, params) => {
  res.end(JSON.stringify({ route: 'next', ...params }));
});
```

Routes print output
```
Server listening on: http://localhost:3111
└── /
    └── static/
        ├── param
        │   ├── 1 (GET)
        │   │   └── /next/param
        │   │       ├── 3 (GET)
        │   │       └── 4 (GET)
        │   └── 2 (GET)
        └── :
            └── /next (GET)
                └── /
                    └── :
                        └── /
                            ├── other (GET)
                            └── next (GET)
```

Requests
- `GET /static/paramOther/next/paramOther/next`
  -> 200 `{ route="other", paramA="paramOther", paramB="paramOther2"}`
- `GET /static/param1/next/paramOther/next` without `ignoreTrailingSlash`
  -> 200 `{ route="other", paramA="", paramB="paramOther" }`
  -> same problem as before
- `GET /static/param1/next/paramOther/next` with `ignoreTrailingSlash`
  -> 404
  -> same problem as before
- `GET /static/param1/next/param3/next` without `ignoreTrailingSlash`
  -> 200 `{ route="other", paramA="paramOther" }`
  -> *new problem, paramB value is in paramA !*
- `GET /static/param1/next/param3/next` with`ignoreTrailingSlash`
  -> 200 `{ route="other", paramA="" }`
  -> *new problem*

So, apparently, if I define route with repeating fragments (`/next` here), it can mess up the parameters value affectation.

## with 3 levels of parameters

with ADDED routes definitions like
```
// ... SAME ROUTES AS BEFORE
router.on('GET', '/static/param1/next/param2/other/param3', (req, res, params) => {
  res.end('param1-2-3');
});
router.on('GET', '/static/param1/next/param2/other/param4', (req, res, params) => {
  res.end('param1-2-4');
});
router.on('GET', '/static/:paramA/next/:paramB/other/:paramC/last', (req, res, params) => {
  res.end(JSON.stringify({ route: 'last', ...params }));
});
```

Routes print output
```
Server listening on: http://localhost:3111
└── /
    └── static/
        ├── param
        │   ├── 1 (GET)
        │   │   └── / (GET)
        │   │       └── next/param
        │   │           ├── 2/other/param
        │   │           │   ├── 3 (GET)
        │   │           │   │   └── / (GET)
        │   │           │   └── 4 (GET)
        │   │           │       └── / (GET)
        │   │           ├── 3 (GET)
        │   │           │   └── / (GET)
        │   │           └── 4 (GET)
        │   │               └── / (GET)
        │   └── 2 (GET)
        │       └── / (GET)
        └── :
            └── /next (GET)
                └── / (GET)
                    └── :
                        └── /
                            ├── other (GET)
                            │   └── / (GET)
                            │       └── :
                            │           └── /last (GET)
                            │               └── / (GET)
                            └── next (GET)
                                └── / (GET)
```

Requests
- `GET /static/paramOther/next/paramOther2/other/paramOther3/last` without `ignoreTrailingSlash`
  -> 200 `{ route="last", paramA="paramOther", paramB="paramOther2", paramC="paramOther3" }`
- `GET /static/paramOther/next/paramOther2/other/paramOther3/last` with `ignoreTrailingSlash`
  -> 200 `{ route="last", paramA="", paramB="paramOther2", paramC="paramOther3" }`
  -> paramA is lost
- `GET /static/param1/next/paramOther2/other/paramOther3/last` with|without `ignoreTrailingSlash`
  -> 404
  -> new behaviour
- `GET /static/param1/next/param2/other/paramOther3/last` with|without `ignoreTrailingSlash`
  -> 404
- `GET /static/param1/next/param2/other/param3/last` with|without `ignoreTrailingSlash`
  -> 404

So here the behaviour is yet again slightly different, `ignoreTrailingSlash` eats the first param if it's different from the static routes, but as soon as the first parameter `paramA` matches one of the defined static routes (here `param1`), I get only 404.

## fully-dynamic routes vs mixed dynamic/static routes

if I defined routes starting with dynamic parameters dans ending with a static part like
```
router.on('GET', '/dynamic/:paramA/next/param3', (req, res, params) => {
  res.end('paramA-3');
});

router.on('GET', '/dynamic/:paramA/next/:paramB/next', (req, res, params) => {
  res.end(JSON.stringify({ route: 'next', ...params }));
});

router.on('GET', '/dynamic/:paramA/next/:paramB/other', (req, res, params) => {
  res.end(JSON.stringify({ route: 'other', ...params }));
});
```

Then
- without `ignoreTrailingSlash` I have no problems
- with `ignoreTrailingSlash` I have the "matching parameters are empty" problems as usual

## conclusion

I have read:
- https://github.com/delvedor/find-my-way/issues/149
- https://github.com/fastify/fastify/issues/2261 and the explanation of why the router is not "backtracking"

I am aware of the matching priority of static vs parameters routes:
1. static
2. parametric
3. wildcards
4. parametric(regex)
5. multi parametric(regex)tatic

But as shown here, when static routes overlap with parametric routes, the resulting matching behaviour and parameters values for the parametric routes are too much random, depending on
- with static routes are defined,
- which parameters values conflicts with static routes,
- and `ignoreTrailingSlash` option.
You can even get some parameters values extracted in another parameter key.
The fact that repeating route fragments change the behaviour is also hard to predict.

I feel the only maintainable approach for a dev team would be to completely seggregate static and parametrics routes, for example with starting prefixes like `/static` and `/dynamic` at url root.
Otherwise the risk of breaking the routers when adding a route of changing a part of a route are too big.
