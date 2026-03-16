import { ChevronDown, Code, Database, TerminalSquare } from 'lucide-react';
import { motion } from 'motion/react';

import { Reveal } from '../components/reveal';
import { SlideLayout } from '../components/slide-layout';

import type { SlideProperties } from '../types';

const LAYERS = [
	{
		icon: Code,
		label: 'Your Worker',
		desc: 'Client SDK',
		color: 'border-cf-orange text-cf-orange',
		bg: 'bg-cf-orange/10',
		iconBg: 'bg-cf-orange/10',
		badgeActive: 'bg-cf-orange text-[#fff]',
		detail:
			'The developer-facing API you use in your Workers. Provides a clean, type-safe TypeScript interface for all sandbox operations — exec commands, read/write files, run code, and expose ports.',
	},
	{
		icon: Database,
		label: 'Durable Object',
		desc: 'Lifecycle & routing',
		color: 'border-cf-info text-cf-info',
		bg: 'bg-cf-info/10',
		iconBg: 'bg-cf-info/10',
		badgeActive: 'bg-cf-info text-[#fff]',
		detail:
			'Provides persistent, stateful sandbox instances with unique identities. Same sandbox ID always routes to the same instance. Manages container lifecycle, geographic distribution, and automatic scaling.',
	},
	{
		icon: TerminalSquare,
		label: 'Container',
		desc: 'Isolated Linux environment',
		color: 'border-cf-success text-cf-success',
		bg: 'bg-cf-success/10',
		iconBg: 'bg-cf-success/10',
		badgeActive: 'bg-cf-success text-[#fff]',
		detail:
			'Safely executes untrusted code with VM-based isolation. Each sandbox runs in its own VM with a full Ubuntu Linux environment — Python, Node.js, Git, and more. Sleeps after inactivity, wakes on demand.',
	},
];

const CONNECTOR_LABELS = ['RPC call via Durable Object stub', 'HTTP API to container runtime'];

function AnimatedConnector({ visible, label }: { visible: boolean; label: string }) {
	return (
		<Reveal visible={visible} direction="none">
			<div className="flex items-center gap-3 py-2">
				{/* Animated chevrons showing data flow direction */}
				<div className="flex flex-col items-center">
					{[0, 1, 2].map((index) => (
						<motion.div
							key={index}
							animate={visible ? { opacity: [0.2, 0.9, 0.2], y: [0, 2, 0] } : { opacity: 0.2 }}
							transition={{
								duration: 1.4,
								repeat: Infinity,
								delay: index * 0.2,
								ease: 'easeInOut',
							}}
						>
							<ChevronDown className="-my-1 size-4 text-cf-text-muted" strokeWidth={2.5} />
						</motion.div>
					))}
				</div>
				{/* Label pill */}
				<motion.span
					className="
						rounded-full border border-cf-border bg-cf-bg-200 px-3 py-1 font-mono
						text-sm text-cf-text-muted
					"
					initial={{ opacity: 0 }}
					animate={visible ? { opacity: 1 } : { opacity: 0 }}
					transition={{ delay: 0.3, duration: 0.4 }}
				>
					{label}
				</motion.span>
			</div>
		</Reveal>
	);
}

/**
 * Slide: Architecture
 * Steps: 0 = title + Worker layer, 1 = DO layer, 2 = Container layer
 */
export function ArchitectureSlide({ step }: SlideProperties) {
	return (
		<SlideLayout>
			<Reveal visible={step >= 0} direction="left">
				<h2 className="font-sans text-5xl font-semibold tracking-tight text-cf-text">How it works</h2>
				<p className="mt-2 text-xl text-cf-text-muted">Three layers. One SDK.</p>
			</Reveal>

			<div className="mt-6 flex flex-1 items-start justify-center">
				<div className="flex w-full max-w-3xl flex-col items-center">
					{LAYERS.map((layer, index) => {
						const Icon = layer.icon;
						const isVisible = step >= index;
						const isActive = step === index;

						return (
							<div key={layer.label} className="flex w-full flex-col items-center">
								{/* Animated connector between layers */}
								{index > 0 && <AnimatedConnector visible={isVisible} label={CONNECTOR_LABELS[index - 1]} />}

								{/* Layer card */}
								<Reveal visible={isVisible} direction="up" index={0}>
									<motion.div
										className={`
											w-full rounded-2xl border-2 transition-shadow duration-500
											${layer.color}
											${layer.bg}
										`}
										animate={{
											boxShadow: isActive
												? '0 0 0 4px oklch(from currentColor l c h / 12%), 0 8px 24px oklch(from currentColor l c h / 8%)'
												: '0 0 0 0px transparent, 0 1px 3px oklch(from currentColor l c h / 4%)',
										}}
										transition={{ duration: 0.4 }}
									>
										<div className="flex items-center gap-4 px-7 py-5">
											{/* Accent dot */}
											<div
												className={`
													flex size-12 shrink-0 items-center justify-center rounded-xl
													${layer.iconBg}
												`}
											>
												<Icon className="size-6" strokeWidth={1.5} />
											</div>
											<div className="flex-1">
												<div className="text-lg font-semibold">{layer.label}</div>
												<div className="text-sm opacity-60">{layer.desc}</div>
											</div>
											{/* Step indicator */}
											<div
												className={`
													flex size-8 shrink-0 items-center justify-center rounded-full
													font-mono text-xs font-bold transition-colors duration-300
													${isActive ? layer.badgeActive : 'bg-cf-bg-300 text-cf-text-subtle'}
												`}
											>
												{index + 1}
											</div>
										</div>

										{/* Expandable detail section */}
										<motion.div
											className="overflow-hidden"
											initial={false}
											animate={{
												height: isActive ? 'auto' : 0,
												opacity: isActive ? 1 : 0,
											}}
											transition={{
												height: { duration: 0.35, ease: [0.16, 0.77, 0.36, 0.98] },
												opacity: { duration: 0.25, delay: isActive ? 0.1 : 0 },
											}}
										>
											<div className="border-t border-current/10 px-7 py-4">
												<p className="text-base/relaxed opacity-80">{layer.detail}</p>
											</div>
										</motion.div>
									</motion.div>
								</Reveal>
							</div>
						);
					})}
				</div>
			</div>
		</SlideLayout>
	);
}

ArchitectureSlide.steps = 3;
