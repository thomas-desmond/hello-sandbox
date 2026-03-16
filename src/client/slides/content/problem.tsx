import { Bot, ShieldCheck, Blocks, Globe } from 'lucide-react';

import { Reveal } from '../components/reveal';
import { SlideLayout } from '../components/slide-layout';

import type { SlideProperties } from '../types';

const PROBLEMS = [
	{
		icon: Bot,
		title: 'AI agents need to run code',
		description: 'LLMs generate code, but where does it execute? You need isolation, security, and resource limits.',
	},
	{
		icon: Blocks,
		title: 'Dev tools need a backend',
		description: 'Code playgrounds, CI/CD runners, and interactive tutorials all need sandboxed execution environments.',
	},
	{
		icon: ShieldCheck,
		title: 'Untrusted code is dangerous',
		description: 'User-submitted code can be malicious. You need containers that are isolated, ephemeral, and disposable.',
	},
	{
		icon: Globe,
		title: 'Infrastructure is complex',
		description: 'Managing VMs, container orchestration, networking, and scaling is a full-time job. You just want to run code.',
	},
];

/**
 * Slide 2: The Problem
 * Steps: 0 = title + first two problems, 1 = last two problems + punchline
 */
export function ProblemSlide({ step }: SlideProperties) {
	return (
		<SlideLayout>
			<Reveal visible={step >= 0} direction="left">
				<h2
					className="
						mb-2 font-sans text-5xl font-semibold tracking-tight text-cf-text
					"
				>
					Why Sandboxes
				</h2>
				<p className="mb-8 text-xl text-cf-text-muted">Running untrusted code at scale is hard.</p>
			</Reveal>

			<div className="grid grid-cols-2 gap-6">
				{PROBLEMS.map((problem, index) => {
					const Icon = problem.icon;
					const visible = index < 2 ? step >= 0 : step >= 1;
					return (
						<Reveal key={problem.title} visible={visible} direction="up" index={index % 2}>
							<div
								className="
									flex gap-5 rounded-xl border border-cf-border bg-cf-bg-200 px-7 py-6
								"
							>
								<Icon className="mt-0.5 size-7 shrink-0 text-cf-orange" strokeWidth={1.5} />
								<div>
									<h3 className="text-lg font-semibold text-cf-text">{problem.title}</h3>
									<p className="mt-1 text-base/relaxed text-cf-text-muted">{problem.description}</p>
								</div>
							</div>
						</Reveal>
					);
				})}
			</div>

			<Reveal visible={step >= 1} direction="up" delay={0.15}>
				<p className="mt-8 text-center text-xl font-medium text-cf-text">
					What if you could just <span className="text-cf-orange">npm install</span> a sandbox?
				</p>
			</Reveal>
		</SlideLayout>
	);
}

ProblemSlide.steps = 2;
