import type { ComponentType } from 'react';

export interface SlideDefinition {
	id: string;
	title: string;
	component: ComponentType<SlideProperties>;
	/** Total number of reveal steps in this slide (1 = no sub-steps) */
	steps: number;
}

export interface SlideProperties {
	/** Current reveal step within this slide (0-indexed, 0 = slide just entered) */
	step: number;
}
