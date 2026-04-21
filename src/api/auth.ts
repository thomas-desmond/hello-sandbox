import { Hono } from 'hono';
import { z } from 'zod';

import { sandbox } from './sandbox';

const httpbinSchema = z.object({
	headers: z.record(z.string(), z.string()),
});

const app = new Hono<{ Bindings: Env; Variables: { sandboxId: string } }>();

app.post('/request', async (c) => {
	const sb = sandbox(c);
	const result = await sb.exec('curl -s https://httpbin.org/headers');

	const parsed = httpbinSchema.safeParse(JSON.parse(result.stdout));
	if (!parsed.success) {
		return c.json({ error: 'Failed to parse response', stdout: result.stdout, stderr: result.stderr }, 500);
	}

	return c.json({
		headers: parsed.data.headers,
		exitCode: result.exitCode,
		success: result.success,
		duration: result.duration,
	});
});

export default app;
