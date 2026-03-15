import type { ReactNode } from 'react';

const KEYWORDS = new Set([
	'const',
	'let',
	'var',
	'await',
	'async',
	'import',
	'from',
	'export',
	'return',
	'new',
	'type',
	'interface',
	'if',
	'else',
	'for',
	'of',
]);

const FUNCTIONS = new Set([
	'getSandbox',
	'exec',
	'writeFile',
	'readFile',
	'mkdir',
	'listFiles',
	'deleteFile',
	'runCode',
	'createCodeContext',
	'startProcess',
	'exposePort',
	'unexposePort',
	'watch',
	'createBackup',
	'restoreBackup',
	'terminal',
	'exists',
	'generateText',
	'tool',
	'stepCountIs',
	'createWorkersAI',
	'waitForPort',
	'getExposedPorts',
	'parseSSEStream',
]);

export function highlightTS(code: string): ReactNode[] {
	const tokens: ReactNode[] = [];
	let index = 0;
	let key = 0;

	while (index < code.length) {
		const ch = code[index];

		// Line comment
		if (ch === '/' && code[index + 1] === '/') {
			const end = code.indexOf('\n', index);
			const slice = end === -1 ? code.slice(index) : code.slice(index, end);
			tokens.push(
				<span key={key++} className="text-cf-text-subtle italic">
					{slice}
				</span>,
			);
			index += slice.length;
			continue;
		}

		// String
		if (ch === "'" || ch === '"' || ch === '`') {
			let index_ = index + 1;
			while (index_ < code.length && code[index_] !== ch) {
				if (code[index_] === '\\') index_++;
				index_++;
			}
			index_++;
			tokens.push(
				<span key={key++} className="text-cf-success">
					{code.slice(index, index_)}
				</span>,
			);
			index = index_;
			continue;
		}

		// Word
		if (/[a-zA-Z_$]/.test(ch)) {
			let index_ = index + 1;
			while (index_ < code.length && /[a-zA-Z0-9_$]/.test(code[index_])) index_++;
			const word = code.slice(index, index_);
			if (KEYWORDS.has(word)) {
				tokens.push(
					<span key={key++} className="text-cf-ai">
						{word}
					</span>,
				);
			} else if (FUNCTIONS.has(word)) {
				tokens.push(
					<span key={key++} className="text-cf-orange">
						{word}
					</span>,
				);
			} else {
				tokens.push(<span key={key++}>{word}</span>);
			}
			index = index_;
			continue;
		}

		// Number
		if (/[0-9]/.test(ch)) {
			let index_ = index + 1;
			while (index_ < code.length && /[0-9._]/.test(code[index_])) index_++;
			tokens.push(
				<span key={key++} className="text-cf-warning">
					{code.slice(index, index_)}
				</span>,
			);
			index = index_;
			continue;
		}

		tokens.push(<span key={key++}>{ch}</span>);
		index++;
	}

	return tokens;
}
