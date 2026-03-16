import { Bot, GraduationCap, TestTubeDiagonal, CodeXml, Workflow, Database } from 'lucide-react';

import { Reveal } from '../components/reveal';
import { SlideLayout } from '../components/slide-layout';

import type { SlideProperties } from '../types';

const USE_CASES = [
	{
		icon: Bot,
		title: 'AI Agent Backends',
		description: 'Give LLMs a safe environment to generate and execute code, install packages, and build projects.',
		example: 'OpenAI Agents, Claude tools, custom copilots',
	},
	{
		icon: CodeXml,
		title: 'Code Playgrounds',
		description: 'Build interactive coding environments for documentation, tutorials, and product demos.',
		example: 'sandbox.cloudflare.com, embedded REPLs',
	},
	{
		icon: TestTubeDiagonal,
		title: 'CI/CD & Testing',
		description: 'Run test suites, build pipelines, and preview deployments in isolated containers.',
		example: 'PR previews, integration tests, build farms',
	},
	{
		icon: GraduationCap,
		title: 'Education',
		description: 'Provide each student their own sandbox for assignments, grading, and hands-on learning.',
		example: 'Coding bootcamps, university labs',
	},
	{
		icon: Workflow,
		title: 'Workflow Automation',
		description: 'Run user-defined scripts, data transformations, and automation pipelines securely.',
		example: 'ETL jobs, scheduled tasks, webhooks',
	},
	{
		icon: Database,
		title: 'Data Analysis',
		description: 'Execute Python/JS with pandas, numpy, and custom libraries for on-demand data processing.',
		example: 'Notebooks, dashboards, report generation',
	},
];

/**
 * Slide: Use Cases
 * Steps: 0 = title + row 1, 1 = row 2, 2 = row 3
 */
export function UseCasesSlide({ step }: SlideProperties) {
	return (
		<SlideLayout>
			<Reveal visible={step >= 0} direction="left">
				<h2
					className="
						mb-2 font-sans text-5xl font-semibold tracking-tight text-cf-text
					"
				>
					What can you build?
				</h2>
				<p className="mb-6 text-xl text-cf-text-muted">The Sandbox SDK powers any use case that needs isolated code execution.</p>
			</Reveal>

			<div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center">
				<div className="grid grid-cols-2 gap-5">
					{USE_CASES.map((useCase, index) => {
						const Icon = useCase.icon;
						const row = Math.floor(index / 2);
						const visible = step >= row;
						return (
							<Reveal key={useCase.title} visible={visible} direction="up" index={index % 2}>
								<div
									className="
										flex h-full gap-5 rounded-xl border border-cf-border bg-cf-bg-200 px-7
										py-6
									"
								>
									<Icon className="mt-0.5 size-7 shrink-0 text-cf-orange" strokeWidth={1.5} />
									<div className="flex flex-col gap-1.5">
										<h3 className="text-xl font-semibold text-cf-text">{useCase.title}</h3>
										<p className="text-base/relaxed text-cf-text-muted">{useCase.description}</p>
										<p className="mt-auto pt-1 font-mono text-sm text-cf-text-subtle">{useCase.example}</p>
									</div>
								</div>
							</Reveal>
						);
					})}
				</div>
			</div>
		</SlideLayout>
	);
}

UseCasesSlide.steps = 3;
