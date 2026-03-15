import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
	return (
		<div
			className={`
				flex flex-col rounded-lg border border-cf-border bg-cf-bg-200 shadow-card
				${className}
			`}
		>
			{children}
		</div>
	);
}

export function CardHeader({ children, right }: { children: ReactNode; right?: ReactNode }) {
	return (
		<div
			className="
				flex items-center justify-between border-b border-cf-border-light px-4 py-3
				font-sans text-sm font-medium tracking-wider text-cf-text-subtle uppercase
			"
		>
			<span>{children}</span>
			{right && <span>{right}</span>}
		</div>
	);
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
	return (
		<div
			className={`
				flex-1 overflow-y-auto p-4
				${className}
			`}
		>
			{children}
		</div>
	);
}
