import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProperties {
	children: ReactNode;
	/** Shown in the fallback UI to identify which section failed */
	label?: string;
	/** Optional custom fallback; receives the error and a reset callback */
	fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
	error: Error | undefined;
}

export class ErrorBoundary extends Component<ErrorBoundaryProperties, ErrorBoundaryState> {
	state: ErrorBoundaryState = { error: undefined };

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { error };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error(`[ErrorBoundary${this.props.label ? `: ${this.props.label}` : ''}]`, error, info.componentStack);
	}

	reset = () => {
		this.setState({ error: undefined });
	};

	render() {
		const { error } = this.state;
		if (!error) return this.props.children;
		if (this.props.fallback) return this.props.fallback(error, this.reset);
		return <ErrorFallback error={error} label={this.props.label} onReset={this.reset} />;
	}
}

function ErrorFallback({ error, label, onReset }: { error: Error; label?: string; onReset: () => void }) {
	return (
		<div
			className="
				flex flex-col items-center justify-center gap-4 rounded-lg border
				border-cf-error/20 bg-[oklch(from_#dc2626_l_c_h/4%)] px-8 py-12 text-center
			"
		>
			<div
				className="
					flex size-10 items-center justify-center rounded-full bg-cf-error/10
					text-lg text-cf-error
				"
			>
				!
			</div>
			<div className="space-y-1">
				<p className="text-sm font-medium text-cf-text">{label ? `${label} crashed` : 'Something went wrong'}</p>
				<p className="max-w-md font-mono text-xs text-cf-text-muted">{error.message}</p>
			</div>
			<button
				type="button"
				onClick={onReset}
				className="
					cursor-pointer rounded-md border border-cf-border bg-cf-bg-200 px-4 py-1.5
					text-xs font-medium text-cf-text transition-colors
					hover:bg-cf-bg-300
				"
			>
				Try again
			</button>
		</div>
	);
}
