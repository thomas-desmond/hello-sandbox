import { Hono } from 'hono';

import { sandbox } from './sandbox';

import type { CodeContext } from '@cloudflare/sandbox';

// Server-side context cache — keyed by context ID string
const contextCache = new Map<string, CodeContext>();

const app = new Hono<{ Bindings: Env }>();

app.post('/', async (c) => {
	const { code, language, contextId } = await c.req.json<{
		code: string;
		language?: 'python' | 'javascript';
		contextId?: string;
	}>();
	if (!code) return c.json({ error: 'code is required' }, 400);

	const sb = sandbox(c.env);
	const lang = language || 'python';

	// Re-use existing context or create a new one
	let context: CodeContext;
	if (contextId && contextCache.has(contextId)) {
		context = contextCache.get(contextId)!;
	} else {
		context = await sb.createCodeContext({ language: lang });
		contextCache.set(context.id, context);
	}

	const result = await sb.runCode(code, { context: context });

	return c.json({
		logs: result.logs,
		error: result.error,
		results: result.results,
		executionCount: result.executionCount,
		contextId: context.id,
		code: result.code,
	});
});

export default app;
