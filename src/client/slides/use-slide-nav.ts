import { useState, useEffect, useCallback, useRef } from 'react';

import type { SlideDefinition } from './types';

interface SlideNavState {
	/** Current slide index (0-based) */
	slideIndex: number;
	/** Current step within the slide (0-based) */
	step: number;
	/** Navigate forward one step (or to next slide if at last step) */
	next: () => void;
	/** Navigate backward one step (or to previous slide last step) */
	prev: () => void;
	/** Jump to a specific slide */
	goTo: (index: number) => void;
	/** Exit slides mode */
	exit: () => void;
	/** Total slide count */
	total: number;
}

function getInitialSlide(): number {
	const parameters = new URLSearchParams(globalThis.location.search);
	const s = parameters.get('slide');
	if (s) {
		const n = Number.parseInt(s, 10);
		if (Number.isFinite(n) && n >= 1) return n - 1; // URL is 1-indexed
	}
	return 0;
}

function updateUrl(slideIndex: number) {
	const url = new URL(globalThis.location.href);
	url.searchParams.set('mode', 'slides');
	url.searchParams.set('slide', String(slideIndex + 1));
	globalThis.history.replaceState(undefined, '', url.toString());
}

export function useSlideNav(slides: SlideDefinition[]): SlideNavState {
	const [slideIndex, setSlideIndex] = useState(() => {
		const initial = getInitialSlide();
		return Math.min(initial, slides.length - 1);
	});
	const [step, setStep] = useState(0);

	// Keep refs current for the keyboard handler
	const stateReference = useRef({ slideIndex, step });
	useEffect(() => {
		stateReference.current = { slideIndex, step };
	});

	const next = useCallback(() => {
		const { slideIndex: si, step: st } = stateReference.current;
		const max = slides[si]?.steps ?? 1;
		if (st < max - 1) {
			setStep(st + 1);
		} else if (si < slides.length - 1) {
			const nextIndex = si + 1;
			setSlideIndex(nextIndex);
			setStep(0);
			updateUrl(nextIndex);
		}
	}, [slides]);

	const previous = useCallback(() => {
		const { slideIndex: si } = stateReference.current;
		if (si > 0) {
			const previousIndex = si - 1;
			setSlideIndex(previousIndex);
			setStep(0);
			updateUrl(previousIndex);
		}
	}, []);

	const goTo = useCallback(
		(index: number) => {
			const clamped = Math.max(0, Math.min(index, slides.length - 1));
			setSlideIndex(clamped);
			setStep(0);
			updateUrl(clamped);
		},
		[slides.length],
	);

	const exit = useCallback(() => {
		const url = new URL(globalThis.location.href);
		url.searchParams.delete('mode');
		url.searchParams.delete('slide');
		globalThis.history.replaceState(undefined, '', url.toString());
		// Force re-render of App by dispatching a popstate
		globalThis.dispatchEvent(new PopStateEvent('popstate'));
	}, []);

	// Keyboard navigation
	useEffect(() => {
		function onKey(event_: KeyboardEvent) {
			// Don't capture when typing in an input/textarea
			const target = event_.target;
			if (target instanceof HTMLElement) {
				const tag = target.tagName;
				if (tag === 'INPUT' || tag === 'TEXTAREA') return;
			}

			switch (event_.key) {
				case 'ArrowRight':
				case ' ': {
					event_.preventDefault();
					next();
					break;
				}
				case 'ArrowLeft': {
					event_.preventDefault();
					previous();
					break;
				}
				case 'Escape': {
					event_.preventDefault();
					exit();
					break;
				}
			}
		}
		globalThis.addEventListener('keydown', onKey);
		return () => globalThis.removeEventListener('keydown', onKey);
	}, [next, previous, exit]);

	// Sync URL on mount
	useEffect(() => {
		updateUrl(slideIndex);
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return {
		slideIndex,
		step,
		next,
		prev: previous,
		goTo,
		exit,
		total: slides.length,
	};
}
