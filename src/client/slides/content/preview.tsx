import { Code } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

import { Badge } from '@/components/badge';
import { BrowserFrame } from '@/components/browser-frame';
import { Output, Stdout, Stderr, Dim } from '@/components/output';
import { Spinner } from '@/components/spinner';
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
 * Steps: 0=title+subtitle, 1=flow+code, 2=live demo
 */
export function PreviewSlide({ step }: SlideProperties) {
	const [loading, setLoading] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | undefined>();
	const [lines, setLines] = useState<string[]>([]);
	const [error, setError] = useState<string | undefined>();
	async function startServer() {
		setLoading(true);
		setError(undefined);
		setLines((p) => [...p, '$ Starting python3 -m http.server 8080...']);
		try {
			const data = await api<PreviewStartResult>('/api/preview/start', { command: 'python3 -m http.server 8080', port: 8080 });
			setLines((p) => [...p, `Server started on port ${data.port}`, `Preview URL: ${data.url}`]);
			setPreviewUrl(data.url);
		} catch (error_) {
			setError(error_ instanceof Error ? error_.message : 'Failed to start preview');
		} finally {
			setLoading(false);
		}
	}

	return (
		<SlideLayout>
			<SlideTitle number="06" title="Preview URLs" subtitle="Start a server. Expose a port. Get a public URL. Instantly." step={step} />

			<div className="mt-6 flex flex-1 flex-col gap-5 overflow-y-auto">
				{/* Flow + code: full block at step 1, collapses to compact strip at step 2 */}
				{step >= 1 && (
					<div className="relative">
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
					<Reveal visible={step >= 2}>
						<div className="flex flex-col gap-4">
							<button onClick={startServer} disabled={loading || !!previewUrl} className="btn-base w-fit btn-primary text-base">
								{loading ? (
									<>
										<Spinner className="size-4" /> Starting...
									</>
								) : previewUrl ? (
									'Server Running'
								) : (
									'Start Server & Expose'
								)}
							</button>

							<Output className="min-h-[60px] text-base/relaxed">
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
								{!loading && lines.length === 0 && !error && <Dim>Click to start a server and expose it</Dim>}
							</Output>

							{previewUrl && (
								<div className="flex flex-col gap-2">
									<Badge variant="success">Live Preview</Badge>
									<BrowserFrame url={previewUrl} containerClassName="min-h-0 flex-1">
										<iframe
											src={previewUrl}
											title="Sandbox preview"
											className="min-h-[280px] w-full flex-1 border-0"
											sandbox="allow-scripts allow-same-origin allow-forms"
										/>
									</BrowserFrame>
								</div>
							)}
						</div>
					</Reveal>
				)}
			</div>
		</SlideLayout>
	);
}

PreviewSlide.steps = 3;
