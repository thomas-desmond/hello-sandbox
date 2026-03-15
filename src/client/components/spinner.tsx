export function Spinner({ className = '' }: { className?: string }) {
	return (
		<span
			className={`
				inline-block size-4 animate-[spin_0.6s_linear_infinite] rounded-full
				border-2 border-cf-border border-t-cf-orange
				${className}
			`}
		/>
	);
}
