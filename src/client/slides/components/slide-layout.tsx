import type { ReactNode } from 'react';

/**
 * Fullscreen slide container. Consistent padding, dot-pattern bg.
 * No layout animation -- children handle their own entrance animations.
 */
export function SlideLayout({ children, className = '', variant }: { children: ReactNode; className?: string; variant?: 'dark' }) {
	return (
		<div
			className={`
				relative flex h-screen w-screen flex-col overflow-hidden
				${variant === 'dark' ? 'bg-surface-dark' : 'bg-cf-bg-100'}
				${className}
			`}
		>
			<div className="pointer-events-none absolute inset-0 dot-pattern opacity-30" />
			<div
				className="
					relative z-10 flex flex-1 flex-col overflow-hidden px-16 py-12 pb-20
				"
			>
				{children}
			</div>
		</div>
	);
}
