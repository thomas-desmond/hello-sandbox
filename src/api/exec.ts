import { Hono } from 'hono';

import { sandbox } from './sandbox';

const app = new Hono<{ Bindings: Env }>();

app.post('/', async (c) => {
	const { command } = await c.req.json<{ command: string }>();
	if (!command) return c.json({ error: 'command is required' }, 400);

	const sb = sandbox(c.env);
	const result = await sb.exec(command);

	return c.json({
		stdout: result.stdout,
		stderr: result.stderr,
		exitCode: result.exitCode,
		success: result.success,
		command: result.command,
		duration: result.duration,
	});
});

export default app;
