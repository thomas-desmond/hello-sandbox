import { Code, Database, TerminalSquare } from 'lucide-react';

import { Reveal } from '../components/reveal';
import { SlideLayout } from '../components/slide-layout';
import { RevealCode } from '../components/typewriter-code';

import type { SlideProperties } from '../types';

const LAYERS = [
	{ icon: Code, label: 'Your Worker', desc: 'Application logic', color: 'bg-cf-orange/10 border-cf-orange text-cf-orange' },
	{ icon: Database, label: 'Durable Object', desc: 'Persistent state & routing', color: 'bg-cf-info/10 border-cf-info text-cf-info' },
	{
		icon: TerminalSquare,
		label: 'Container',
		desc: 'Isolated Linux environment',
		color: 'bg-cf-success/10 border-cf-success text-cf-success',
	},
];

const FULL_CODE = `import { getSandbox } from "@cloudflare/sandbox";
export { Sandbox } from "@cloudflare/sandbox";

const sandbox = getSandbox(env.Sandbox, "my-sandbox");
const result = await sandbox.exec("python3 --version");`;

/**
 * Slide 2: Architecture
 * Steps: 0 = title + Worker layer, 1 = DO layer, 2 = Container layer, 3 = code + tagline
 */
export function ArchitectureSlide({ step }: SlideProperties) {
	return (
		<SlideLayout>
			<Reveal visible={step >= 0} direction="left">
				<h2
					className="
						mb-8 font-sans text-5xl font-semibold tracking-tight text-cf-text
					"
				>
					How it works
				</h2>
			</Reveal>

			<div className="flex flex-1 items-start gap-16">
				<div className="flex w-[420px] shrink-0 flex-col gap-0">
					{LAYERS.map((layer, index) => {
						const Icon = layer.icon;
						const visible = step >= index;

						return (
							<div key={layer.label} className="flex flex-col items-center">
								{index > 0 && (
									<div className="flex h-8 w-px items-center justify-center">
										<Reveal visible={visible} direction="none">
											<div className="h-8 w-px bg-cf-border" />
										</Reveal>
									</div>
								)}
								<Reveal visible={visible} direction="left" index={index}>
									<div className={`flex w-full items-center gap-4 rounded-xl border-2 px-6 py-5 ${layer.color}`}>
										<Icon className="size-8 shrink-0" strokeWidth={1.5} />
										<div>
											<div className="text-lg font-semibold">{layer.label}</div>
											<div className="text-sm opacity-70">{layer.desc}</div>
										</div>
									</div>
								</Reveal>
							</div>
						);
					})}
				</div>

				<div className="flex min-w-0 flex-1 flex-col gap-6 pt-2">
					<RevealCode code={FULL_CODE} visible={step >= 3} label="SETUP" />
					<Reveal visible={step >= 3} index={1}>
						<p className="text-lg text-cf-text-muted">
							<span className="font-medium text-cf-orange">Workers</span> for logic.{' '}
							<span className="font-medium text-cf-info">Durable Objects</span> for state.{' '}
							<span className="font-medium text-cf-success">Containers</span> for execution.
						</p>
					</Reveal>
				</div>
			</div>
		</SlideLayout>
	);
}

ArchitectureSlide.steps = 4;
