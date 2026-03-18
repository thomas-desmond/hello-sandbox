import { Code } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';

import { BrowserFrame } from '@/components/browser-frame';
import { Output, Stdout, Stderr, Dim } from '@/components/output';
import { api } from '@/lib/api';
import { highlightCode } from '@/lib/highlight';

import { Reveal } from '../components/reveal';
import { SlideLayout } from '../components/slide-layout';
import { SlideTitle } from '../components/slide-title';
import { RevealCode } from '../components/typewriter-code';

import type { SlideProperties } from '../types';

interface PreviewStartResult {
	success: boolean;
	url: string;
	port: number;
}

const CODE = `const proc = await sandbox.startProcess(
  "python3 -m http.server 8080", { cwd: "/workspace" }
);
await proc.waitForPort(8080, { mode: "tcp", timeout: 10_000 });
const { url } = await sandbox.exposePort(8080, { hostname });`;

const FLOW_ITEMS = [
	{ label: 'Server starts in sandbox', sub: 'python3 -m http.server 8080' },
	{ label: 'Port exposed', sub: 'sandbox.exposePort(8080)' },
	{ label: 'Public URL generated', sub: 'https://8080-demo-xxx.domain.com' },
];

/**
 * Slide 8: Preview URLs
 * Steps: 0=title+subtitle, 1=flow+code, 2=live demo (auto-starts)
 */
export function PreviewSlide({ step }: SlideProperties) {
	const [previewUrl, setPreviewUrl] = useState<string | undefined>();
	const [lines, setLines] = useState<string[]>([]);
	const [error, setError] = useState<string | undefined>();
	const started = useRef(false);

	useEffect(() => {
		if (step < 2 || started.current) return;
		started.current = true;
		api<PreviewStartResult>('/api/preview/start', { command: 'python3 -m http.server 8080', port: 8080 })
			.then((data) => {
				setLines((p) => [...p, `Server started on port ${data.port}`, `Preview URL: ${data.url}`]);
				setPreviewUrl(data.url);
			})
			.catch((error_) => {
				setError(error_ instanceof Error ? error_.message : 'Failed to start preview');
				started.current = false;
			});
	}, [step]);

	const loading = step >= 2 && !previewUrl && !error;

	return (
		<SlideLayout>
			<SlideTitle number="06" title="Preview URLs" subtitle="Start a server. Expose a port. Get a public URL. Instantly." step={step} />

			<div className="mt-6 flex min-h-0 flex-1 flex-col gap-5">
				{/* Flow + code: full block at step 1, collapses to compact strip at step 2 */}
				{step >= 1 && (
					<div className="relative shrink-0">
						{/* Full block — visible at step 1, fades out at step 2 */}
						<motion.div
							initial={{ opacity: 0, y: 16 }}
							animate={{
								opacity: step < 2 ? 1 : 0,
								y: step < 2 ? 0 : -8,
								height: step < 2 ? 'auto' : 0,
								overflow: 'hidden',
							}}
							transition={{ duration: 0.35, ease: [0.16, 0.77, 0.36, 0.98] }}
						>
							{/* Flow diagram */}
							<div className="mb-5 flex items-center gap-5">
								{FLOW_ITEMS.map((item, index) => (
									<div key={item.label} className="flex items-center gap-5">
										{index > 0 && (
											<Reveal visible direction="none" index={index}>
												<span className="text-3xl text-cf-text-subtle">&rarr;</span>
											</Reveal>
										)}
										<Reveal visible direction="up" index={index}>
											<div
												className="
													min-w-[180px] rounded-xl border border-cf-border bg-cf-bg-200 px-8
													py-5
												"
											>
												<div className="text-lg font-semibold text-cf-text">{item.label}</div>
												<div className="font-mono text-base text-cf-text-subtle">{item.sub}</div>
											</div>
										</Reveal>
									</div>
								))}
							</div>
							<RevealCode code={CODE} visible label="SDK" />
						</motion.div>

						{/* Collapsed strip — slides in once demo is active */}
						<motion.div
							initial={false}
							animate={{
								opacity: step >= 2 ? 1 : 0,
								height: step >= 2 ? 'auto' : 0,
								overflow: 'hidden',
							}}
							transition={{ duration: 0.35, ease: [0.16, 0.77, 0.36, 0.98] }}
						>
							<div
								className="
									flex items-center gap-3 rounded-lg border border-cf-border bg-cf-bg-200
									px-4 py-2.5
								"
							>
								<Code className="size-4 shrink-0 text-cf-orange" strokeWidth={2} />
								<code
									className="truncate font-mono text-sm text-cf-text-muted"
									dangerouslySetInnerHTML={{
										__html: highlightCode('sandbox.startProcess() → sandbox.exposePort(port)'),
									}}
								/>
								<span
									className="
										ml-auto shrink-0 rounded-md bg-cf-bg-300 px-2 py-0.5 font-sans text-xs
										font-medium text-cf-text-subtle
									"
								>
									SDK
								</span>
							</div>
						</motion.div>
					</div>
				)}

				{step >= 2 && (
					<Reveal visible={step >= 2} className="flex min-h-0 flex-1 flex-col gap-4">
						<BrowserFrame url={previewUrl} className="relative" containerClassName="min-h-0 flex-1">
							<AnimatePresence>
								{!previewUrl && (
									<motion.div
										className="
											absolute inset-0 z-10 flex items-center justify-center
											bg-surface-dark/90 backdrop-blur-sm
										"
										initial={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.5 }}
									>
										<div className="flex flex-col items-center gap-3">
											<div className="flex h-6 items-end gap-[3px]">
												{[0, 1, 2, 3, 4].map((index) => (
													<motion.div
														key={index}
														className="w-[3px] rounded-full bg-cf-orange"
														animate={{
															height: [8 + index * 3, 16 + index * 2, 8 + index * 3],
															opacity: [0.3, 1, 0.3],
														}}
														transition={{ duration: 1, repeat: Infinity, delay: index * 0.12, ease: 'easeInOut' }}
														style={{ height: 8 + index * 3 }}
													/>
												))}
											</div>
											<span className="text-base text-surface-dark-text/80">Starting server...</span>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
							{previewUrl && (
								<iframe
									src={previewUrl}
									title="Sandbox preview"
									className="w-full flex-1 border-0"
									sandbox="allow-scripts allow-same-origin allow-forms"
								/>
							)}
						</BrowserFrame>

						<Output className="shrink-0 text-base/relaxed">
							{loading && lines.length === 0 && <Dim>Starting server...</Dim>}
							{lines.map((line, index) => (
								<span key={index}>
									{line.startsWith('$') ? (
										<span className="text-surface-dark-success">{line}</span>
									) : line.startsWith('Preview URL:') ? (
										<span className="text-surface-dark-info">{line}</span>
									) : (
										<Stdout>{line}</Stdout>
									)}
									{'\n'}
								</span>
							))}
							{error && <Stderr>{error}</Stderr>}
							{!loading && lines.length === 0 && !error && <Dim>Starting server...</Dim>}
						</Output>
					</Reveal>
				)}
			</div>
		</SlideLayout>
	);
}

PreviewSlide.steps = 3;
