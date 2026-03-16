import { motion, AnimatePresence } from 'motion/react';

import type { ReactNode } from 'react';

/**
 * Universal step-reveal wrapper for slide content.
 *
 * - Hidden when `visible` is false (unmounted from DOM).
 * - On mount: fades + slides + scales in via AnimatePresence.
 * - On unmount (visible→false): instantly removed (no exit animation).
 * - Supports directional slide, scale, and stagger delay via `index`.
 */
export function Reveal({
	visible,
	children,
	className = '',
	direction = 'up',
	delay = 0,
	/** Stagger index -- each increment adds 0.07s delay */
	index = 0,
	/** Scale from this value on entrance (default 0.96) */
	scale = 0.96,
}: {
	visible: boolean;
	children: ReactNode;
	className?: string;
	direction?: 'up' | 'down' | 'left' | 'right' | 'none';
	delay?: number;
	index?: number;
	scale?: number;
}) {
	const offsets = {
		up: { x: 0, y: 24 },
		down: { x: 0, y: -24 },
		left: { x: 36, y: 0 },
		right: { x: -36, y: 0 },
		none: { x: 0, y: 0 },
	};

	const totalDelay = delay + index * 0.07;

	return (
		<AnimatePresence initial>
			{visible && (
				<motion.div
					key="reveal"
					className={className}
					initial={{ opacity: 0, scale, ...offsets[direction] }}
					animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
					exit={{ opacity: 0, transition: { duration: 0 } }}
					transition={{
						duration: 0.5,
						ease: [0.16, 0.77, 0.36, 0.98],
						delay: totalDelay,
					}}
				>
					{children}
				</motion.div>
			)}
		</AnimatePresence>
	);
}
