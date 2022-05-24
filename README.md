# App notes

This is a demo of a simple HTML/CSS/ES6 web app and how it can be tested
headlessly using Jest on NodeJS.

It's a minimal complete app with all JS logic encapsulated into one
testable ES6 module.

There are no "build" steps, i.e the JS code runs as it is. For production
though, one would probably want to "minify" and sanitize the code with linters
and other tools.

Grep for `TODO` to get a list of items I would have liked to improve before
shipping in production.

## File structure

All files are in one dir. For production, however, I would split it to one
module for frontend and one for backend (to make the API cut visible in the
file tree and to have "npm test" for both sides).

## Testing

I use plain dependency injection and [JSDOM](https://github.com/jsdom/jsdom)
to decouple all app logic (ES6) from view (HTML/CSS) markup. All alert logic is
tested on a headless NodeJS instance (no need for a browser, so these tests
would easily run in a CI pipeline).

```
npm install && npm test
```

[Jest can, as of 28.1.0, still not parse ES6 modules well](https://github.com/facebook/jest/issues/10025#issuecomment-1116344877),
that's why I let Jest run Babel to transpile all ES6 code, before it runs tests.

## Backend

`server.php` is smaller than the NodeJS version in `server.js`.
I use it to [track the load of my personal web host](https://logikbyran.se/demos/cpuload/).

If you don't like PHP, run the NodeJS version:
```
npm start
```
