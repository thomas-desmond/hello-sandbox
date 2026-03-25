import { Code, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useCallback, type ReactNode } from 'react';

import { highlightCode } from '@/lib/highlight';

import { RevealCode } from './typewriter-code';

const COLLAPSE_EASE = [0.16, 0.77, 0.36, 0.98] as const;
const OVERLAY_EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Handles the full-code-block ↔ collapsed-strip transition used by
 * several feature-demo slides. When the strip is collapsed (step ≥ 2),
 * clicking it opens a temporary overlay showing the full code block so
 * the presenter can reference it without navigating back a step.
 */
export function CollapsibleCodeContext({
	step,
	code,
	label,
	summary,
	children,
}: {
	/** Current slide sub-step */
	step: number;
	/** Full source code to display */
	code: string;
	/** Badge label shown on both the code block and collapsed strip (e.g. "SDK") */
	label: string;
	/** One-line summary shown in the collapsed strip */
	summary: string;
	/** Extra content rendered above the code block at step 1 (e.g. flow diagram) */
	children?: ReactNode;
}) {
	// Track which step the overlay was opened on; overlay auto-closes when step changes
	const [expandedAtStep, setExpandedAtStep] = useState<number | undefined>();

	const close = useCallback(() => setExpandedAtStep(undefined), []);
	const open = useCallback(() => setExpandedAtStep(step), [step]);

	const isOverlayOpen = expandedAtStep === step && step >= 2;

	// Close on Escape
	useEffect(() => {
		if (!isOverlayOpen) return;
		function onKey(event_: KeyboardEvent) {
			if (event_.key === 'Escape') {
				event_.preventDefault();
				event_.stopPropagation();
				close();
			}
		}
		globalThis.addEventListener('keydown', onKey, { capture: true });
		return () => globalThis.removeEventListener('keydown', onKey, { capture: true });
	}, [isOverlayOpen, close]);

	return (
		<div className="relative">
			{/* ── Full code block — visible at step 1, fades out at step 2 ── */}
			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{
					opacity: step < 2 ? 1 : 0,
					y: step < 2 ? 0 : -8,
					height: step < 2 ? 'auto' : 0,
					overflow: 'hidden',
				}}
				transition={{ duration: 0.35, ease: COLLAPSE_EASE }}
			>
				{children}
				<RevealCode code={code} visible label={label} />
			</motion.div>

			{/* ── Collapsed strip — slides in once demo is active ── */}
			<motion.div
				initial={false}
				animate={{
					opacity: step >= 2 ? 1 : 0,
					height: step >= 2 ? 'auto' : 0,
					overflow: 'hidden',
				}}
				transition={{ duration: 0.35, ease: COLLAPSE_EASE }}
			>
				<button
					type="button"
					onClick={open}
					className="
						flex w-full cursor-pointer items-center gap-3 rounded-lg border
						border-cf-border bg-cf-bg-200 px-4 py-2.5 text-left transition-colors
						hover:border-cf-orange/50 hover:bg-cf-bg-300
					"
				>
					<Code className="size-4 shrink-0 text-cf-orange" strokeWidth={2} />
					<code className="truncate font-mono text-sm text-cf-text-muted" dangerouslySetInnerHTML={{ __html: highlightCode(summary) }} />
					<span
						className="
							ml-auto shrink-0 rounded-md bg-cf-bg-300 px-2 py-0.5 font-sans text-xs
							font-medium text-cf-text-subtle
						"
					>
						{label}
					</span>
				</button>
			</motion.div>

			{/* ── Overlay — full code shown temporarily on click ── */}
			<AnimatePresence>
				{isOverlayOpen && (
					<motion.div
						className="fixed inset-0 z-50 flex items-center justify-center"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
					>
						{/* Backdrop */}
						<div className="absolute inset-0 bg-cf-text/40 backdrop-blur-sm" onClick={close} />

						{/* Panel */}
						<motion.div
							className="
								relative z-10 mx-8 flex max-h-[80vh] max-w-[calc(100vw-4rem)] flex-col
								rounded-2xl border border-cf-border bg-cf-bg-100 p-5 shadow-xl
							"
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							transition={{ duration: 0.3, ease: OVERLAY_EASE }}
						>
							{/* Header */}
							<div className="mb-3 flex items-center justify-between">
								<span
									className="
										rounded-md bg-cf-bg-300 px-2.5 py-1 font-sans text-xs font-medium
										tracking-wider text-cf-text-subtle
									"
								>
									{label}
								</span>
								<button
									onClick={close}
									className="
										flex size-8 items-center justify-center rounded-full
										text-cf-text-subtle transition-colors
										hover:bg-cf-bg-300 hover:text-cf-text
									"
								>
									<X className="size-4" />
								</button>
							</div>

							{/* Code block */}
							<div
								className="
									min-h-0 overflow-auto rounded-lg border border-cf-border bg-cf-bg-200
									font-mono text-base/relaxed whitespace-pre text-cf-text
								"
							>
								<div className="px-5 pt-5 pb-4" dangerouslySetInnerHTML={{ __html: highlightCode(code) }} />
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
