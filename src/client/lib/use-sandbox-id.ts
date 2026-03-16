import { useState, useEffect } from 'react';

let cachedId: string | undefined;

/**
 * Returns the per-user sandbox ID assigned by the backend cookie middleware.
 * Fetches from `/api/status` once and caches the result for the session.
 */
export function useSandboxId(): string | undefined {
	const [sandboxId, setSandboxId] = useState(cachedId);

	useEffect(() => {
		if (cachedId) return;

		let cancelled = false;
		void fetch('/api/status')
			.then((r) => r.json())
			.then((data: { sandbox: string }) => {
				if (cancelled) return;
				cachedId = data.sandbox;
				setSandboxId(data.sandbox);
			});

		return () => {
			cancelled = true;
		};
	}, []);

	return sandboxId;
}
