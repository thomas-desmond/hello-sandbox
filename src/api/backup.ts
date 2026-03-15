import { Hono } from 'hono';

import { sandbox } from './sandbox';

const app = new Hono<{ Bindings: Env }>();

app.post('/create', async (c) => {
	const { dir, name } = await c.req.json<{ dir?: string; name?: string }>();
	const backup = await sandbox(c.env).createBackup({
		dir: dir || '/workspace',
		name: name || 'demo-checkpoint',
	});
	return c.json({ success: true, backup: { id: backup.id, dir: backup.dir } });
});

app.post('/restore', async (c) => {
	const { backup } = await c.req.json<{
		backup: { id: string; dir: string };
	}>();
	if (!backup) return c.json({ error: 'backup handle is required' }, 400);

	const result = await sandbox(c.env).restoreBackup(backup);
	return c.json({ success: result.success, dir: result.dir, id: result.id });
});

app.post('/status', async (c) => {
	return c.json({
		available: true,
		message: 'Backup/restore creates a squashfs snapshot of the sandbox filesystem.',
	});
});

export default app;
