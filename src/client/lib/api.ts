export async function api<T>(path: string, body?: Record<string, unknown>): Promise<T> {
	let response: Response;
	try {
		response = await fetch(path, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: body ? JSON.stringify(body) : undefined,
		});
	} catch {
		throw new Error('Network error: unable to reach the server');
	}

	let data: T & { error?: string };
	try {
		data = await response.json();
	} catch {
		throw new Error(`Server error (${response.status}): unexpected non-JSON response`);
	}

	if (!response.ok) {
		throw new Error(data.error ?? `Request failed (${response.status})`);
	}

	return data;
}
