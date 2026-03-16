import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

import { ProgressBar } from './components/progress-bar';
import { SectionModal } from './components/section-modal';
import { SLIDES } from './slides';
import { useSlideNav } from './use-slide-nav';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Slides mode orchestrator.
 * Navigation is keyboard-only + bottom controls. No click-to-advance.
 */
export function SlidesMode() {
	const { slideIndex, step, next, prev, goTo, exit, total } = useSlideNav(SLIDES);
	const [sectionModalOpen, setSectionModalOpen] = useState(false);

	const currentSlide = SLIDES[slideIndex];
	const SlideComponent = currentSlide.component;

	return (
		<div className="relative h-screen w-screen overflow-hidden">
			{/* Exit button */}
			<button
				onClick={exit}
				className="
					absolute top-4 right-4 z-50 flex size-9 items-center justify-center
					rounded-full border border-cf-border/50 bg-cf-bg-200/60 text-cf-text-subtle
					backdrop-blur-sm transition-colors
					hover:border-cf-orange hover:text-cf-text
				"
				title="Exit slides (Esc)"
			>
				<X className="size-4" />
			</button>

			{/* Slide content with transitions */}
			<AnimatePresence mode="wait">
				<motion.div
					key={currentSlide.id}
					initial={{ opacity: 0, x: 60 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: -60 }}
					transition={{ duration: 0.4, ease: EASE }}
					className="size-full"
				>
					<SlideComponent step={step} />
				</motion.div>
			</AnimatePresence>

			{/* Progress bar with nav controls */}
			<ProgressBar
				current={slideIndex}
				total={total}
				onNavigate={goTo}
				onPrev={prev}
				onNext={next}
				onSections={() => setSectionModalOpen(true)}
			/>

			{/* Section jump modal */}
			<SectionModal
				open={sectionModalOpen}
				slides={SLIDES}
				current={slideIndex}
				onSelect={goTo}
				onClose={() => setSectionModalOpen(false)}
			/>
		</div>
	);
}
