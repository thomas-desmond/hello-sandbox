# Agents.md

This document is a collection of guidelines for agents working on the project.

## Definition of Done

- [ ] You ran `bun run format` to format the code and it passes with no errors.
- [ ] You ran `bun run typecheck` to check for type errors and it passes with no errors.
- [ ] You ran `bun run knip` to check for unused dependencies, exports and files and it passes with no errors.

## Coding Conventions

- All file names must use kebab-case (e.g., `my-component.tsx`, `api-client.ts`).
- Use TypeScript for all code.
- Use early returns when possible.
- Follow existing code patterns in the codebase.
- Always use the `cn` utility from `@/lib/utilities` when merging or applying conditional classes (if it exists).

## React Best Practices

- If you can calculate something during render, you don't need an Effect.
- To cache expensive calculations, add useMemo instead of useEffect.
- To reset the state of an entire component tree, pass a different key to it.
- To reset a particular bit of state in response to a prop change, set it during rendering.
- Code that runs because a component was displayed should be in Effects, the rest should be in events.
- If you need to update the state of several components, it's better to do it during a single event.
- Whenever you try to synchronize state variables in different components, consider lifting state up.
- You can fetch data with Effects, but you need to implement cleanup to avoid race conditions.

## Project Structure

- **Reusable Components**: Place strictly reusable UI components in `src/client/components/`.
- Colocate related code together.

## Directories

- `src/` - Application sources.
  - `client/` - React frontend (components, panels, lib, slides).
  - `api/` - Hono API routes (exec, files, interpreter, ai, preview, watch, backup).
  - `index.ts` - Worker entry point.

## Tech Stack

### Frontend

- React with TypeScript.
- Tailwind CSS for styling.
- Framer Motion for animations.

### Backend

- Cloudflare Workers with Hono framework.
- Cloudflare Durable Objects (Sandbox containers).
- WebSockets for terminal access.

### Build and Tooling

- Package manager: bun (use bun commands, not npm/yarn/pnpm).
- Build tool: Vite with @cloudflare/vite-plugin.
- Dev server: `bun run dev`.
- Install all dependencies as dev dependencies (`bun add -d`) since they are bundled with Vite, except for runtime dependencies that the Worker needs.

## Cloudflare Workers

STOP. Your knowledge of Cloudflare Workers APIs and limits may be outdated. Always retrieve current documentation before any Workers, KV, R2, D1, Durable Objects, Queues, Vectorize, AI, or Agents SDK task.

### Docs

- https://developers.cloudflare.com/workers/
- MCP: `https://docs.mcp.cloudflare.com/mcp`

For all limits and quotas, retrieve from the product's `/platform/limits/` page. eg. `/workers/platform/limits`

### Commands

| Command               | Purpose                   |
| --------------------- | ------------------------- |
| `bun run dev`         | Local development         |
| `bun run deploy`      | Deploy to Cloudflare      |
| `bun run cf-typegen`  | Generate TypeScript types |

Run `bun run cf-typegen` after changing bindings in wrangler.jsonc.

### Node.js Compatibility

https://developers.cloudflare.com/workers/runtime-apis/nodejs/

### Errors

- **Error 1102** (CPU/Memory exceeded): Retrieve limits from `/workers/platform/limits/`
- **All errors**: https://developers.cloudflare.com/workers/observability/errors/

### Product Docs

Retrieve API references and limits from:
`/kv/` · `/r2/` · `/d1/` · `/durable-objects/` · `/queues/` · `/vectorize/` · `/workers-ai/` · `/agents/`
