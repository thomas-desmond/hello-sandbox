import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

import { BrowserFrame } from '@/components/browser-frame';

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
 * Steps: 0=title+subtitle, 1=code, 2=launch button/iframe
 */
export function OpencodeSlide({ step }: SlideProperties) {
	const [iframeUrl, setIframeUrl] = useState<string | undefined>();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | undefined>();

	async function launch() {
		setLoading(true);
		setError(undefined);
		try {
			const response = await fetch('/api/opencode/start');
			if (!response.ok) throw new Error(`Failed to start OpenCode (${response.status})`);
			const data: { url: string } = await response.json();
			setIframeUrl(data.url);
		} catch (error_) {
			setError(error_ instanceof Error ? error_.message : 'Failed');
			setLoading(false);
		}
	}

	return (
		<SlideLayout>
			<SlideTitle
				number="08"
				title="AI Coding Agents"
				subtitle="Run AI assistants like OpenCode directly in sandbox containers."
				step={step}
			/>

			<div className="mt-6 flex flex-1 flex-col gap-5 overflow-hidden">
				<RevealCode code={CODE} visible={step >= 1} label="WORKER" />

				{step >= 2 && (
					<Reveal visible={step >= 2} className="flex flex-1 flex-col gap-3 overflow-hidden">
						{iframeUrl ? (
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
												<div className="flex items-end gap-[3px]">
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
								<iframe
									src={iframeUrl}
									className="w-full flex-1 border-0"
									onLoad={() => setLoading(false)}
									title="OpenCode"
									allow="clipboard-read; clipboard-write"
								/>
							</BrowserFrame>
						) : (
							<div className="flex items-center gap-4">
								<button onClick={() => void launch()} disabled={loading} className="btn-base btn-primary text-base">
									{loading ? 'Starting OpenCode...' : 'Launch OpenCode'}
								</button>
								{error && <span className="text-base text-cf-error">{error}</span>}
							</div>
						)}
					</Reveal>
				)}
			</div>
		</SlideLayout>
	);
}

OpencodeSlide.steps = 3;
