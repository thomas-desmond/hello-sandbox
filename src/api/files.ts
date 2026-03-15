import { Hono } from 'hono';

import { sandbox } from './sandbox';

const app = new Hono<{ Bindings: Env }>();

app.post('/write', async (c) => {
	const { path, content } = await c.req.json<{
		path: string;
		content: string;
	}>();
	const result = await sandbox(c.env).writeFile(path, content);
	return c.json({ success: result.success, path: result.path });
});

app.post('/read', async (c) => {
	const { path } = await c.req.json<{ path: string }>();
	const result = await sandbox(c.env).readFile(path);
	return c.json({
		success: result.success,
		content: result.content,
		path: result.path,
		mimeType: result.mimeType,
		size: result.size,
	});
});

app.post('/mkdir', async (c) => {
	const { path } = await c.req.json<{ path: string }>();
	const result = await sandbox(c.env).mkdir(path, { recursive: true });
	return c.json({ success: result.success, path: result.path });
});

app.post('/list', async (c) => {
	const { path } = await c.req.json<{ path?: string }>();
	const result = await sandbox(c.env).listFiles(path || '/workspace');
	return c.json({
		success: result.success,
		files: result.files,
		count: result.count,
		path: result.path,
	});
});

app.post('/delete', async (c) => {
	const { path } = await c.req.json<{ path: string }>();
	const result = await sandbox(c.env).deleteFile(path);
	return c.json({ success: result.success, path: result.path });
});

app.post('/exists', async (c) => {
	const { path } = await c.req.json<{ path: string }>();
	const result = await sandbox(c.env).exists(path);
	return c.json({ exists: result.exists, path: result.path });
});

export default app;
