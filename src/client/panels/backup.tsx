import { useEffect, useState } from 'react';

import { Badge } from '@/components/badge';
import { Callout } from '@/components/callout';
import { CodeBlock } from '@/components/code-block';
import { FileTree } from '@/components/file-tree';
import { Output, Stdout, Stderr, Info } from '@/components/output';
import { Spinner } from '@/components/spinner';
import { api } from '@/lib/api';

interface BackupInfo {
	id: string;
	dir: string;
}

interface BackupCreateResult {
	success: boolean;
	backup: BackupInfo;
}

interface BackupRestoreResult {
	success: boolean;
	dir: string;
	id: string;
}

interface ExecResult {
	stdout: string;
	stderr: string;
	exitCode: number;
	success: boolean;
}

interface BackupStatus {
	available: boolean;
	message: string;
	missingConfig?: string[];
}

const SDK_CODE = `const backup = await sandbox.createBackup({
  dir: '/workspace',
  name: 'pre-deploy-checkpoint',
});
// backup: { id: 'abc-123', dir: '/workspace' }
await sandbox.restoreBackup(backup);`;

const WRANGLER_CONFIG_EXAMPLE = `// wrangler.jsonc
{
  "r2_buckets": [
    { "binding": "BACKUP_BUCKET", "bucket_name": "my-backup-bucket" }
  ],
  "vars": {
    "BACKUP_BUCKET_NAME": "my-backup-bucket",
    "CLOUDFLARE_ACCOUNT_ID": "<your-account-id>"
  }
}
// Then set secrets:
// npx wrangler secret put R2_ACCESS_KEY_ID
// npx wrangler secret put R2_SECRET_ACCESS_KEY`;

/**
 * Map raw error messages from the SDK into user-friendly descriptions
 * with actionable remediation steps.
 */
function formatBackupError(message: string): { title: string; detail: string } {
	if (message.includes('not configured') || message.includes('BACKUP_BUCKET')) {
		return {
			title: 'Backup is not configured',
			detail:
				'The BACKUP_BUCKET R2 binding is missing from your wrangler.jsonc. ' +
				'Add an R2 bucket binding and the required credentials to enable backup/restore.',
		};
	}

	if (message.includes('presigned URL credentials') || message.includes('R2_ACCESS_KEY_ID')) {
		return {
			title: 'Missing R2 credentials',
			detail:
				'The R2 bucket binding exists, but presigned URL credentials are missing. ' +
				'Set BACKUP_BUCKET_NAME, CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY ' +
				'as environment variables or secrets in your wrangler.jsonc.',
		};
	}

	if (message.includes('Network error')) {
		return {
			title: 'Network error',
			detail: 'Unable to reach the server. Make sure the dev server is running (npx wrangler dev).',
		};
	}

	return { title: 'Backup failed', detail: message };
}

export function BackupPanel() {
	const [directory, setDirectory] = useState('/workspace');
	const [backup, setBackup] = useState<BackupInfo | undefined>();
	const [loading, setLoading] = useState(false);
	const [restoring, setRestoring] = useState(false);
	const [output, setOutput] = useState<string[]>([]);
	const [error, setError] = useState<{ title: string; detail: string } | undefined>();
	const [deleting, setDeleting] = useState(false);
	const [configStatus, setConfigStatus] = useState<BackupStatus | undefined>();
	const [configLoading, setConfigLoading] = useState(true);
	const [refreshKey, setRefreshKey] = useState(0);

	// Check backup configuration on mount
	useEffect(() => {
		let cancelled = false;
		async function checkStatus() {
			try {
				const status = await api<BackupStatus>('/api/backup/status');
				if (!cancelled) setConfigStatus(status);
			} catch {
				if (!cancelled) {
					setConfigStatus({
						available: false,
						message: 'Unable to check backup configuration. The server may not be running.',
					});
				}
			} finally {
				if (!cancelled) setConfigLoading(false);
			}
		}
		void checkStatus();
		return () => {
			cancelled = true;
		};
	}, []);

	async function createBackup() {
		if (!directory.trim()) return;
		setLoading(true);
		setError(undefined);
		try {
			const data = await api<BackupCreateResult>('/api/backup/create', {
				dir: directory,
			});
			setBackup(data.backup);
			setOutput([`Backup created successfully`, `  ID: ${data.backup.id}`, `  Directory: ${data.backup.dir}`]);
			setRefreshKey((k) => k + 1);
		} catch (error_) {
			const message = error_ instanceof Error ? error_.message : 'Failed to create backup';
			setError(formatBackupError(message));
		} finally {
			setLoading(false);
		}
	}

	async function restoreBackup() {
		if (!backup) return;
		setRestoring(true);
		setError(undefined);
		try {
			const data = await api<BackupRestoreResult>('/api/backup/restore', {
				backup,
			});
			setOutput((previous) => [...previous, '', `Backup restored successfully`, `  ID: ${data.id}`, `  Directory: ${data.dir}`]);
			setRefreshKey((k) => k + 1);
		} catch (error_) {
			const message = error_ instanceof Error ? error_.message : 'Failed to restore backup';
			setError(formatBackupError(message));
		} finally {
			setRestoring(false);
		}
	}

	async function deleteAllFiles() {
		setDeleting(true);
		setError(undefined);
		try {
			await api<ExecResult>('/api/exec', {
				command: "rm -rf /workspace/* /workspace/.* 2>/dev/null; echo 'All files deleted'",
			});
			setOutput((previous) => [...previous, '', 'All files deleted from /workspace']);
			setRefreshKey((k) => k + 1);
		} catch (error_) {
			const message = error_ instanceof Error ? error_.message : 'Delete failed';
			setError(formatBackupError(message));
		} finally {
			setDeleting(false);
		}
	}

	const isNotConfigured = configStatus && !configStatus.available;
	const isReady = configStatus?.available;

	return (
		<section className="flex flex-col gap-6">
			<div>
				<h2 className="font-sans text-2xl font-medium text-cf-text">Backup & Restore</h2>
				<p className="mt-1 text-base text-cf-text-muted">
					Create filesystem snapshots and restore them instantly. Perfect for checkpointing before risky operations or resetting sandbox
					state.
				</p>
			</div>

			<CodeBlock code={SDK_CODE} />

			{/* Configuration status banner */}
			{configLoading && (
				<div className="flex items-center gap-2 text-sm text-cf-text-muted">
					<Spinner className="size-4" />
					Checking backup configuration...
				</div>
			)}

			{isNotConfigured && (
				<div className="rounded-lg border border-cf-border bg-cf-bg-300 p-4">
					<div className="flex items-start gap-3">
						<div className="flex-1">
							<h3 className="font-sans text-sm font-medium text-cf-error">Backup is not configured</h3>
							<p className="mt-1 text-sm text-cf-text-muted">{configStatus.message}</p>
							{configStatus.missingConfig && (
								<div className="mt-3">
									<p className="text-xs font-medium text-cf-text">Missing configuration:</p>
									<ul className="mt-1 list-inside list-disc text-xs text-cf-text-muted">
										{configStatus.missingConfig.map((item) => (
											<li key={item}>
												<code
													className="
														rounded-sm bg-cf-bg-200 px-1 py-0.5 font-mono text-xs text-cf-text
													"
												>
													{item}
												</code>
											</li>
										))}
									</ul>
								</div>
							)}
							<details className="mt-3">
								<summary
									className="
										cursor-pointer text-xs font-medium text-cf-text
										hover:text-cf-text-muted
									"
								>
									Show wrangler.jsonc example
								</summary>
								<pre
									className="
										mt-2 overflow-x-auto rounded-sm bg-cf-bg-200 p-2 font-mono text-xs
										text-cf-text-muted
									"
								>
									{WRANGLER_CONFIG_EXAMPLE}
								</pre>
							</details>
						</div>
					</div>
				</div>
			)}

			<div className="flex flex-col gap-4">
				{/* Backup controls */}
				<div
					className="
						flex flex-col gap-2
						sm:flex-row
					"
				>
					<input
						type="text"
						value={directory}
						onChange={(event_) => setDirectory(event_.target.value)}
						placeholder="Directory to backup..."
						className="
							input-field flex-1
							placeholder:text-cf-text-subtle
						"
						disabled={isNotConfigured}
					/>
					<div className="flex gap-2">
						<button
							onClick={createBackup}
							disabled={loading || !directory.trim() || isNotConfigured}
							className="btn-base flex items-center gap-2 btn-primary"
						>
							{loading ? <Spinner className="size-4" /> : undefined}
							Create Backup
						</button>
						<button onClick={deleteAllFiles} disabled={deleting || isNotConfigured} className="btn-base flex items-center gap-2 btn-ghost">
							{deleting ? <Spinner className="size-4" /> : undefined}
							Delete All
						</button>
						<button
							onClick={restoreBackup}
							disabled={restoring || !backup || isNotConfigured}
							className="btn-base flex items-center gap-2 btn-ghost"
						>
							{restoring ? <Spinner className="size-4" /> : undefined}
							Restore
						</button>
					</div>
				</div>

				{/* Backup info */}
				{backup && (
					<div className="flex items-center gap-2">
						<Badge variant="success">Backup Ready</Badge>
						<span className="font-mono text-sm text-cf-text-muted">{backup.id}</span>
						<span className="text-xs text-cf-text-subtle">({backup.dir})</span>
					</div>
				)}

				{/* Output */}
				{(output.length > 0 || error) && (
					<Output className={loading || restoring ? 'opacity-50' : ''}>
						{output.map((line, index) => (
							<span key={index}>
								{line.includes('successfully') ? <Info>{line}</Info> : <Stdout>{line}</Stdout>}
								{'\n'}
							</span>
						))}
						{error && (
							<Stderr>
								{error.title}: {error.detail}
							</Stderr>
						)}
					</Output>
				)}

				{/* File tree */}
				{isReady && <FileTree refreshKey={refreshKey} className="max-h-[280px]" />}
			</div>

			<Callout>
				<span className="font-medium">createBackup()</span> snapshots a directory tree and returns a backup handle.{' '}
				<span className="font-medium">restoreBackup()</span> restores it in-place, overwriting any changes. This is ideal for implementing
				undo, safe experimentation, or resetting between test runs.
			</Callout>
		</section>
	);
}
