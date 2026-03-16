import { motion, AnimatePresence } from 'motion/react';

import { Badge } from '@/components/badge';
import { Output, Stdout, Stderr, Dim } from '@/components/output';

import { Reveal } from './reveal';

import type { ReactNode } from 'react';

const EASE = [0.16, 1, 0.3, 1] as const;

function TerminalCursor() {
	return (
		<motion.span
			className="
				inline-block h-3.5 w-[7px] translate-y-px rounded-[1px] bg-cf-orange
			"
			animate={{ opacity: [1, 0.15, 1] }}
			transition={{ duration: 0.9, repeat: Infinity, ease: 'linear', times: [0, 0.5, 1] }}
		/>
	);
}

function RunningIndicator({ command }: { command: string }) {
	return (
		<Dim>
			<span className="flex items-center gap-0">
				<span className="text-surface-dark-success">$ </span>
				<motion.span
					initial={{ width: 0 }}
					animate={{ width: 'auto' }}
					transition={{ duration: 0.4, ease: EASE }}
					className="inline-block overflow-hidden whitespace-nowrap"
				>
					{command || 'running'}
				</motion.span>
				<TerminalCursor />
			</span>
		</Dim>
	);
}

/**
 * A live-demo area for slides. Animated via Reveal on first appearance.
 */
export function DemoStrip({
	visible,
	presets,
	onPreset,
	customInput,
	onCustomSubmit,
	actionLabel,
	onAction,
	actionDisabled,
	loading,
	lastCommand,
	output,
	error,
	exitCode,
	duration,
	success,
	children,
}: {
	visible: boolean;
	presets?: string[];
	onPreset?: (preset: string) => void;
	customInput?: { value: string; onChange: (v: string) => void; placeholder?: string };
	onCustomSubmit?: () => void;
	actionLabel?: string;
	onAction?: () => void;
	actionDisabled?: boolean;
	loading?: boolean;
	lastCommand?: string;
	output?: string;
	error?: string;
	exitCode?: number;
	duration?: number;
	success?: boolean;
	children?: ReactNode;
}) {
	return (
		<Reveal visible={visible} direction="up">
			<div className="flex flex-col gap-3">
				{customInput && (
					<div className="flex gap-2">
						<input
							type="text"
							value={customInput.value}
							onChange={(event_) => customInput.onChange(event_.target.value)}
							onKeyDown={(event_) => {
								if (event_.key === 'Enter') onCustomSubmit?.();
							}}
							placeholder={customInput.placeholder ?? 'Enter a command...'}
							className="input-field flex-1 text-base"
						/>
						{actionLabel ? (
							<button onClick={onAction} disabled={actionDisabled || loading} className="btn-base btn-primary text-base">
								{loading ? 'Running...' : actionLabel}
							</button>
						) : (
							<button onClick={onCustomSubmit} disabled={loading || !customInput.value.trim()} className="btn-base btn-primary text-base">
								{loading ? 'Running...' : 'Run'}
							</button>
						)}
					</div>
				)}

				{presets && presets.length > 0 && (
					<div className="flex flex-wrap items-center gap-2">
						{presets.map((p) => (
							<button key={p} onClick={() => onPreset?.(p)} className="btn-preset text-base" disabled={loading}>
								{p}
							</button>
						))}
						{!customInput && actionLabel && (
							<button onClick={onAction} disabled={actionDisabled || loading} className="btn-base btn-primary text-base">
								{loading ? 'Running...' : actionLabel}
							</button>
						)}
					</div>
				)}

				<AnimatePresence>
					{exitCode !== undefined && !loading && (
						<motion.div
							className="flex items-center gap-3"
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.3, ease: EASE }}
						>
							<Badge variant={success === false ? 'error' : 'success'}>exit {exitCode}</Badge>
							{lastCommand && <span className="font-mono text-base text-cf-text-subtle">{lastCommand}</span>}
							{duration !== undefined && <span className="text-base text-cf-text-subtle">{duration}ms</span>}
						</motion.div>
					)}
				</AnimatePresence>

				<Output className="min-h-[100px] text-base/relaxed">
					{loading && lastCommand && <RunningIndicator command={lastCommand} />}
					{loading && !lastCommand && <Dim>Running...</Dim>}
					{!loading && error && <Stderr>{error}</Stderr>}
					{!loading && output && <Stdout>{output}</Stdout>}
					{!loading && !output && !error && <Dim>Run a command to see output</Dim>}
				</Output>

				{children}
			</div>
		</Reveal>
	);
}
