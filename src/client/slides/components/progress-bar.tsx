import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { motion } from 'motion/react';

/**
 * Thin progress bar at the bottom of the viewport with prev/next nav buttons
 * and a section-jump button.
 */
export function ProgressBar({
	current,
	total,
	onNavigate,
	onPrev,
	onNext,
	onSections,
}: {
	current: number;
	total: number;
	onNavigate: (index: number) => void;
	onPrev: () => void;
	onNext: () => void;
	onSections: () => void;
}) {
	const progress = (current + 1) / total;

	return (
		<div
			className="
				fixed inset-x-0 bottom-0 z-50 flex h-10 items-center gap-1.5 bg-cf-bg-200/80
				px-3 backdrop-blur-sm
			"
			onClick={(event_) => event_.stopPropagation()}
		>
			{/* Prev */}
			<button
				onClick={(event_) => {
					event_.stopPropagation();
					onPrev();
				}}
				className="
					flex size-7 shrink-0 items-center justify-center rounded-md
					text-cf-text-subtle transition-colors
					hover:bg-cf-bg-300 hover:text-cf-text
				"
				title="Previous (←)"
			>
				<ChevronLeft className="size-4" />
			</button>

			{/* Sections */}
			<button
				onClick={(event_) => {
					event_.stopPropagation();
					onSections();
				}}
				className="
					flex size-7 shrink-0 items-center justify-center rounded-md
					text-cf-text-subtle transition-colors
					hover:bg-cf-bg-300 hover:text-cf-text
				"
				title="Jump to section"
			>
				<LayoutGrid className="size-3.5" />
			</button>

			{/* Clickable track */}
			<button
				className="
					relative mx-1 h-1.5 flex-1 cursor-pointer rounded-full bg-cf-border/40
				"
				onClick={(event_) => {
					event_.stopPropagation();
					const rect = event_.currentTarget.getBoundingClientRect();
					const ratio = (event_.clientX - rect.left) / rect.width;
					const index = Math.floor(ratio * total);
					onNavigate(index);
				}}
			>
				<motion.div
					className="absolute inset-y-0 left-0 rounded-full bg-cf-orange"
					animate={{ width: `${progress * 100}%` }}
					transition={{ type: 'spring', stiffness: 300, damping: 30 }}
				/>
			</button>

			{/* Slide counter */}
			<span className="mx-1 font-mono text-xs text-cf-text-subtle tabular-nums">
				{current + 1}/{total}
			</span>

			{/* Next */}
			<button
				onClick={(event_) => {
					event_.stopPropagation();
					onNext();
				}}
				className="
					flex size-7 shrink-0 items-center justify-center rounded-md
					text-cf-text-subtle transition-colors
					hover:bg-cf-bg-300 hover:text-cf-text
				"
				title="Next (→)"
			>
				<ChevronRight className="size-4" />
			</button>
		</div>
	);
}
