import { FolderOpen, FileText, FolderUp, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useCallback, useRef } from 'react';

import { api } from '@/lib/api';

interface FileEntry {
	name: string;
	type: string;
}

/**
 * A live file browser that fetches directory listings from /api/files/list.
 * Supports navigating directories, a refresh button, and an optional onSelect callback.
 * Auto-refreshes on `refreshKey` changes (e.g. increment it after a trigger fires).
 */
export function FileTree({
	initialPath = '/workspace',
	refreshKey,
	className = '',
	compact,
}: {
	initialPath?: string;
	/** Change this value to trigger a refresh of the current directory */
	refreshKey?: number;
	className?: string;
	/** Use smaller text and tighter spacing */
	compact?: boolean;
}) {
	const [cwd, setCwd] = useState(initialPath);
	const [files, setFiles] = useState<FileEntry[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | undefined>();
	const hasFetched = useRef(false);

	const fetchFiles = useCallback(async (path: string) => {
		setLoading(true);
		setError(undefined);
		try {
			const data = await api<{ files: FileEntry[]; count: number }>('/api/files/list', { path });
			setFiles(data.files);
			setCwd(path);
		} catch (error_) {
			setError(error_ instanceof Error ? error_.message : 'Failed to list files');
		} finally {
			setLoading(false);
		}
	}, []);

	// Initial fetch
	useEffect(() => {
		if (!hasFetched.current) {
			hasFetched.current = true;
			void fetchFiles(initialPath);
		}
	}, [initialPath, fetchFiles]);

	// Refresh when refreshKey changes
	useEffect(() => {
		if (refreshKey !== undefined && hasFetched.current) {
			void fetchFiles(cwd);
		}
	}, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

	const parentDirectory = cwd === '/' ? undefined : cwd.split('/').slice(0, -1).join('/') || '/';

	const textSize = compact ? 'text-xs' : 'text-sm';
	const iconSize = compact ? 'size-3.5' : 'size-4';
	const py = compact ? 'py-1' : 'py-1.5';

	return (
		<div
			className={`
				flex flex-col overflow-hidden rounded-xl border border-cf-border
				bg-cf-bg-200
				${className}
			`}
		>
			<div
				className="
					flex items-center justify-between border-b border-cf-border-light px-3
					py-1.5
				"
			>
				<span
					className="
						text-[10px] font-medium tracking-wider text-cf-text-subtle uppercase
					"
				>
					Files
				</span>
				<div className="flex items-center gap-1.5">
					<span
						className={`
							truncate font-mono
							${compact ? 'text-[10px]' : 'text-xs'}
							text-cf-text-subtle
						`}
					>
						{cwd}
					</span>
					<button
						onClick={() => void fetchFiles(cwd)}
						disabled={loading}
						className="
							flex size-5 items-center justify-center rounded-sm text-cf-text-subtle
							transition-colors
							hover:bg-cf-bg-300 hover:text-cf-text
						"
						title="Refresh"
					>
						<RefreshCw
							className={`
								size-3
								${loading ? 'animate-spin' : ''}
							`}
						/>
					</button>
				</div>
			</div>
			<div className="flex-1 overflow-y-auto p-1.5">
				{loading && files.length === 0 && (
					<div
						className={`
							p-2
							${textSize}
							text-cf-text-subtle
						`}
					>
						Loading...
					</div>
				)}
				{error && (
					<div
						className={`
							p-2
							${textSize}
							text-cf-error
						`}
					>
						{error}
					</div>
				)}
				{!loading && !error && (
					<div className="flex flex-col gap-0.5">
						{parentDirectory && (
							<button
								onClick={() => void fetchFiles(parentDirectory)}
								className={`
									flex items-center gap-2 rounded-md px-2
									${py}
									text-left
									${textSize}
									text-cf-text-muted transition-colors
									hover:bg-cf-bg-300
								`}
							>
								<FolderUp
									className={`
										${iconSize}
										text-cf-text-subtle
									`}
									strokeWidth={1.75}
								/>
								..
							</button>
						)}
						<AnimatePresence initial={false}>
							{files.map((f) => {
								const isDirectory = f.type === 'directory';
								const fullPath = `${cwd === '/' ? '' : cwd}/${f.name}`;
								return (
									<motion.button
										key={f.name}
										initial={{ opacity: 0, x: -8 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.15 }}
										onClick={() => isDirectory && void fetchFiles(fullPath)}
										className={`
											flex items-center gap-2 rounded-md px-2
											${py}
											text-left
											${textSize}
											transition-colors
											${
												isDirectory
													? `
														cursor-pointer
														hover:bg-cf-bg-300
													`
													: 'cursor-default'
											}
											text-cf-text
										`}
									>
										{isDirectory ? (
											<FolderOpen
												className={`
													${iconSize}
													text-cf-orange
												`}
												strokeWidth={1.75}
											/>
										) : (
											<FileText
												className={`
													${iconSize}
													text-cf-text-muted
												`}
												strokeWidth={1.75}
											/>
										)}
										<span className="truncate font-mono">{f.name}</span>
									</motion.button>
								);
							})}
						</AnimatePresence>
						{files.length === 0 && (
							<div
								className={`
									px-2 py-1
									${textSize}
									text-cf-text-subtle
								`}
							>
								Empty directory
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
