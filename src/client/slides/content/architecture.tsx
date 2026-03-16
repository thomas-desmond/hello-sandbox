import { Code, Database, TerminalSquare } from 'lucide-react';

import { Reveal } from '../components/reveal';
import { SlideLayout } from '../components/slide-layout';
import { RevealCode } from '../components/typewriter-code';

import type { SlideProperties } from '../types';

const LAYERS = [
	{
		icon: Code,
		label: 'Your Worker',
		desc: 'Application logic',
		color: 'bg-cf-orange/10 border-cf-orange text-cf-orange',
		detail: 'Your application calls getSandbox() to get a handle to a sandbox instance. This is where your business logic lives.',
	},
	{
		icon: Database,
		label: 'Durable Object',
		desc: 'Persistent state & routing',
		color: 'bg-cf-info/10 border-cf-info text-cf-info',
		detail: 'The Durable Object manages sandbox lifecycle, persists state with SQLite, and routes requests to the right container.',
	},
	{
		icon: TerminalSquare,
		label: 'Container',
		desc: 'Isolated Linux environment',
		color: 'bg-cf-success/10 border-cf-success text-cf-success',
		detail: 'A real Linux container with its own filesystem, networking, and process isolation. Sleeps after inactivity, wakes on demand.',
	},
];

const FULL_CODE = `import { getSandbox } from "@cloudflare/sandbox";
export { Sandbox } from "@cloudflare/sandbox";

const sandbox = getSandbox(env.Sandbox, "my-sandbox");
const result = await sandbox.exec("python3 --version");`;

/**
 * Slide: Architecture
 * Steps: 0 = title + Worker layer, 1 = DO layer, 2 = Container layer, 3 = code + tagline
 */
export function ArchitectureSlide({ step }: SlideProperties) {
	return (
		<SlideLayout>
			<Reveal visible={step >= 0} direction="left">
				<h2 className="font-sans text-5xl font-semibold tracking-tight text-cf-text">How it works</h2>
				<p className="mt-2 mb-8 text-xl text-cf-text-muted">Three layers. One SDK.</p>
			</Reveal>

			<div className="flex flex-1 items-start gap-12">
				{/* Left: Architecture blocks */}
				<div className="flex w-[420px] shrink-0 flex-col">
					{LAYERS.map((layer, index) => {
						const Icon = layer.icon;
						const visible = step >= index;

						return (
							<div key={layer.label} className="flex flex-col items-center">
								{index > 0 && (
									<div className="flex h-10 w-px items-center justify-center">
										<Reveal visible={visible} direction="none">
											<div className="h-10 w-px bg-cf-border" />
										</Reveal>
									</div>
								)}
								<Reveal visible={visible} direction="left" index={index}>
									<div className={`flex w-full items-center gap-4 rounded-xl border-2 px-6 py-5 ${layer.color}`}>
										<Icon className="size-8 shrink-0" strokeWidth={1.5} />
										<div>
											<div className="text-lg font-semibold">{layer.label}</div>
											<div className="text-base opacity-70">{layer.desc}</div>
										</div>
									</div>
								</Reveal>
							</div>
						);
					})}
				</div>

				{/* Right: Annotations stack up, then code at step 3 */}
				<div className="flex min-w-0 flex-1 flex-col gap-4 pt-2">
					{LAYERS.map((layer, index) => (
						<Reveal key={layer.label} visible={step >= index} direction="up" index={0}>
							<div
								className={`
									rounded-xl border px-6 py-4 transition-opacity duration-300
									${step >= index && (step === index || step >= 3) ? 'opacity-100' : 'opacity-50'}
									${layer.color}
								`}
							>
								<div className="flex items-center gap-3">
									<layer.icon className="size-5 shrink-0" strokeWidth={1.5} />
									<h3 className="text-base font-semibold">{layer.label}</h3>
								</div>
								<p className="mt-1 text-base/relaxed opacity-80">{layer.detail}</p>
							</div>
						</Reveal>
					))}

					<RevealCode code={FULL_CODE} visible={step >= 3} label="SETUP" />
				</div>
			</div>
		</SlideLayout>
	);
}

ArchitectureSlide.steps = 4;
