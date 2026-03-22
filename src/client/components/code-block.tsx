import { highlightCode } from '@/lib/highlight';

export function CodeBlock({ code, label = 'SDK CODE', variant }: { code: string; label?: string; variant?: 'ai' }) {
	return (
		<div
			className={`
				relative rounded-lg border border-cf-border bg-cf-bg-200 font-mono
				text-sm/relaxed whitespace-pre text-cf-text
				${variant === 'ai' ? 'border-l-3 border-l-cf-ai' : ''}
			`}
		>
			<div
				className="
					absolute top-0 right-0 z-10 rounded-tr-lg rounded-bl-md border-b border-l
					border-cf-border bg-cf-bg-300 px-2 py-0.5 font-sans text-[9px] font-medium
					tracking-wider text-cf-text-subtle
				"
			>
				{label}
			</div>
			<div className="overflow-x-auto px-5 pt-5 pb-4" dangerouslySetInnerHTML={{ __html: highlightCode(code) }} />
		</div>
	);
}
