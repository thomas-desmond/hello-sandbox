/**
 * Central API router — mounts all sub-routers under /api
 */
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import ai from './ai';
import backup from './backup';
import exec from './exec';
import files from './files';
import interpreter from './interpreter';
import preview from './preview';
import watch from './watch';

const api = new Hono<{ Bindings: Env }>();

api.use('/*', cors());

// Mount sub-routers
api.route('/exec', exec);
api.route('/files', files);
api.route('/code', interpreter);
api.route('/ai', ai);
api.route('/preview', preview);
api.route('/watch', watch);
api.route('/backup', backup);

// Health / status
api.get('/status', (c) =>
	c.json({
		sandbox: 'demo-sandbox',
		status: 'ready',
		features: ['exec', 'files', 'code-interpreter', 'ai', 'terminal', 'preview', 'watch', 'backup'],
	}),
);

export default api;
