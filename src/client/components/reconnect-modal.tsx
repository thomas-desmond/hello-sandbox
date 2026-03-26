import { RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

import { resetSandboxId } from '../lib/use-sandbox-id';

const EASE = [0.16, 1, 0.3, 1] as const;

async function clearSessionAndReload(): Promise<void> {
	await fetch('/api/session', { method: 'DELETE' });
	resetSandboxId();
	globalThis.location.reload();
}

/**
 * Modal that lets the user reload the page with a new agent connection
 * when they suspect the sandbox is in a bad state.
 */
export function ReconnectModal({ open, sandboxId, onClose }: { open: boolean; sandboxId: string | undefined; onClose: () => void }) {
	const [loading, setLoading] = useState(false);

	// Close on Escape
	useEffect(() => {
		if (!open) return;
		function onKey(event_: KeyboardEvent) {
			if (event_.key === 'Escape') {
				event_.preventDefault();
				event_.stopPropagation();
				onClose();
			}
		}
		globalThis.addEventListener('keydown', onKey, { capture: true });
		return () => globalThis.removeEventListener('keydown', onKey, { capture: true });
	}, [open, onClose]);

	function handleReload() {
		setLoading(true);
		void clearSessionAndReload();
	}

	return (
		<AnimatePresence>
			{open && (
				<motion.div
					className="fixed inset-0 z-100 flex items-center justify-center"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
				>
					{/* Backdrop */}
					<div className="absolute inset-0 bg-cf-text/50 backdrop-blur-sm" onClick={onClose} />

					{/* Panel */}
					<motion.div
						className="
							relative z-10 mx-6 w-full max-w-sm overflow-hidden rounded-2xl border
							border-cf-border bg-cf-bg-100 shadow-xl
						"
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						transition={{ duration: 0.3, ease: EASE }}
					>
						{/* Header */}
						<div
							className="
								flex items-center justify-between border-b border-cf-border px-5 py-4
							"
						>
							<h3 className="text-sm font-semibold text-cf-text">Sandbox Connection</h3>
							<button
								onClick={onClose}
								className="
									flex size-7 items-center justify-center rounded-full
									text-cf-text-subtle transition-colors
									hover:bg-cf-bg-300 hover:text-cf-text
								"
							>
								<X className="size-3.5" />
							</button>
						</div>

						{/* Body */}
						<div className="space-y-4 p-5">
							<p className="text-sm text-cf-text-subtle">
								If you're experiencing connection issues, reload the page to establish a new agent connection. This will clear your current
								session and assign a fresh sandbox.
							</p>

							{sandboxId && (
								<div className="rounded-lg border border-cf-border bg-cf-bg-200 px-3 py-2">
									<p
										className="
											mb-0.5 font-mono text-[10px] tracking-wider text-cf-text-muted
											uppercase
										"
									>
										Current Session
									</p>
									<p className="truncate font-mono text-xs text-cf-text-subtle">{sandboxId}</p>
								</div>
							)}

							<div className="flex gap-2.5">
								<button
									onClick={onClose}
									className="
										flex-1 rounded-lg border border-cf-border bg-cf-bg-200 px-3 py-2
										text-sm font-medium text-cf-text-subtle transition-colors
										hover:border-cf-orange/50 hover:text-cf-text
									"
								>
									Cancel
								</button>
								<button
									onClick={handleReload}
									disabled={loading}
									className="
										flex flex-1 items-center justify-center gap-2 rounded-lg bg-cf-orange
										px-3 py-2 text-sm font-medium text-[#fff] transition-opacity
										hover:opacity-90
										disabled:cursor-not-allowed disabled:opacity-60
									"
								>
									<RefreshCw
										className={`
											size-3.5
											${loading ? 'animate-spin' : ''}
										`}
									/>
									{loading ? 'Reloading…' : 'Reload'}
								</button>
							</div>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
