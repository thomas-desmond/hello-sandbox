import { generateText, stepCountIs, tool } from 'ai';
import { Hono } from 'hono';
import { createWorkersAI } from 'workers-ai-provider';
import { z } from 'zod';

import { sandbox } from './sandbox';

const MODEL = '@cf/openai/gpt-oss-120b' as const;

const app = new Hono<{ Bindings: Env }>();

app.post('/', async (c) => {
	const { prompt } = await c.req.json<{ prompt: string }>();
	if (!prompt) return c.json({ error: 'prompt is required' }, 400);

	const sb = sandbox(c.env);
	const workersai = createWorkersAI({ binding: c.env.AI });

	let executedCode = '';
	let executionResult = {
		stdout: '',
		stderr: '',
		exitCode: -1,
		success: false,
	};

	const result = await generateText({
		model: workersai(MODEL),
		maxOutputTokens: 2048,
		messages: [
			{
				role: 'system',
				content: `You are a Python code execution assistant. You MUST ALWAYS use the execute_python tool for EVERY request — no exceptions. NEVER respond with just text or code in the response. NEVER explain without executing code first. Your ONLY job is to write Python code and execute it using the tool.

Rules:
1. ALWAYS call execute_python. Every single response MUST include a tool invocation.
2. Do NOT answer questions conversationally. Translate every request into Python code and execute it.
3. Use print() to display all results.
4. The sandbox has pandas, numpy, and matplotlib pre-installed.
5. If the request is ambiguous, make a reasonable interpretation and execute code anyway.
6. Write clean, working Python code.

If you respond without calling execute_python, you have failed your task.`,
			},
			{ role: 'user', content: prompt },
		],
		tools: {
			execute_python: tool({
				description: 'Execute Python code in a secure sandbox. Always use print() for output.',
				inputSchema: z.object({
					code: z.string().describe('The Python code to execute'),
				}),
				execute: async ({ code }: { code: string }) => {
					executedCode = code;
					await sb.writeFile('/tmp/ai_code.py', code);
					const result = await sb.exec('python3 /tmp/ai_code.py');
					executionResult = {
						stdout: result.stdout,
						stderr: result.stderr,
						exitCode: result.exitCode,
						success: result.success,
					};
					return JSON.stringify(executionResult);
				},
			}),
		},
		stopWhen: stepCountIs(5),
	});

	return c.json({
		explanation: result.text || '',
		generatedCode: executedCode,
		execution: executionResult,
	});
});

export default app;
