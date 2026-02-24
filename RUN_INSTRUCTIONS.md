# How to Run CDN-OrPaynter-AI

This guide provides simple instructions for running the CDN-OrPaynter-AI application.

## Quick Start (Easiest Method)

The simplest way to run this application is using the included `run.sh` script:

```bash
./run.sh dev
```

This will:

1. Automatically install dependencies if needed
2. Start the development server
3. Open the application on http://localhost:3000

## Available Commands

### Development Mode

```bash
./run.sh dev
```

Runs the app in development mode with hot-reloading enabled.

### Production Build

```bash
./run.sh build
```

Creates an optimized production build.

### Production Server

```bash
./run.sh start
```

Runs the production build (requires running `./run.sh build` first).

## Manual Method

If you prefer not to use the run script:

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

### 3. Access the Application

Open your browser to http://localhost:3000

## Using Netlify CLI (Full Features)

For access to all Netlify features (Edge Functions, Blob Store, etc.):

### 1. Install Netlify CLI

```bash
npm install netlify-cli@latest -g
```

### 2. Link to Netlify Site (Optional)

```bash
netlify link
```

### 3. Run with Netlify Dev

```bash
netlify dev
```

The application will be available at http://localhost:8888

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, Next.js will automatically use the next available port (e.g., 3001).

### Lock File Error

If you see a lock file error, another instance of the dev server may be running. Stop it with:

```bash
ps aux | grep "next dev"
kill <PID>
```

### Build Errors

Some features (like the revalidation page) may require internet access. In restricted environments, these pages may fail to build but the rest of the application will work fine in development mode.

## What You'll See

Once running, you'll have access to:

- **Home Page** - Overview of the platform features
- **Edge Functions** - Server-side logic examples
- **Image CDN** - Image optimization demos
- **Blob Store** - Key-value storage examples
- **Revalidation** - ISR (Incremental Static Regeneration) demos
- **Routing** - Dynamic routing examples

Enjoy exploring the CDN-OrPaynter-AI platform!
