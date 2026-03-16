import { Hono } from 'hono';

import { sandbox } from './sandbox';

import type { CodeContext } from '@cloudflare/sandbox';

// Server-side context cache — keyed by context ID string
const contextCache = new Map<string, CodeContext>();

const app = new Hono<{ Bindings: Env; Variables: { sandboxId: string } }>();

/**
 * Check if an execution error is a JavaScript re-declaration error.
 * This happens when code with top-level let/const is run twice in the
 * same vm context, since let/const bindings can't be re-declared.
 */
function isRedeclarationError(error?: { message?: string }): boolean {
	return Boolean(error?.message?.includes('has already been declared'));
}

app.post('/', async (c) => {
	const { code, language, contextId } = await c.req.json<{
		code: string;
		language?: 'python' | 'javascript';
		contextId?: string;
	}>();
	if (!code) return c.json({ error: 'code is required' }, 400);

	const sb = sandbox(c);
	const lang = language || 'python';

	// Re-use existing context or create a new one
	let context: CodeContext;
	if (contextId && contextCache.has(contextId)) {
		context = contextCache.get(contextId)!;
	} else {
		context = await sb.createCodeContext({ language: lang });
		contextCache.set(context.id, context);
	}

	let result = await sb.runCode(code, { context: context });

	// If JavaScript code fails because of a top-level let/const re-declaration,
	// retry in a fresh context. This avoids the common pitfall where running
	// the same JS snippet twice in the same vm context triggers a SyntaxError.
	if (lang === 'javascript' && isRedeclarationError(result.error)) {
		contextCache.delete(context.id);
		context = await sb.createCodeContext({ language: lang });
		contextCache.set(context.id, context);
		result = await sb.runCode(code, { context: context });
	}

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
