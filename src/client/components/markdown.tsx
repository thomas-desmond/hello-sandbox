import { useMemo } from 'react';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

const processor = remark().use(remarkHtml, { sanitize: true });

/** Renders a Markdown string as formatted HTML using remark.js. */
export function Markdown({ children, className }: { children: string; className?: string }) {
	const html = useMemo(() => String(processor.processSync(children)), [children]);

	return <div data-markdown="" className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
