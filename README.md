# CDN-OrPaynter-AI

A content delivery network (CDN) for [OrPaynter AI](https://github.com/orpaynter), built with Next.js 16 (App Router), Tailwind CSS, and deployed on [Netlify](https://www.netlify.com/).

## What Is It?

CDN-OrPaynter-AI is a web application that serves static assets and dynamic content for the OrPaynter AI platform. It leverages [Netlify Core Primitives](https://docs.netlify.com/core/overview/#develop) — including Edge Functions, Image CDN, and Blob Store — to deliver optimized resources with low latency.

### Key Features

- **Edge Functions** — Run server-side logic at the edge for fast, location-aware responses.
- **Image CDN** — Automatic image optimization and transformation via `next/image` and Netlify's Image CDN.
- **Blob Store** — Persistent key-value storage for dynamic content.
- **Middleware** — Request-level security headers and routing logic.
- **Revalidation** — Incremental Static Regeneration (ISR) support for up-to-date content.
- **Dynamic Routing** — Configurable redirects and rewrites via `next.config.js`.

## Private Access

This site is protected by HTTP Basic Auth. Set `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD` in your environment (for example in Netlify site settings or a local `.env.local`) before running `netlify dev` or deploying.

## Developing Locally

1. Clone this repository, then run `npm install` in its root directory.

2. For full functionality locally (e.g. edge functions, blob store), ensure you have an up-to-date version of Netlify CLI. Run:

```
npm install netlify-cli@latest -g
```

3. Link your local repository to the deployed Netlify site. This will ensure you're using the same runtime version for both local development and your deployed site.

```
netlify link
```

4. Then, run the Next.js development server via Netlify CLI:

```
netlify dev
```

If your browser doesn't navigate to the site automatically, visit [localhost:8888](http://localhost:8888).

## Resources

- [Next.js on Netlify docs](https://docs.netlify.com/frameworks/next-js/overview/)
- [Netlify Core Primitives](https://docs.netlify.com/core/overview/#develop)
