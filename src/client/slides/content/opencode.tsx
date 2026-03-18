import { Code } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';

import { BrowserFrame } from '@/components/browser-frame';
import { highlightCode } from '@/lib/highlight';

import { Reveal } from '../components/reveal';
import { SlideLayout } from '../components/slide-layout';
import { SlideTitle } from '../components/slide-title';
import { RevealCode } from '../components/typewriter-code';

import type { SlideProperties } from '../types';

const CODE = `// Uses the official -opencode base image
// FROM cloudflare/sandbox:0.7.17-opencode

const sandbox = getSandbox(env.OpencodeSandbox, "opencode");
const server = await createOpencodeServer(sandbox, {
  directory: "/home/user/agents",
});
const { url } = await sandbox.exposePort(server.port, { hostname });`;

/**
 * Slide 10: OpenCode / AI Coding Agents
 * Steps: 0=title+subtitle, 1=code, 2=iframe (auto-launches)
 */
export function OpencodeSlide({ step }: SlideProperties) {
	const [iframeUrl, setIframeUrl] = useState<string | undefined>();
	const [failed, setFailed] = useState(false);
	const launched = useRef(false);

	useEffect(() => {
		if (step < 2 || launched.current) return;
		launched.current = true;
		fetch('/api/opencode/start')
			.then(async (response) => {
				if (!response.ok) throw new Error(`Failed (${response.status})`);
				const data: { url: string } = await response.json();
				setIframeUrl(data.url);
			})
			.catch(() => {
				launched.current = false;
				setFailed(true);
			});
	}, [step]);

	const [iframeLoaded, setIframeLoaded] = useState(false);
	const loading = step >= 2 && !iframeLoaded && !failed;

	return (
		<SlideLayout>
			<SlideTitle
				number="08"
				title="AI Coding Agents"
				subtitle="Run AI assistants like OpenCode directly in sandbox containers."
				step={step}
			/>

			<div className="mt-6 flex min-h-0 flex-1 flex-col gap-5">
				{/* Setup code: full block at step 1, collapses to compact strip at step 2 */}
				{step >= 1 && (
					<div className="relative shrink-0">
						{/* Full code block — visible at step 1, fades out at step 2 */}
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
							<RevealCode code={CODE} visible label="WORKER" />
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
										__html: highlightCode('createOpencodeServer(sandbox) → sandbox.exposePort(port)'),
									}}
								/>
								<span
									className="
										ml-auto shrink-0 rounded-md bg-cf-bg-300 px-2 py-0.5 font-sans text-xs
										font-medium text-cf-text-subtle
									"
								>
									WORKER
								</span>
							</div>
						</motion.div>
					</div>
				)}

				{step >= 2 && (
					<Reveal visible={step >= 2} className="flex min-h-0 flex-1 flex-col">
						<BrowserFrame url={iframeUrl} className="relative" containerClassName="min-h-0 flex-1">
							<AnimatePresence>
								{loading && (
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
														animate={{ height: [8 + index * 3, 16 + index * 2, 8 + index * 3], opacity: [0.3, 1, 0.3] }}
														transition={{ duration: 1, repeat: Infinity, delay: index * 0.12, ease: 'easeInOut' }}
														style={{ height: 8 + index * 3 }}
													/>
												))}
											</div>
											<span className="text-base text-surface-dark-text/80">Starting OpenCode...</span>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
							{iframeUrl && (
								<iframe
									src={iframeUrl}
									className="w-full flex-1 border-0"
									onLoad={() => setIframeLoaded(true)}
									title="OpenCode"
									allow="clipboard-read; clipboard-write"
								/>
							)}
						</BrowserFrame>
					</Reveal>
				)}
			</div>
		</SlideLayout>
	);
}

OpencodeSlide.steps = 3;
