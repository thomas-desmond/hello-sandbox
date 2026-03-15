import { useState } from 'react';

import { Badge } from '@/components/badge';
import { Callout } from '@/components/callout';
import { CodeBlock } from '@/components/code-block';
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

interface ListResult {
	files: Array<{ name: string; type: string }>;
	count: number;
	path: string;
}

const SDK_CODE = `const backup = await sandbox.createBackup({
  dir: '/workspace',
  name: 'pre-deploy-checkpoint',
});
// backup: { id: 'abc-123', dir: '/workspace' }
await sandbox.restoreBackup(backup);`;

export function BackupPanel() {
	const [directory, setDirectory] = useState('/workspace');
	const [backup, setBackup] = useState<BackupInfo | undefined>();
	const [loading, setLoading] = useState(false);
	const [restoring, setRestoring] = useState(false);
	const [output, setOutput] = useState<string[]>([]);
	const [error, setError] = useState<string | undefined>();
	const [verifyOutput, setVerifyOutput] = useState<string | undefined>();
	const [verifyLoading, setVerifyLoading] = useState(false);

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
		} catch (error_) {
			setError(error_ instanceof Error ? error_.message : 'Failed to create backup');
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
		} catch (error_) {
			setError(error_ instanceof Error ? error_.message : 'Failed to restore backup');
		} finally {
			setRestoring(false);
		}
	}

	async function deleteAllFiles() {
		setVerifyLoading(true);
		try {
			const data = await api<ExecResult>('/api/exec', {
				command: "rm -rf /workspace/* /workspace/.* 2>/dev/null; echo 'All files deleted'",
			});
			setVerifyOutput(data.stdout || 'Files deleted');
		} catch (error_) {
			setVerifyOutput(`Error: ${error_ instanceof Error ? error_.message : 'Delete failed'}`);
		} finally {
			setVerifyLoading(false);
		}
	}

	async function listWorkspace() {
		setVerifyLoading(true);
		try {
			const data = await api<ListResult>('/api/files/list', {
				path: '/workspace',
			});
			if (data.files.length === 0) {
				setVerifyOutput('/workspace is empty (0 files)');
			} else {
				const listing = data.files.map((f) => `  ${f.type === 'directory' ? '📁' : '📄'} ${f.name}`).join('\n');
				setVerifyOutput(`/workspace contains ${data.count} item(s):\n${listing}`);
			}
		} catch (error_) {
			setVerifyOutput(`Error: ${error_ instanceof Error ? error_.message : 'List failed'}`);
		} finally {
			setVerifyLoading(false);
		}
	}

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
					/>
					<div className="flex gap-2">
						<button onClick={createBackup} disabled={loading || !directory.trim()} className="btn-base flex items-center gap-2 btn-primary">
							{loading ? <Spinner className="size-4" /> : undefined}
							Create Backup
						</button>
						<button onClick={restoreBackup} disabled={restoring || !backup} className="btn-base flex items-center gap-2 btn-ghost">
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
						{error && <Stderr>{error}</Stderr>}
					</Output>
				)}

				{/* Demo workflow */}
				<div
					className="
						rounded-lg border border-dashed border-cf-border bg-cf-bg-200 p-4
					"
				>
					<h3 className="mb-3 font-sans text-sm font-medium text-cf-text">Demo Workflow</h3>
					<p className="mb-3 text-sm text-cf-text-muted">
						Create a backup, delete all files, verify they are gone, then restore the backup to bring them back.
					</p>
					<div className="flex flex-wrap gap-2">
						<button onClick={deleteAllFiles} disabled={verifyLoading} className="btn-preset">
							Delete all files
						</button>
						<button onClick={listWorkspace} disabled={verifyLoading} className="btn-preset">
							List /workspace
						</button>
					</div>
					{verifyLoading && (
						<div className="mt-3 flex items-center gap-2 text-xs text-cf-text-subtle">
							<Spinner />
							Running...
						</div>
					)}
					{verifyOutput && (
						<Output
							className={`
								mt-3 min-h-[60px]
								${verifyLoading ? 'opacity-50' : ''}
							`}
						>
							<Stdout>{verifyOutput}</Stdout>
						</Output>
					)}
				</div>
			</div>

			<Callout>
				<span className="font-medium">createBackup()</span> snapshots a directory tree and returns a backup handle.{' '}
				<span className="font-medium">restoreBackup()</span> restores it in-place, overwriting any changes. This is ideal for implementing
				undo, safe experimentation, or resetting between test runs.
			</Callout>
		</section>
	);
}
