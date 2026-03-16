import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect } from 'react';

import type { SlideDefinition } from '../types';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Overlay modal that shows all slide sections in a grid.
 * Clicking a section jumps to that slide and closes the modal.
 */
export function SectionModal({
	open,
	slides,
	current,
	onSelect,
	onClose,
}: {
	open: boolean;
	slides: SlideDefinition[];
	current: number;
	onSelect: (index: number) => void;
	onClose: () => void;
}) {
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
							relative z-10 mx-6 max-h-[80vh] w-full max-w-3xl overflow-y-auto
							rounded-2xl border border-cf-border bg-cf-bg-100 p-6 shadow-xl
						"
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						transition={{ duration: 0.3, ease: EASE }}
					>
						{/* Header */}
						<div className="mb-5 flex items-center justify-between">
							<h3 className="text-lg font-semibold text-cf-text">Jump to Section</h3>
							<button
								onClick={onClose}
								className="
									flex size-8 items-center justify-center rounded-full
									text-cf-text-subtle transition-colors
									hover:bg-cf-bg-300 hover:text-cf-text
								"
							>
								<X className="size-4" />
							</button>
						</div>

						{/* Grid */}
						<div className="grid grid-cols-3 gap-3">
							{slides.map((slide, index) => {
								const isCurrent = index === current;
								return (
									<button
										key={slide.id}
										onClick={() => {
											onSelect(index);
											onClose();
										}}
										className={`
											flex flex-col gap-1 rounded-xl border-2 px-4 py-3.5 text-left
											transition-all
											${
												isCurrent
													? 'border-cf-orange bg-cf-orange/5'
													: `
														border-cf-border bg-cf-bg-200
														hover:border-cf-orange/50 hover:bg-cf-bg-300
													`
											}
										`}
									>
										<span className="font-mono text-xs text-cf-text-subtle">{String(index + 1).padStart(2, '0')}</span>
										<span
											className={`
												text-base font-medium
												${isCurrent ? 'text-cf-orange' : 'text-cf-text'}
											`}
										>
											{slide.title}
										</span>
									</button>
								);
							})}
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
