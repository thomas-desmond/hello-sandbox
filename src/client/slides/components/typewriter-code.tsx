import { highlightCode } from '@/lib/highlight';

import { Reveal } from './reveal';

/**
 * A code block gated by `visible`, animated via Reveal.
 */
export function RevealCode({ code, visible, label, variant }: { code: string; visible: boolean; label?: string; variant?: 'ai' }) {
	return (
		<Reveal visible={visible} direction="up" scale={0.98}>
			<div
				className={`
					relative overflow-x-auto rounded-lg border border-cf-border bg-cf-bg-200
					font-mono text-base/relaxed whitespace-pre text-cf-text
					${variant === 'ai' ? 'border-l-3 border-l-cf-ai' : ''}
				`}
			>
				{label && (
					<div
						className="
							absolute top-0 right-0 rounded-tr-lg rounded-bl-md border-b border-l
							border-cf-border bg-cf-bg-300 px-3 py-1 font-sans text-[10px] font-medium
							tracking-wider text-cf-text-subtle
						"
					>
						{label}
					</div>
				)}
				<div className="px-5 pt-5 pb-4" dangerouslySetInnerHTML={{ __html: highlightCode(code) }} />
			</div>
		</Reveal>
	);
}
