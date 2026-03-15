/**
 * Shared sandbox accessor — single source of truth for the sandbox ID
 */
import { getSandbox } from '@cloudflare/sandbox';

const SANDBOX_ID = 'demo-sandbox';

export function sandbox(environment: Env) {
	return getSandbox(environment.Sandbox, SANDBOX_ID);
}
