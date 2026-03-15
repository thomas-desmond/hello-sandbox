import type { ReactNode } from 'react';

export function Output({ children, className = '' }: { children: ReactNode; className?: string }) {
	return (
		<pre
			className={`
				max-h-[420px] min-h-[100px] overflow-y-auto rounded-md border
				border-surface-dark-border dark-surface bg-surface-dark p-4 font-mono
				text-[13px] leading-relaxed wrap-break-word whitespace-pre-wrap
				text-surface-dark-muted
				${className}
			`}
		>
			{children}
		</pre>
	);
}

export function Stdout({ children }: { children: ReactNode }) {
	return <span className="text-surface-dark-text">{children}</span>;
}

export function Stderr({ children }: { children: ReactNode }) {
	return <span className="text-surface-dark-error">{children}</span>;
}

export function Info({ children }: { children: ReactNode }) {
	return <span className="text-surface-dark-info">{children}</span>;
}

export function Dim({ children }: { children: ReactNode }) {
	return <span className="text-surface-dark-dim">{children}</span>;
}
