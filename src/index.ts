import { getSandbox, proxyToSandbox } from '@cloudflare/sandbox';
import { Hono } from 'hono';

import api from './api';

// Required: re-export Sandbox class for Durable Object binding
export { Sandbox } from '@cloudflare/sandbox';

const app = new Hono<{ Bindings: Env }>();

// Proxy preview-URL requests to sandbox containers (before all other routes)
app.use('*', async (c, next) => {
	const proxyResponse = await proxyToSandbox(c.req.raw, c.env);
	if (proxyResponse) return proxyResponse;
	return next();
});

// WebSocket terminal upgrade — must be handled before Hono JSON routing
app.get('/ws/terminal', async (c) => {
	if (c.req.header('Upgrade') !== 'websocket') {
		return c.text('WebSocket upgrade required', 426);
	}
	// getSandbox() proxy exposes terminal() at runtime
	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any -- sandbox proxy typing not available
	const sandbox = getSandbox(c.env.Sandbox, 'demo-sandbox') as any;
	return await sandbox.terminal(c.req.raw, { cols: 120, rows: 30 });
});

// Mount all API routes
app.route('/api', api);

// Fall back to static assets for everything else (SPA)
app.all('*', async (c) => {
	return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
