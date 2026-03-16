/**
 * Shared sandbox accessor — resolves the per-user sandbox from Hono context
 */
import { getSandbox } from '@cloudflare/sandbox';

import type { Context } from 'hono';

export function sandbox(c: Context<{ Bindings: Env; Variables: { sandboxId: string } }>) {
	const sandboxId = c.get('sandboxId');
	return getSandbox(c.env.Sandbox, sandboxId);
}
