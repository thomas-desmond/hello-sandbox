import { motion } from 'motion/react';
import { useState } from 'react';

import { Badge } from '@/components/badge';
import { Markdown } from '@/components/markdown';
import { Output, Stdout, Stderr, Dim } from '@/components/output';
import { api } from '@/lib/api';
import { highlightCode } from '@/lib/highlight';

import { Reveal } from '../components/reveal';
import { SlideLayout } from '../components/slide-layout';
import { SlideTitle } from '../components/slide-title';

import type { SlideProperties } from '../types';

interface AIResult {
	explanation: string;
	generatedCode: string;
	execution: { stdout: string; stderr: string; exitCode: number; success: boolean };
}

const SUGGESTIONS = ['Calculate the 50th Fibonacci number', 'Find all prime numbers under 100', 'Generate a multiplication table'];

const FLOW_ITEMS = ['Natural language prompt', 'Workers AI generates code', 'Sandbox executes it'];

/**
 * Slide 6: AI Code Execution
 * Steps: 0=title+subtitle, 1=flow + demo
 */
export function AISlide({ step }: SlideProperties) {
	const [prompt, setPrompt] = useState('');
	const [result, setResult] = useState<AIResult | undefined>();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | undefined>();
	async function generate(input: string) {
		const trimmed = input.trim();
		if (!trimmed) return;
		setPrompt(trimmed);
		setLoading(true);
		setError(undefined);
		setResult(undefined);
		try {
			const data = await api<AIResult>('/api/ai', { prompt: trimmed });
			setResult(data);
		} catch (error_) {
			setError(error_ instanceof Error ? error_.message : 'AI generation failed');
		} finally {
			setLoading(false);
		}
	}

	return (
		<SlideLayout>
			<SlideTitle
				number="04"
				title="AI Code Execution"
				subtitle="Workers AI generates code. Sandbox executes it. Automatically."
				step={step}
			/>

			<div className="mt-6 flex flex-1 flex-col gap-5 overflow-y-auto">
				{/* Flow concept - bigger boxes */}
				{step >= 1 && (
					<div className="flex items-center gap-5">
						{FLOW_ITEMS.map((label, index) => (
							<div key={label} className="flex items-center gap-5">
								{index > 0 && (
									<Reveal visible direction="none" index={index}>
										<span className="text-3xl text-cf-text-subtle">&rarr;</span>
									</Reveal>
								)}
								<Reveal visible direction="up" index={index}>
									<div
										className="
											min-w-[180px] rounded-xl border border-cf-border bg-cf-bg-200 px-8
											py-5 text-lg font-semibold text-cf-text
										"
									>
										{label}
									</div>
								</Reveal>
							</div>
						))}
					</div>
				)}

				{/* Live demo */}
				{step >= 1 && (
					<Reveal visible={step >= 1}>
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
									className="input-field flex-1 text-base"
								/>
								<button onClick={() => void generate(prompt)} disabled={loading || !prompt.trim()} className="btn-base btn-ai text-base">
									{loading ? 'Generating...' : 'Generate & Execute'}
								</button>
							</div>

							<div className="flex flex-wrap gap-2">
								{SUGGESTIONS.map((s) => (
									<button key={s} onClick={() => void generate(s)} disabled={loading} className="btn-preset text-base">
										{s}
									</button>
								))}
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="flex flex-col gap-2">
									<Badge variant="ai">Generated Code</Badge>
									{result && !loading ? (
										<div
											className="
												max-h-[250px] overflow-y-auto rounded-lg border border-cf-ai/30
												bg-cf-bg-200 px-5 py-4 font-mono text-base/relaxed
											"
											dangerouslySetInnerHTML={{ __html: highlightCode(result.generatedCode) }}
										/>
									) : (
										<div
											className="
												flex min-h-[100px] items-center justify-center rounded-lg border
												border-cf-ai/20 bg-cf-bg-200
											"
										>
											{loading ? (
												<div className="flex items-center gap-3">
													<div className="flex gap-1">
														{[0, 1, 2].map((index) => (
															<motion.div
																key={index}
																className="size-2 rounded-full bg-cf-ai"
																animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
																transition={{ duration: 1, repeat: Infinity, delay: index * 0.2, ease: 'easeInOut' }}
															/>
														))}
													</div>
													<span className="text-base font-medium text-cf-ai">AI is thinking...</span>
												</div>
											) : (
												<Dim>Generated code will appear here</Dim>
											)}
										</div>
									)}
								</div>
								<div className="flex flex-col gap-2">
									{result && !loading ? (
										<Badge variant={result.execution.success ? 'success' : 'error'}>exit {result.execution.exitCode}</Badge>
									) : (
										<Badge variant="neutral">Output</Badge>
									)}
									<Output className="min-h-[100px] text-base/relaxed">
										{loading && <Dim>Waiting for execution...</Dim>}
										{!loading && error && <Stderr>{error}</Stderr>}
										{!loading && result && (
											<>
												{result.execution.stdout && <Stdout>{result.execution.stdout}</Stdout>}
												{result.execution.stderr && <Stderr>{result.execution.stderr}</Stderr>}
												{!result.execution.stdout && !result.execution.stderr && <Dim>(no output)</Dim>}
											</>
										)}
										{!loading && !result && !error && <Dim>Execution output will appear here</Dim>}
									</Output>
								</div>
							</div>

							{result?.explanation && !loading && (
								<div
									className="
										rounded-md border border-cf-border bg-cf-bg-200 px-4 py-3 text-base
										text-cf-text-muted
									"
								>
									<span className="font-medium text-cf-ai">AI: </span>
									<Markdown>{result.explanation}</Markdown>
								</div>
							)}
						</div>
					</Reveal>
				)}
			</div>
		</SlideLayout>
	);
}

AISlide.steps = 2;
