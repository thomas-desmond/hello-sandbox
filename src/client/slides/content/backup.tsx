import { Camera, Trash2, RotateCcw, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

import { FileTree } from '@/components/file-tree';
import { Output, Stdout, Stderr, Info, Dim } from '@/components/output';
import { Spinner } from '@/components/spinner';
import { api } from '@/lib/api';

import { Reveal } from '../components/reveal';
import { SlideLayout } from '../components/slide-layout';
import { SlideTitle } from '../components/slide-title';

import type { SlideProperties } from '../types';

interface BackupInfo {
	id: string;
	dir: string;
}

interface BackupStatus {
	available: boolean;
	message: string;
}

const WORKFLOW_STEPS = [
	{ icon: Camera, label: 'Snapshot', desc: 'Create backup', color: 'text-cf-success' },
	{ icon: Trash2, label: 'Destroy', desc: 'Delete everything', color: 'text-cf-error' },
	{ icon: RotateCcw, label: 'Restore', desc: 'Bring it all back', color: 'text-cf-info' },
];

/**
 * Slide 11: Backup & Restore
 * Steps: 0=title+subtitle, 1=workflow visual, 2=live demo
 */
export function BackupSlide({ step }: SlideProperties) {
	const [configStatus, setConfigStatus] = useState<BackupStatus | undefined>();
	const [backup, setBackup] = useState<BackupInfo | undefined>();
	const [lines, setLines] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | undefined>();
	const [activeStep, setActiveStep] = useState(-1);
	const [refreshKey, setRefreshKey] = useState(0);

	useEffect(() => {
		api<BackupStatus>('/api/backup/status')
			.then(setConfigStatus)
			.catch(() => setConfigStatus({ available: false, message: 'Unable to check config' }));
	}, []);

	async function createBackup() {
		setLoading(true);
		setError(undefined);
		setActiveStep(0);
		try {
			const data = await api<{ backup: BackupInfo }>('/api/backup/create', { dir: '/workspace' });
			setBackup(data.backup);
			setLines((p) => [...p, `$ sandbox.createBackup({ dir: "/workspace" })`, `Backup created: ${data.backup.id}`]);
			setRefreshKey((k) => k + 1);
		} catch (error_) {
			setError(error_ instanceof Error ? error_.message : 'Failed');
		} finally {
			setLoading(false);
		}
	}

	async function deleteAll() {
		setLoading(true);
		setActiveStep(1);
		try {
			await api<{ stdout: string }>('/api/exec', { command: "rm -rf /workspace/* /workspace/.* 2>/dev/null; echo 'All files deleted'" });
			setLines((p) => [...p, '', '$ rm -rf /workspace/*', 'All files deleted from /workspace']);
			setRefreshKey((k) => k + 1);
		} catch (error_) {
			setError(error_ instanceof Error ? error_.message : 'Failed');
		} finally {
			setLoading(false);
		}
	}

	async function restore() {
		if (!backup) return;
		setLoading(true);
		setActiveStep(2);
		try {
			await api<{ success: boolean }>('/api/backup/restore', { backup });
			setLines((p) => [...p, '', '$ sandbox.restoreBackup(backup)', 'Backup restored successfully!']);
			setRefreshKey((k) => k + 1);
		} catch (error_) {
			setError(error_ instanceof Error ? error_.message : 'Failed');
		} finally {
			setLoading(false);
		}
	}

	const isAvailable = configStatus?.available;

	return (
		<SlideLayout>
			<SlideTitle number="09" title="Backup & Restore" subtitle="Create filesystem snapshots. Restore instantly." step={step} />

			<div className="mt-6 flex min-h-0 flex-1 flex-col gap-5">
				{step >= 1 && (
					<div className="flex items-center justify-center gap-6">
						{WORKFLOW_STEPS.map((ws, index) => {
							const Icon = ws.icon;
							const done = activeStep > index;
							const active = activeStep === index && loading;
							return (
								<div key={ws.label} className="flex items-center gap-6">
									{index > 0 && (
										<Reveal visible direction="none" index={index}>
											<span className="text-3xl text-cf-text-subtle">&rarr;</span>
										</Reveal>
									)}
									<Reveal visible direction="up" index={index}>
										<div
											className={`
												flex flex-col items-center gap-2 rounded-xl border-2 px-8 py-5
												${done ? 'border-cf-success/50 bg-cf-success/5' : active ? 'border-cf-orange bg-cf-orange/5' : 'border-cf-border bg-cf-bg-200'}
											`}
										>
											{done ? (
												<Check className="size-8 text-cf-success" strokeWidth={2} />
											) : active ? (
												<Spinner className="size-8" />
											) : (
												<Icon
													className={`
														size-8
														${ws.color}
													`}
													strokeWidth={1.5}
												/>
											)}
											<div className="text-base font-semibold text-cf-text">{ws.label}</div>
											<div className="text-base text-cf-text-muted">{ws.desc}</div>
										</div>
									</Reveal>
								</div>
							);
						})}
					</div>
				)}

				{step >= 2 && (
					<Reveal visible={step >= 2} className="flex min-h-0 flex-1 flex-col">
						{!isAvailable && configStatus ? (
							<div
								className="
									rounded-lg border border-cf-border bg-cf-bg-200 px-5 py-4 text-base
									text-cf-text-muted
								"
							>
								Backup requires an R2 bucket binding. The concept: <code className="text-cf-orange">createBackup()</code> snapshots a
								directory, <code className="text-cf-orange">restoreBackup()</code> restores it in-place.
							</div>
						) : (
							<div className="flex min-h-0 flex-1 flex-col gap-4">
								<div className="flex gap-3">
									<button onClick={createBackup} disabled={loading || !!backup} className="btn-base btn-primary text-base">
										{loading && activeStep === 0 ? 'Creating...' : backup ? 'Backup Created' : 'Create Backup'}
									</button>
									<button onClick={deleteAll} disabled={loading || !backup || activeStep >= 1} className="btn-base btn-ghost text-base">
										{loading && activeStep === 1 ? 'Deleting...' : 'Delete All Files'}
									</button>
									<button onClick={restore} disabled={loading || !backup || activeStep < 1} className="btn-base btn-primary text-base">
										{loading && activeStep === 2 ? 'Restoring...' : 'Restore'}
									</button>
								</div>
								<div className="flex min-h-0 flex-1 gap-4">
									<FileTree refreshKey={refreshKey} compact className="w-64 shrink-0" />
									<Output className="min-h-0 flex-1 text-base/relaxed">
										{loading && lines.length === 0 && <Dim>Running...</Dim>}
										{lines.map((line, index) => (
											<span key={index}>
												{line.startsWith('$') ? (
													<span className="text-surface-dark-success">{line}</span>
												) : line.includes('successfully') || line.includes('restored') ? (
													<Info>{line}</Info>
												) : (
													<Stdout>{line}</Stdout>
												)}
												{'\n'}
											</span>
										))}
										{error && <Stderr>{error}</Stderr>}
										{!loading && lines.length === 0 && !error && <Dim>Create a backup, delete files, then restore</Dim>}
									</Output>
								</div>
							</div>
						)}
					</Reveal>
				)}
			</div>
		</SlideLayout>
	);
}

BackupSlide.steps = 3;
