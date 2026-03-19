# Hello Sandbox

An interactive demo application for the [Cloudflare Sandbox SDK](https://developers.cloudflare.com/sandbox/). It provides a polished web UI that showcases isolated code execution containers running on Cloudflare's edge network.

## Features

The app includes 9 panels, each demonstrating a different Sandbox SDK capability:

- **Execute** -- Run shell commands and view stdout/stderr/exit codes
- **Files** -- Full filesystem CRUD (write, read, mkdir, list, delete, exists)
- **Code** -- Stateful Python and JavaScript REPL with variable persistence across calls
- **AI Exec** -- Natural language to code: an LLM generates Python and executes it in the sandbox
- **Terminal** -- Interactive terminal session via xterm.js over WebSocket
- **Preview** -- Start HTTP servers inside the container and expose them via public preview URLs
- **Watch** -- Live filesystem change stream via Server-Sent Events
- **OpenCode** -- Embedded AI coding agent ([OpenCode](https://opencode.ai)) running in a dedicated sandbox container
- **Backup** -- Create and restore R2-backed squashfs snapshots of the sandbox filesystem

A **slides mode** (`?mode=slides`) is also included for presenting the SDK's capabilities.

## Tech Stack

| Layer           | Technology                       |
| --------------- | -------------------------------- |
| Runtime         | Cloudflare Workers               |
| Server          | Hono                             |
| Frontend        | React 19                         |
| Build           | Vite + `@cloudflare/vite-plugin` |
| CSS             | Tailwind CSS v4                  |
| Terminal        | xterm.js                         |
| AI              | Vercel AI SDK + Workers AI       |
| Animations      | Framer Motion                    |
| Language        | TypeScript                       |
| Package Manager | Bun                              |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/)
- [Docker](https://www.docker.com/) (for local sandbox containers)

### Install

```bash
bun install
```

### Develop

```bash
bun run dev
```

The first run builds the Docker container (~2-3 minutes). The app is served at `http://localhost:8787`.

### Type Check

```bash
bun run typecheck
```

### Lint and Format

```bash
bun run lint      # check
bun run format    # fix
```

### Deploy

```bash
bun run deploy
```

After first deployment, wait 2-3 minutes for container provisioning before making requests.

## Project Structure

```
src/
  index.ts              # Worker entry: Hono app, WebSocket terminal, SPA fallback
  api/
    index.ts            # Central API router with CORS and /api/status health endpoint
    sandbox.ts          # Shared sandbox accessor
    exec.ts             # POST /api/exec
    files.ts            # POST /api/files/*
    interpreter.ts      # POST /api/code
    ai.ts               # POST /api/ai
    preview.ts          # POST /api/preview/*
    watch.ts            # GET  /api/watch (SSE)
    backup.ts           # POST /api/backup/*
  client/
    app.tsx             # Main app shell (sidebar nav, animated panels, status bar)
    panels/             # One component per demo panel (9 panels)
    components/         # Shared UI (badges, cards, code blocks, file tree, etc.)
    lib/                # API client, formatting, syntax highlighting, hooks
    slides/             # Presentation mode (15 slides)
```

## Configuration

Cloudflare bindings are defined in `wrangler.jsonc`:

| Binding           | Type           | Purpose                                                                 |
| ----------------- | -------------- | ----------------------------------------------------------------------- |
| `AI`              | Workers AI     | LLM inference for AI Exec panel                                         |
| `ASSETS`          | Static Assets  | SPA asset serving                                                       |
| `BACKUP_BUCKET`   | R2 Bucket      | Snapshot storage for backup/restore                                     |
| `Sandbox`         | Durable Object | Main demo sandbox (`cloudflare/sandbox:0.7.17-python`)                  |
| `OpencodeSandbox` | Durable Object | Dedicated OpenCode agent sandbox (`cloudflare/sandbox:0.7.17-opencode`) |

After changing bindings, regenerate types:

```bash
bun run cf-typegen
```

## Resources

- [Sandbox SDK Documentation](https://developers.cloudflare.com/sandbox/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [OpenCode](https://opencode.ai/)
