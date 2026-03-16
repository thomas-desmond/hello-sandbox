import { Hono } from 'hono';

import { sandbox } from './sandbox';

const app = new Hono<{ Bindings: Env; Variables: { sandboxId: string } }>();

/** Check if the BACKUP_BUCKET R2 binding exists in the environment. */
function isBackupConfigured(environment: Env): boolean {
	return 'BACKUP_BUCKET' in environment && environment.BACKUP_BUCKET != undefined;
}

/** Parse SDK configuration errors into a user-friendly response. */
function parseBackupError(error: unknown): { error: string; code?: string; missingConfig?: string[] } {
	const message = error instanceof Error ? error.message : String(error);

	// Match the SDK's InvalidBackupConfigError patterns
	if (message.includes('Backup not configured') || message.includes('BACKUP_BUCKET')) {
		return {
			error: 'Backup is not configured. Add a BACKUP_BUCKET R2 binding to your wrangler.jsonc.',
			code: 'BACKUP_NOT_CONFIGURED',
			missingConfig: ['BACKUP_BUCKET (R2 binding)'],
		};
	}

	if (message.includes('presigned URL credentials') || message.includes('R2_ACCESS_KEY_ID')) {
		const missing: string[] = [];
		if (message.includes('CLOUDFLARE_ACCOUNT_ID')) missing.push('CLOUDFLARE_ACCOUNT_ID');
		if (message.includes('R2_ACCESS_KEY_ID')) missing.push('R2_ACCESS_KEY_ID');
		if (message.includes('R2_SECRET_ACCESS_KEY')) missing.push('R2_SECRET_ACCESS_KEY');
		if (message.includes('BACKUP_BUCKET_NAME')) missing.push('BACKUP_BUCKET_NAME');
		return {
			error: `Backup requires R2 presigned URL credentials. Missing: ${missing.join(', ')}.`,
			code: 'BACKUP_CREDENTIALS_MISSING',
			missingConfig: missing,
		};
	}

	return { error: message };
}

/** Scope a backup name under the current sandbox ID to isolate backups per sandbox in R2. */
function scopedName(sandboxId: string, name: string): string {
	return `${sandboxId}/${name}`;
}

app.post('/create', async (c) => {
	const { dir, name } = await c.req.json<{ dir?: string; name?: string }>();
	const sandboxId = c.get('sandboxId');
	try {
		const backup = await sandbox(c).createBackup({
			dir: dir || '/workspace',
			name: scopedName(sandboxId, name || 'demo-checkpoint'),
		});
		return c.json({ success: true, backup: { id: backup.id, dir: backup.dir } });
	} catch (error) {
		const parsed = parseBackupError(error);
		return c.json(parsed, parsed.code ? 400 : 500);
	}
});

app.post('/restore', async (c) => {
	const { backup } = await c.req.json<{
		backup: { id: string; dir: string };
	}>();
	if (!backup) return c.json({ error: 'backup handle is required' }, 400);

	try {
		const result = await sandbox(c).restoreBackup(backup);
		return c.json({ success: result.success, dir: result.dir, id: result.id });
	} catch (error) {
		const parsed = parseBackupError(error);
		return c.json(parsed, parsed.code ? 400 : 500);
	}
});

app.post('/status', async (c) => {
	const configured = isBackupConfigured(c.env);

	if (!configured) {
		return c.json({
			available: false,
			message: 'Backup is not configured. An R2 bucket binding and credentials are required.',
			missingConfig: [
				'BACKUP_BUCKET — R2 binding in wrangler.jsonc',
				'BACKUP_BUCKET_NAME — environment variable',
				'CLOUDFLARE_ACCOUNT_ID — environment variable or secret',
				'R2_ACCESS_KEY_ID — secret',
				'R2_SECRET_ACCESS_KEY — secret',
			],
		});
	}

	return c.json({
		available: true,
		message: 'Backup/restore creates a squashfs snapshot of the sandbox filesystem.',
	});
});

export default app;
