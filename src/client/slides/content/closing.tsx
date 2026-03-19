import { ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';

import { Reveal } from '../components/reveal';

import type { SlideProperties } from '../types';

const EASE = [0.16, 1, 0.3, 1] as const;

const LINKS = [
	{ label: 'Documentation', url: 'https://developers.cloudflare.com/sandbox/', desc: 'Guides, API reference, tutorials' },
	{ label: 'GitHub', url: 'https://github.com/cloudflare/sandbox-sdk', desc: 'Source code and examples' },
	{ label: 'sandbox.cloudflare.com', url: 'https://sandbox.cloudflare.com/', desc: 'Product page' },
];

/**
 * Slide 12: Closing / CTA
 * Steps: 0=logo+title+npm, 1=links, 2=QR code
 *
 * Links row always rendered (occupying space) but invisible until step 1 -- no layout shift.
 * QR code appears on step 2, pointing to the current host so audience can try the demo.
 */
export function ClosingSlide({ step }: SlideProperties) {
	const showLinks = step >= 1;
	const showQR = step >= 2;
	const currentHost = globalThis.window === undefined ? '' : globalThis.location.origin;

	return (
		<div
			className="
				relative flex h-screen w-screen items-center justify-center overflow-hidden
				bg-cf-bg-100
			"
		>
			<div className="pointer-events-none absolute inset-0 dot-pattern opacity-20" />
			<div
				className="pointer-events-none absolute inset-0"
				style={{ background: 'radial-gradient(ellipse at 50% 40%, oklch(from #ff4801 l c h / 8%) 0%, transparent 60%)' }}
			/>

			<div className="relative z-10 flex flex-col items-center gap-10">
				<motion.svg
					viewBox="0 0 66 30"
					fill="currentColor"
					className="h-6 w-auto text-cf-orange"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.4 }}
				>
					<path d="M52.688 13.028c-.22 0-.437.008-.654.015a.3.3 0 0 0-.102.024.37.37 0 0 0-.236.255l-.93 3.249c-.401 1.397-.252 2.687.422 3.634.618.876 1.646 1.39 2.894 1.45l5.045.306a.45.45 0 0 1 .435.41.5.5 0 0 1-.025.223.64.64 0 0 1-.547.426l-5.242.306c-2.848.132-5.912 2.456-6.987 5.29l-.378 1a.28.28 0 0 0 .248.382h18.054a.48.48 0 0 0 .464-.35c.32-1.153.482-2.344.48-3.54 0-7.22-5.79-13.072-12.933-13.072M44.807 29.578l.334-1.175c.402-1.397.253-2.687-.42-3.634-.62-.876-1.647-1.39-2.896-1.45l-23.665-.306a.47.47 0 0 1-.374-.199.5.5 0 0 1-.052-.434.64.64 0 0 1 .552-.426l23.886-.306c2.836-.131 5.9-2.456 6.975-5.29l1.362-3.6a.9.9 0 0 0 .04-.477C48.997 5.259 42.789 0 35.367 0c-6.842 0-12.647 4.462-14.73 10.665a6.92 6.92 0 0 0-4.911-1.374c-3.28.33-5.92 3.002-6.246 6.318a7.2 7.2 0 0 0 .18 2.472C4.3 18.241 0 22.679 0 28.133q0 .74.106 1.453a.46.46 0 0 0 .457.402h43.704a.57.57 0 0 0 .54-.418" />
				</motion.svg>

				<motion.h1
					className="font-sans text-7xl font-bold tracking-tight text-cf-text"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, ease: EASE }}
				>
					Get Started
				</motion.h1>

				<motion.div
					className="
						inline-flex items-center gap-3 rounded-full border border-cf-border
						bg-cf-bg-200 px-8 py-4 font-mono text-xl text-cf-text
					"
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
				>
					<span className="text-cf-text-subtle">$</span>
					npm i @cloudflare/sandbox
				</motion.div>

				{/* Always rendered to reserve space; animated via opacity */}
				<motion.div
					className="flex gap-4"
					initial={{ opacity: 0 }}
					animate={{ opacity: showLinks ? 1 : 0 }}
					transition={{ duration: 0.45, ease: EASE }}
					aria-hidden={!showLinks}
					style={{ pointerEvents: showLinks ? 'auto' : 'none' }}
				>
					{LINKS.map((link, index) => (
						<Reveal key={link.label} visible={showLinks} direction="up" index={index}>
							<a
								href={link.url}
								target="_blank"
								rel="noopener noreferrer"
								className="
									flex flex-col gap-1 rounded-xl border border-cf-border bg-cf-bg-200
									px-6 py-4 transition-colors
									hover:border-cf-orange
								"
							>
								<div className="flex items-center gap-2 text-base font-medium text-cf-text">
									{link.label}
									<ExternalLink className="size-3.5 text-cf-text-subtle" />
								</div>
								<div className="text-base text-cf-text-muted">{link.desc}</div>
							</a>
						</Reveal>
					))}
				</motion.div>

				{/* QR code to try the demo -- always rendered for layout, revealed at step 2 */}
				<motion.div
					className="flex flex-col items-center gap-4"
					initial={{ opacity: 0 }}
					animate={{ opacity: showQR ? 1 : 0 }}
					transition={{ duration: 0.45, ease: EASE }}
					aria-hidden={!showQR}
					style={{ pointerEvents: showQR ? 'auto' : 'none' }}
				>
					<Reveal visible={showQR} direction="up">
						<div className="flex flex-col items-center gap-4">
							<div className="rounded-2xl border border-cf-border p-5" style={{ backgroundColor: '#fff' }}>
								<QRCodeSVG value={currentHost} size={200} level="M" />
							</div>
							<p className="text-lg text-cf-text-muted">Scan to try it yourself</p>
							<p className="font-mono text-base text-cf-text-subtle">{currentHost}</p>
						</div>
					</Reveal>
				</motion.div>
			</div>
		</div>
	);
}

ClosingSlide.steps = 3;
