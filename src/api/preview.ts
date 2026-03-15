import { Hono } from 'hono';

import { sandbox } from './sandbox';

const app = new Hono<{ Bindings: Env }>();

app.post('/start', async (c) => {
	const { command, port: portRaw } = await c.req.json<{
		command?: string;
		port?: number;
	}>();
	const sb = sandbox(c.env);
	// Use .host (includes port) so the SDK can construct correct local dev URLs
	const hostname = new URL(c.req.url).host;
	const cmd = command || 'python3 -m http.server 8080';
	const port = portRaw || 8080;

	// Write a demo HTML page if missing
	const exists = await sb.exists('/workspace/index.html');
	if (!exists.exists) {
		await sb.writeFile('/workspace/index.html', getDemoHTML());
	}

	// Start server and wait for port readiness
	const proc = await sb.startProcess(cmd, { cwd: '/workspace' });
	await proc.waitForPort(port, { mode: 'tcp', timeout: 10_000 });

	// Reuse existing preview URL if the port is already exposed
	const exposedPorts = await sb.getExposedPorts(hostname);
	const existing = exposedPorts.find((p) => p.port === port);
	if (existing) {
		return c.json({ success: true, url: existing.url, port: existing.port });
	}

	const exposed = await sb.exposePort(port, { hostname });
	return c.json({ success: true, url: exposed.url, port: exposed.port });
});

app.post('/stop', async (c) => {
	const { port } = await c.req.json<{ port?: number }>();
	await sandbox(c.env).unexposePort(port || 8080);
	return c.json({ success: true });
});

app.post('/list', async (c) => {
	const hostname = new URL(c.req.url).host;
	const ports = await sandbox(c.env).getExposedPorts(hostname);
	return c.json({ ports });
});

export default app;

// ── Demo page served from inside the container ──────────────────────
function getDemoHTML(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sandbox Preview</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;background:#0a0a0f;color:#e8e6e3}
  .card{text-align:center;padding:3rem 4rem;border:1px solid #2a2a3a;background:#12121a}
  h1{font-size:2.5rem;margin-bottom:.5rem;font-weight:600;letter-spacing:-.02em}
  .accent{color:#ff6b35}
  p{color:#8a8a9a;margin-top:.75rem;font-size:1.05rem}
  .badge{display:inline-block;margin-top:1.25rem;padding:.3rem 1rem;background:rgba(255,107,53,.1);color:#ff8c5a;font-size:.8rem;font-family:'JetBrains Mono',monospace;letter-spacing:.04em;border:1px solid rgba(255,107,53,.2)}
</style>
</head>
<body>
  <div class="card">
    <h1>Hello from <span class="accent">Sandbox</span></h1>
    <p>Served from an isolated container on Cloudflare's edge network.</p>
    <div class="badge">sandbox://demo-sandbox:8080</div>
  </div>
</body>
</html>`;
}
