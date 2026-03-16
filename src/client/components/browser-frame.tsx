import type { ReactNode } from 'react';

/**
 * A stylistic browser window wrapper for iframes and preview content.
 * Shows traffic lights, a URL bar, and wraps children in a bordered container with drop shadow.
 */
export function BrowserFrame({
	url,
	children,
	className = '',
	onOpenExternal,
}: {
	url?: string;
	children: ReactNode;
	className?: string;
	/** If provided, the external-link icon in the toolbar calls this instead of using an anchor */
	onOpenExternal?: () => void;
}) {
	return (
		<div
			className="
				flex flex-col overflow-hidden rounded-xl border border-cf-border shadow-lg
				shadow-cf-text/5
			"
		>
			{/* Toolbar */}
			<div
				className="
					flex items-center gap-3 border-b border-cf-border bg-cf-bg-200 px-4 py-2
				"
			>
				<div className="flex gap-1.5">
					<span className="size-2.5 rounded-full bg-cf-border" />
					<span className="size-2.5 rounded-full bg-cf-border" />
					<span className="size-2.5 rounded-full bg-cf-border" />
				</div>
				{/* URL bar */}
				{url && (
					<div
						className="
							flex-1 truncate rounded-md bg-cf-bg-100 px-3 py-1 text-center font-mono
							text-xs text-cf-text-subtle
						"
					>
						{url}
					</div>
				)}
				{/* Open external */}
				{url &&
					(onOpenExternal ? (
						<button
							onClick={onOpenExternal}
							className="
								text-xs text-cf-text-subtle transition-colors
								hover:text-cf-orange
							"
						>
							&#x2197;
						</button>
					) : (
						<a
							href={url}
							target="_blank"
							rel="noopener noreferrer"
							className="
								text-xs text-cf-text-subtle transition-colors
								hover:text-cf-orange
							"
						>
							&#x2197;
						</a>
					))}
			</div>
			{/* Content */}
			<div className={className}>{children}</div>
		</div>
	);
}
