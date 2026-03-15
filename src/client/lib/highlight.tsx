import { highlight } from 'sugar-high';

/** Returns an HTML string styled via --sh-* CSS custom properties. */
export function highlightCode(code: string): string {
	return highlight(code);
}
