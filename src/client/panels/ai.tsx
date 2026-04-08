import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

import { Badge } from '@/components/badge';
import { Callout } from '@/components/callout';
import { CodeBlock } from '@/components/code-block';
import { Markdown } from '@/components/markdown';
import { Output, Stdout, Stderr, Dim } from '@/components/output';
import { api } from '@/lib/api';

interface AIResult {
	explanation: string;
	generatedCode: string;
	execution: {
		stdout: string;
		stderr: string;
		exitCode: number;
		success: boolean;
	};
}

const SDK_CODE = `const workersai = createWorkersAI({ binding: env.AI });
const result = await generateText({
  model: workersai('@cf/google/gemma-4-26b-a4b-it'),
  tools: { execute_python: tool({ ... }) },
  stopWhen: stepCountIs(5),
});`;

const SUGGESTIONS = [
	'Calculate the 50th Fibonacci number',
	'Find all prime numbers under 200',
	'Generate sample sales data',
	'Check if a string is a palindrome',
];

/* Fake code lines that float up during generation */
const GHOST_LINES = [
	'def solve(n):',
	'    result = []',
	'    for i in range(n):',
	'        if check(i):',
	'            result.append(i)',
	'    return result',
	'import math',
	'print(output)',
];

function AILoadingState() {
	return (
		<motion.div
			className="
				relative min-h-[220px] overflow-hidden rounded-lg border border-cf-ai/30 p-6
			"
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.97 }}
			transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
		>
			{/* Moving gradient background */}
			<motion.div
				className="absolute inset-0"
				animate={{
					background: [
						'linear-gradient(135deg, oklch(0.97 0.02 310) 0%, oklch(0.93 0.04 310) 50%, oklch(0.97 0.02 310) 100%)',
						'linear-gradient(135deg, oklch(0.93 0.04 310) 0%, oklch(0.97 0.02 310) 50%, oklch(0.93 0.04 310) 100%)',
						'linear-gradient(135deg, oklch(0.97 0.02 310) 0%, oklch(0.93 0.04 310) 50%, oklch(0.97 0.02 310) 100%)',
					],
				}}
				transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
			/>

			{/* Floating ghost code lines */}
			<div className="absolute inset-0 overflow-hidden">
				{GHOST_LINES.map((line, index) => (
					<motion.div
						key={index}
						className="
							absolute inset-x-0 font-mono text-xs whitespace-nowrap text-cf-ai/12
							select-none
						"
						style={{ top: `${12 + index * 26}px`, paddingLeft: `${20 + (index % 3) * 24}px` }}
						initial={{ opacity: 0, x: -40 }}
						animate={{
							opacity: [0, 0.6, 0.6, 0],
							x: [-40, 0, 0, 40],
						}}
						transition={{
							duration: 3,
							delay: index * 0.35,
							repeat: Infinity,
							ease: 'easeInOut',
						}}
					>
						{line}
					</motion.div>
				))}
			</div>

			{/* Pulsing border glow */}
			<motion.div
				className="pointer-events-none absolute inset-0 rounded-lg"
				animate={{
					boxShadow: [
						'inset 0 0 20px 0 oklch(from #9616ff 0.7 0.15 310 / 0%)',
						'inset 0 0 30px 0 oklch(from #9616ff 0.7 0.15 310 / 8%)',
						'inset 0 0 20px 0 oklch(from #9616ff 0.7 0.15 310 / 0%)',
					],
				}}
				transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
			/>

			{/* Center content */}
			<div
				className="
					relative z-10 flex h-full min-h-[170px] flex-col items-center
					justify-center gap-4
				"
			>
				{/* Animated brain/sparkle icon */}
				<div className="relative">
					<motion.div
						className="flex items-center justify-center"
						animate={{ rotate: [0, 5, -5, 0] }}
						transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
					>
						<motion.span
							className="text-3xl select-none"
							animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
							transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
						>
							✦
						</motion.span>
					</motion.div>

					{/* Orbiting dots */}
					{[0, 1, 2].map((index) => (
						<motion.div
							key={index}
							className="absolute size-1.5 rounded-full bg-cf-ai/50"
							style={{ top: '50%', left: '50%' }}
							animate={{
								x: [
									Math.cos((index * 2 * Math.PI) / 3) * 20,
									Math.cos((index * 2 * Math.PI) / 3 + Math.PI) * 20,
									Math.cos((index * 2 * Math.PI) / 3 + 2 * Math.PI) * 20,
								],
								y: [
									Math.sin((index * 2 * Math.PI) / 3) * 20,
									Math.sin((index * 2 * Math.PI) / 3 + Math.PI) * 20,
									Math.sin((index * 2 * Math.PI) / 3 + 2 * Math.PI) * 20,
								],
								opacity: [0.3, 0.8, 0.3],
							}}
							transition={{
								duration: 2.5,
								repeat: Infinity,
								ease: 'easeInOut',
								delay: index * 0.3,
							}}
						/>
					))}
				</div>

				<div className="flex flex-col items-center gap-1.5">
					<span className="text-sm font-medium text-cf-ai">AI is thinking...</span>
				</div>
			</div>
		</motion.div>
	);
}

export function AIPanel() {
	const [prompt, setPrompt] = useState('');
	const [result, setResult] = useState<AIResult | undefined>();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | undefined>();

	async function generate(input: string) {
		const trimmed = input.trim();
		if (!trimmed) return;
		setLoading(true);
		setError(undefined);
		try {
			const data = await api<AIResult>('/api/ai', { prompt: trimmed });
			setResult(data);
		} catch (error_) {
			setResult(undefined);
			setError(error_ instanceof Error ? error_.message : 'AI generation failed');
		} finally {
			setLoading(false);
		}
	}

	return (
		<section className="flex flex-col gap-6">
			<div>
				<h2 className="font-sans text-2xl font-medium text-cf-text">AI Code Executor</h2>
				<p className="mt-1 text-base text-cf-text-muted">
					Describe what you want in natural language. Workers AI generates Python code and executes it in the sandbox automatically.
				</p>
			</div>

			<CodeBlock code={SDK_CODE} label="SDK CODE" variant="ai" />

			<div className="flex flex-col gap-4">
				<div className="flex gap-2">
					<input
						type="text"
						value={prompt}
						onChange={(event_) => setPrompt(event_.target.value)}
						onKeyDown={(event_) => {
							if (event_.key === 'Enter') void generate(prompt);
						}}
						placeholder="Describe what you want the code to do..."
						className="
							input-field flex-1
							placeholder:text-cf-text-subtle
						"
					/>
					<button
						onClick={() => void generate(prompt)}
						disabled={loading || !prompt.trim()}
						className="btn-base flex items-center gap-2 btn-ai"
					>
						{loading ? 'Generating...' : 'Generate & Execute'}
					</button>
				</div>

				<div className="flex flex-wrap gap-2">
					{SUGGESTIONS.map((suggestion) => (
						<button
							key={suggestion}
							onClick={() => {
								setPrompt(suggestion);
								void generate(suggestion);
							}}
							className="btn-preset"
						>
							{suggestion}
						</button>
					))}
				</div>

				<AnimatePresence mode="wait">
					{/* Loading state */}
					{loading && (
						<motion.div
							key="loading"
							className="
								grid grid-cols-1 gap-4
								lg:grid-cols-2
							"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0, y: -8 }}
							transition={{ duration: 0.3 }}
						>
							<AILoadingState />
							<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.3 }}>
								<Output>
									<Dim>
										<motion.span
											animate={{ opacity: [0.4, 0.8, 0.4] }}
											transition={{
												duration: 1.5,
												repeat: Infinity,
												ease: 'easeInOut',
											}}
										>
											Waiting for execution...
										</motion.span>
									</Dim>
								</Output>
							</motion.div>
						</motion.div>
					)}

					{/* Results */}
					{result && !loading && (
						<motion.div
							key="results"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
							className="flex flex-col gap-4"
						>
							<div
								className="
									grid grid-cols-1 gap-4
									lg:grid-cols-2
								"
							>
								{/* Generated code */}
								<motion.div
									className="flex flex-col gap-2"
									initial={{ opacity: 0, x: -16 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{
										duration: 0.4,
										delay: 0.1,
										ease: [0.16, 1, 0.3, 1],
									}}
								>
									<div className="flex items-center gap-2">
										<Badge variant="ai">Generated Code</Badge>
									</div>
									<CodeBlock code={result.generatedCode} label="AI GENERATED" variant="ai" />
								</motion.div>

								{/* Execution result */}
								<motion.div
									className="flex flex-col gap-2"
									initial={{ opacity: 0, x: 16 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{
										duration: 0.4,
										delay: 0.2,
										ease: [0.16, 1, 0.3, 1],
									}}
								>
									<div className="flex items-center gap-2">
										<Badge variant={result.execution.success ? 'success' : 'error'}>exit {result.execution.exitCode}</Badge>
									</div>
									<Output>
										{result.execution.stdout && <Stdout>{result.execution.stdout}</Stdout>}
										{result.execution.stderr && <Stderr>{result.execution.stderr}</Stderr>}
										{!result.execution.stdout && !result.execution.stderr && <Dim>(no output)</Dim>}
									</Output>
								</motion.div>
							</div>

							{/* AI explanation */}
							{result.explanation && (
								<motion.div
									className="
										rounded-md border border-cf-border bg-cf-bg-200 px-4 py-3
										text-sm/relaxed text-cf-text-muted
									"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										duration: 0.4,
										delay: 0.35,
										ease: [0.16, 1, 0.3, 1],
									}}
								>
									<span className="font-medium text-cf-ai">AI Explanation: </span>
									<Markdown>{result.explanation}</Markdown>
								</motion.div>
							)}
						</motion.div>
					)}

					{error && (
						<motion.div
							key="error"
							initial={{ opacity: 0, scale: 0.96 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.96 }}
							transition={{ duration: 0.25 }}
						>
							<Output>
								<Stderr>{error}</Stderr>
							</Output>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			<Callout variant="ai">
				Workers AI generates Python code from your prompt using <span className="font-medium">tool calling</span> with the Vercel AI SDK.
				The generated code is automatically executed in the sandbox, giving the AI the ability to iterate on errors up to 5 steps.
			</Callout>
		</section>
	);
}
