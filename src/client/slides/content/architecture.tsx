import { ChevronDown, Code, Database, TerminalSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Reveal } from '../components/reveal';
import { SlideLayout } from '../components/slide-layout';

import type { SlideProperties } from '../types';
import type { ReactNode } from 'react';

const EASE = [0.16, 0.77, 0.36, 0.98] as const;

const LAYERS = [
	{
		icon: Code,
		label: 'Your Worker',
		desc: 'Client SDK',
		color: 'border-cf-orange',
		textColor: 'text-cf-orange',
		bg: 'bg-cf-orange/10',
		iconBg: 'bg-cf-orange/10',
		badgeActive: 'bg-cf-orange text-[#fff]',
		detail: 'Type-safe TypeScript interface for all sandbox operations — exec, file I/O, code execution, and port exposure.',
	},
	{
		icon: Database,
		label: 'Durable Object',
		desc: 'Lifecycle & routing',
		color: 'border-cf-info',
		textColor: 'text-cf-info',
		bg: 'bg-cf-info/10',
		iconBg: 'bg-cf-info/10',
		badgeActive: 'bg-cf-info text-[#fff]',
		detail: 'Same sandbox ID always routes to the same instance. Manages lifecycle, geo-distribution, and scaling.',
	},
	{
		icon: TerminalSquare,
		label: 'Container',
		desc: 'Isolated Linux environment',
		color: 'border-cf-success',
		textColor: 'text-cf-success',
		bg: 'bg-cf-success/10',
		iconBg: 'bg-cf-success/10',
		badgeActive: 'bg-cf-success text-[#fff]',
		detail: 'Full Ubuntu VM with Python, Node.js, and Git. Sleeps after inactivity, wakes on demand.',
	},
];

const CONNECTOR_LABELS = ['RPC call via Durable Object stub', 'HTTP API to container runtime'];

/* ── Diagrams ── */

/** Workers: Globe with radiating edge locations connected by dashed lines */
function WorkersDiagram() {
	const edges = [
		{ label: 'FRA', angle: -45, r: 46, labelBelow: true },
		{ label: 'NRT', angle: 15, r: 48, labelBelow: false },
		{ label: 'IAD', angle: -120, r: 45, labelBelow: false },
		{ label: 'GRU', angle: -165, r: 44, labelBelow: true },
		{ label: 'SYD', angle: 50, r: 45, labelBelow: false },
		{ label: 'SIN', angle: 80, r: 44, labelBelow: false },
	];

	const cx = 90;
	const cy = 55;
	const globeR = 20;

	return (
		<div>
			<svg viewBox="0 0 180 112" className="mx-auto w-full max-w-[260px]" fill="none">
				{/* Outer glow */}
				<motion.circle
					cx={cx}
					cy={cy}
					r={globeR + 5}
					className="fill-cf-orange/5"
					initial={{ scale: 0, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
					style={{ transformOrigin: `${cx}px ${cy}px` }}
				/>

				{/* Globe outline */}
				<motion.circle
					cx={cx}
					cy={cy}
					r={globeR}
					className="stroke-cf-orange/30"
					strokeWidth={1.5}
					initial={{ scale: 0, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.4, ease: EASE, delay: 0.2 }}
					style={{ transformOrigin: `${cx}px ${cy}px` }}
				/>
				{/* Equator ellipse */}
				<motion.ellipse
					cx={cx}
					cy={cy}
					rx={globeR}
					ry={8}
					className="stroke-cf-orange/15"
					strokeWidth={0.75}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3, delay: 0.3 }}
				/>
				{/* Meridian */}
				<motion.ellipse
					cx={cx}
					cy={cy}
					rx={8}
					ry={globeR}
					className="stroke-cf-orange/15"
					strokeWidth={0.75}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3, delay: 0.3 }}
				/>

				{/* Connection lines + edge dots */}
				{edges.map((edge, index) => {
					const rad = (edge.angle * Math.PI) / 180;
					const ex = cx + Math.cos(rad) * edge.r;
					const ey = cy + Math.sin(rad) * edge.r;
					const labelY = edge.labelBelow ? ey + 12 : ey - 8;

					return (
						<motion.g
							key={edge.label}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.4, ease: EASE, delay: 0.35 + index * 0.07 }}
						>
							{/* Animated connection line */}
							<motion.line
								x1={cx + Math.cos(rad) * (globeR + 5)}
								y1={cy + Math.sin(rad) * (globeR + 5)}
								x2={ex}
								y2={ey}
								className="stroke-cf-orange/25"
								strokeWidth={1}
								strokeDasharray="3 3"
								initial={{ pathLength: 0, opacity: 0 }}
								animate={{ pathLength: 1, opacity: 1 }}
								transition={{ duration: 0.5, ease: EASE, delay: 0.3 + index * 0.07 }}
							/>
							{/* Pulse ring */}
							<motion.circle
								cx={ex}
								cy={ey}
								r={7}
								className="fill-cf-orange/6"
								animate={{ r: [5, 9, 5], opacity: [0.25, 0.08, 0.25] }}
								transition={{ duration: 3, repeat: Infinity, delay: index * 0.4 }}
							/>
							{/* Dot */}
							<circle cx={ex} cy={ey} r={3} className="fill-cf-orange" />
							{/* Label */}
							<text
								x={ex}
								y={labelY}
								textAnchor="middle"
								className="fill-cf-text-subtle"
								style={{ fontSize: '9px', fontFamily: 'var(--font-mono)' }}
							>
								{edge.label}
							</text>
						</motion.g>
					);
				})}
			</svg>

			<div className="mt-2 text-center font-mono text-xs text-cf-text-subtle">300+ edge locations worldwide</div>
		</div>
	);
}

/** Durable Objects: SVG flow diagram with curved paths converging */
function DurableObjectsDiagram() {
	const svgW = 300;
	const svgH = 130;
	const leftX = 55;
	const rightX = 240;
	const doY = 65;
	const requestYs = [25, 65, 105];
	const labels = ['user-a', 'user-b', 'user-c'];

	return (
		<div>
			<svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" fill="none">
				{/* Curved flow paths */}
				{requestYs.map((y, index) => {
					const path = `M ${leftX + 38} ${y} C ${leftX + 90} ${y}, ${rightX - 90} ${doY}, ${rightX - 40} ${doY}`;
					return (
						<g key={index}>
							{/* Path definition (hidden, for animateMotion) */}
							<path id={`do-path-${index}`} d={path} fill="none" stroke="none" />
							{/* Visible dashed path */}
							<motion.path
								d={path}
								className="stroke-cf-info/25"
								strokeWidth={1.5}
								strokeDasharray="4 4"
								initial={{ pathLength: 0, opacity: 0 }}
								animate={{ pathLength: 1, opacity: 1 }}
								transition={{ duration: 0.5, ease: EASE, delay: 0.3 + index * 0.1 }}
							/>
							{/* Traveling dot — opacity="0" hides it before animateMotion begins */}
							<circle r={2.5} className="fill-cf-info" opacity="0">
								<animateMotion dur="2.5s" repeatCount="indefinite" begin={`${0.8 + index * 0.5}s`}>
									<mpath href={`#do-path-${index}`} />
								</animateMotion>
								<animate
									attributeName="opacity"
									values="0;1;1;0"
									dur="2.5s"
									repeatCount="indefinite"
									begin={`${0.8 + index * 0.5}s`}
									fill="freeze"
								/>
							</circle>
						</g>
					);
				})}

				{/* Request source labels */}
				{labels.map((label, index) => (
					<motion.g
						key={label}
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.3, ease: EASE, delay: 0.2 + index * 0.08 }}
					>
						<rect
							x={leftX - 38}
							y={requestYs[index] - 10}
							width={76}
							height={20}
							rx={5}
							className="fill-cf-bg-300 stroke-cf-border"
							strokeWidth={0.75}
						/>
						<text
							x={leftX}
							y={requestYs[index] + 4}
							textAnchor="middle"
							className="fill-cf-text-subtle"
							style={{ fontSize: '10px', fontFamily: 'var(--font-mono)' }}
						>
							{label}
						</text>
					</motion.g>
				))}

				{/* DO instance box */}
				<motion.g
					initial={{ opacity: 0, scale: 0.85 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.4, ease: EASE, delay: 0.5 }}
					style={{ transformOrigin: `${rightX}px ${doY}px` }}
				>
					<rect
						x={rightX - 38}
						y={doY - 38}
						width={76}
						height={76}
						rx={14}
						className="fill-cf-info/8 stroke-cf-info/30"
						strokeWidth={1.5}
					/>
					<text
						x={rightX}
						y={doY - 10}
						textAnchor="middle"
						className="fill-cf-info"
						style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}
					>
						Durable
					</text>
					<text
						x={rightX}
						y={doY + 4}
						textAnchor="middle"
						className="fill-cf-info"
						style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}
					>
						Object
					</text>
					{/* Badges */}
					<rect x={rightX - 28} y={doY + 12} width={24} height={14} rx={3} className="fill-cf-info/10" />
					<text
						x={rightX - 16}
						y={doY + 23}
						textAnchor="middle"
						className="fill-cf-info/70"
						style={{ fontSize: '8.5px', fontFamily: 'var(--font-mono)' }}
					>
						state
					</text>
					<rect x={rightX + 4} y={doY + 12} width={24} height={14} rx={3} className="fill-cf-info/10" />
					<text
						x={rightX + 16}
						y={doY + 23}
						textAnchor="middle"
						className="fill-cf-info/70"
						style={{ fontSize: '8.5px', fontFamily: 'var(--font-mono)' }}
					>
						SQL
					</text>
				</motion.g>

				{/* "same ID" convergence label */}
				<motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ duration: 0.3, delay: 0.6 }}>
					<rect x={(leftX + rightX) / 2 - 28} y={svgH - 18} width={56} height={16} rx={8} className="fill-cf-info/8" />
					<text
						x={(leftX + rightX) / 2}
						y={svgH - 7}
						textAnchor="middle"
						className="fill-cf-info"
						style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 500 }}
					>
						same ID
					</text>
				</motion.g>
			</svg>

			<div className="mt-2 text-center font-mono text-xs text-cf-text-subtle">All requests with the same ID reach one instance</div>
		</div>
	);
}

/** Containers: Environment box + lifecycle state machine */
function ContainersDiagram() {
	const tools = [
		{ name: 'Python 3', mono: 'py' },
		{ name: 'Node 20', mono: 'js' },
		{ name: 'Git', mono: 'git' },
		{ name: 'Bash', mono: 'sh' },
	];

	const lifecycle = [
		{ label: 'Request', fg: 'text-cf-text-subtle', bg: 'bg-cf-bg-300', ring: 'ring-cf-border' },
		{ label: 'Boot', fg: 'text-cf-success', bg: 'bg-cf-success/10', ring: 'ring-cf-success/30' },
		{ label: 'Running', fg: 'text-cf-success', bg: 'bg-cf-success/15', ring: 'ring-cf-success/40' },
		{ label: 'Idle', fg: 'text-cf-warning', bg: 'bg-cf-warning/10', ring: 'ring-cf-warning/30' },
		{ label: 'Sleep', fg: 'text-cf-text-subtle', bg: 'bg-cf-bg-300', ring: 'ring-cf-border' },
	];

	return (
		<div className="flex flex-col gap-5">
			{/* Container environment box */}
			<motion.div
				className="rounded-xl border-2 border-dashed border-cf-success/30 p-4"
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.35, ease: EASE, delay: 0.2 }}
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<TerminalSquare className="size-4 text-cf-success" strokeWidth={1.5} />
						<span className="font-mono text-sm font-semibold text-cf-success">Isolated Linux VM</span>
					</div>
					<span
						className="
							rounded-full bg-cf-success/10 px-2.5 py-0.5 font-mono text-[11px]
							text-cf-success
						"
					>
						/workspace
					</span>
				</div>

				{/* Tool grid */}
				<div className="mt-3 grid grid-cols-4 gap-2">
					{tools.map((tool, index) => (
						<motion.div
							key={tool.name}
							className="
								flex flex-col items-center gap-1.5 rounded-lg border border-cf-border/40
								bg-cf-bg-100 py-2.5
							"
							initial={{ opacity: 0, y: 6 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.25, ease: EASE, delay: 0.35 + index * 0.07 }}
						>
							<span className="font-mono text-sm font-bold text-cf-text-subtle">{tool.mono}</span>
							<span className="font-mono text-[11px] text-cf-text-subtle">{tool.name}</span>
						</motion.div>
					))}
				</div>
			</motion.div>

			{/* Lifecycle state machine */}
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, ease: EASE, delay: 0.6 }}>
				<div
					className="
						mb-2.5 font-mono text-[11px] font-medium tracking-wider
						text-cf-text-subtle uppercase
					"
				>
					Lifecycle
				</div>
				<div className="flex items-center gap-1.5">
					{lifecycle.map((state, index) => (
						<motion.div
							key={state.label}
							className="flex items-center gap-1.5"
							initial={{ opacity: 0, x: -8 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.25, ease: EASE, delay: 0.65 + index * 0.08 }}
						>
							<span
								className={`
									rounded-md px-2.5 py-1 font-mono text-[11px] font-medium ring-1
									${state.bg}
									${state.fg}
									${state.ring}
								`}
							>
								{state.label}
							</span>
							{index < lifecycle.length - 1 && (
								<motion.span
									className="font-mono text-xs text-cf-border"
									animate={{ opacity: [0.3, 0.8, 0.3] }}
									transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2 }}
								>
									›
								</motion.span>
							)}
						</motion.div>
					))}
				</div>
				<motion.div
					className="mt-2 flex items-center gap-1.5 pl-0.5"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3, delay: 1.1 }}
				>
					<span className="font-mono text-xs text-cf-text-subtle">↩ resumes instantly on next request</span>
				</motion.div>
			</motion.div>
		</div>
	);
}

const CONTEXT_CARDS: {
	title: string;
	subtitle: string;
	detail: string;
	accent: string;
	diagram: () => ReactNode;
}[] = [
	{
		title: 'Cloudflare Workers',
		subtitle: 'Serverless compute at the edge',
		detail:
			'Serverless functions distributed across 300+ cities. Your code runs milliseconds from users with no cold starts. The Sandbox SDK runs inside your Worker and provides the high-level API for all sandbox operations.',
		accent: 'border-l-cf-orange',
		diagram: WorkersDiagram,
	},
	{
		title: 'Durable Objects',
		subtitle: 'Stateful singletons with identity',
		detail:
			"Unique, named instances on Cloudflare's network. Each sandbox ID maps to exactly one Durable Object, giving sandboxes persistent identity, consistent state, and automatic placement close to users.",
		accent: 'border-l-cf-info',
		diagram: DurableObjectsDiagram,
	},
	{
		title: 'Containers',
		subtitle: 'Isolated Linux environments',
		detail:
			'Full Linux VMs with strong isolation. Each sandbox gets its own environment with Python, Node.js, and Git. They sleep after inactivity and resume instantly on the next request.',
		accent: 'border-l-cf-success',
		diagram: ContainersDiagram,
	},
];

function AnimatedConnector({ visible, label }: { visible: boolean; label: string }) {
	return (
		<Reveal visible={visible} direction="none">
			<div className="flex items-center gap-3 py-2">
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
 *
 * Two-column layout:
 *   Left  — the three-layer stack diagram (Worker -> DO -> Container)
 *   Right — a context card (vertically centered) that slides out/in from
 *           the right on each step, with a diagram and explanation of
 *           the Cloudflare platform primitive behind each layer.
 *
 * Steps: 0 = Worker layer, 1 = DO layer, 2 = Container layer
 */
export function ArchitectureSlide({ step }: SlideProperties) {
	const contextCard = CONTEXT_CARDS[Math.min(step, CONTEXT_CARDS.length - 1)];
	const Diagram = contextCard.diagram;

	return (
		<SlideLayout>
			<Reveal visible={step >= 0} direction="left">
				<h2 className="font-sans text-5xl font-semibold tracking-tight text-cf-text">How it works</h2>
				<p className="mt-2 text-xl text-cf-text-muted">Three layers. One SDK.</p>
			</Reveal>

			<div className="mt-10 flex flex-1 items-start gap-16">
				{/* Left column: Architecture stack */}
				<div className="flex w-1/2 shrink-0 flex-col items-center">
					{LAYERS.map((layer, index) => {
						const Icon = layer.icon;
						const isVisible = step >= index;
						const isActive = step === index;

						return (
							<div key={layer.label} className="flex w-full flex-col items-center">
								{index > 0 && <AnimatedConnector visible={isVisible} label={CONNECTOR_LABELS[index - 1]} />}

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
											<div
												className={`
													flex size-12 shrink-0 items-center justify-center rounded-xl
													${layer.iconBg}
												`}
											>
												<Icon
													className={`
														size-6
														${layer.textColor}
													`}
													strokeWidth={1.5}
												/>
											</div>
											<div className="flex-1">
												<div className="text-lg font-semibold text-cf-text">{layer.label}</div>
												<div className="text-sm text-cf-text-muted">{layer.desc}</div>
											</div>
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

										<motion.div
											className="overflow-hidden"
											initial={false}
											animate={{
												height: isActive ? 'auto' : 0,
												opacity: isActive ? 1 : 0,
											}}
											transition={{
												height: { duration: 0.35, ease: EASE },
												opacity: { duration: 0.25, delay: isActive ? 0.1 : 0 },
											}}
										>
											<div className="border-t border-cf-border/30 px-7 py-4">
												<p className="text-base/relaxed text-cf-text-muted">{layer.detail}</p>
											</div>
										</motion.div>
									</motion.div>
								</Reveal>
							</div>
						);
					})}
				</div>

				{/* Right column: Context card — vertically centered, slides from right */}
				<div className="flex w-1/2 shrink-0 self-center overflow-hidden pr-4">
					<AnimatePresence mode="wait">
						<motion.div
							key={step}
							className={`
								w-full rounded-2xl border border-l-4 border-cf-border bg-cf-bg-200 p-8
								${contextCard.accent}
							`}
							initial={{ opacity: 0, x: 60 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 60 }}
							transition={{ duration: 0.4, ease: EASE }}
						>
							<h3 className="text-2xl font-semibold text-cf-text">{contextCard.title}</h3>
							<p className="mt-1 font-mono text-sm text-cf-text-subtle">{contextCard.subtitle}</p>

							<div className="mt-6 rounded-xl border border-cf-border/50 bg-cf-bg-100 p-5">
								<Diagram />
							</div>

							<motion.p
								className="mt-6 text-base/relaxed text-cf-text-muted"
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.35, ease: EASE, delay: 0.15 }}
							>
								{contextCard.detail}
							</motion.p>

							<div className="mt-6 flex gap-2">
								{CONTEXT_CARDS.map((_, index) => (
									<motion.div
										key={index}
										className="h-1 rounded-full"
										animate={{
											width: step === index ? 32 : 8,
											backgroundColor: step === index ? 'var(--color-cf-orange)' : 'var(--color-cf-border)',
										}}
										transition={{ duration: 0.35, ease: EASE }}
									/>
								))}
							</div>
						</motion.div>
					</AnimatePresence>
				</div>
			</div>
		</SlideLayout>
	);
}

ArchitectureSlide.steps = 3;
