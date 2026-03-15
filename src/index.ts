import { getSandbox, proxyToSandbox } from '@cloudflare/sandbox';
import { createOpencodeServer } from '@cloudflare/sandbox/opencode';
import { Hono } from 'hono';

import api from './api';

// Required: re-export Sandbox classes for Durable Object bindings
export { Sandbox } from '@cloudflare/sandbox';
export { Sandbox as OpencodeSandbox } from '@cloudflare/sandbox';

const app = new Hono<{ Bindings: Env }>();

// Route preview-URL requests to the correct sandbox binding.
// Both Sandbox and OpencodeSandbox use the same Sandbox class, so proxyToSandbox
// can't distinguish them. We check the hostname for the OpenCode sandbox ID first
// and proxy with only that binding, then fall through to the default.
app.use('*', async (c, next) => {
	const host = new URL(c.req.url).hostname;

	// OpenCode preview URLs contain the sandbox ID "opencode" in the subdomain.
	// Pass only the OpencodeSandbox binding so proxyToSandbox routes to the right DO.
	if (host.includes('-opencode-')) {
		const response = await proxyToSandbox(c.req.raw, { Sandbox: c.env.OpencodeSandbox });
		if (response) return response;
	}

	// Default sandbox preview URLs
	const response = await proxyToSandbox(c.req.raw, { Sandbox: c.env.Sandbox });
	if (response) return response;

	return next();
});

// WebSocket terminal upgrade — must be handled before Hono JSON routing
app.get('/ws/terminal', async (c) => {
	if (c.req.header('Upgrade') !== 'websocket') {
		return c.text('WebSocket upgrade required', 426);
	}
	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any -- sandbox proxy typing not available
	const sandbox = getSandbox(c.env.Sandbox, 'demo-sandbox') as any;
	return await sandbox.terminal(c.req.raw, { cols: 120, rows: 30 });
});

// OpenCode: start the server, expose its port, return the preview URL for iframe embedding
app.get('/api/opencode/start', async (c) => {
	// Use .host (includes port) so the SDK constructs correct local dev URLs
	const hostname = new URL(c.req.url).host;
	const sandbox = getSandbox(c.env.OpencodeSandbox, 'opencode');

	const server = await createOpencodeServer(sandbox, {
		directory: '/home/user/agents',
	});

	// Reuse existing preview URL if the port is already exposed
	const exposedPorts = await sandbox.getExposedPorts(hostname);
	const existing = exposedPorts.find((p) => p.port === server.port);
	const exposed = existing ?? (await sandbox.exposePort(server.port, { hostname, name: 'opencode' }));
	const url = exposed.url;

	return c.json({ url });
});

// Mount all API routes
app.route('/api', api);

// Fall back to static assets for everything else (SPA)
app.all('*', async (c) => {
	return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
