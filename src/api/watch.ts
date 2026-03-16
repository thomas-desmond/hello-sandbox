import { Hono } from 'hono';

import { sandbox } from './sandbox';

const app = new Hono<{ Bindings: Env; Variables: { sandboxId: string } }>();

// SSE stream — consumed via EventSource on the client.
// sandbox.watch() returns a ReadableStream<Uint8Array> in standard SSE format.
// We pipe it directly to the browser — EventSource handles parsing.
app.get('/', async (c) => {
	const path = c.req.query('path') || '/workspace';
	const includeRaw = c.req.query('include');
	const include = includeRaw ? includeRaw.split(',').map((s) => s.trim()) : undefined;

	const sb = sandbox(c);

	// Ensure directory exists
	const exists = await sb.exists(path);
	if (!exists.exists) {
		await sb.mkdir(path, { recursive: true });
	}

	const stream = await sb.watch(path, { recursive: true, include });

	// Return raw SSE stream with correct headers.
	// Use c.body() to ensure Hono's middleware (CORS) still applies.
	c.header('Content-Type', 'text/event-stream');
	c.header('Cache-Control', 'no-cache');
	c.header('Connection', 'keep-alive');
	return c.body(stream);
});

export default app;
