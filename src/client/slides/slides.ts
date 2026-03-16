import { AISlide } from './content/ai';
import { ArchitectureSlide } from './content/architecture';
import { BackupSlide } from './content/backup';
import { ClosingSlide } from './content/closing';
import { CommandsSlide } from './content/commands';
import { FilesSlide } from './content/files';
import { InterpreterSlide } from './content/interpreter';
import { OpencodeSlide } from './content/opencode';
import { PreviewSlide } from './content/preview';
import { TerminalSlide } from './content/terminal';
import { TitleSlide } from './content/title';
import { WatchSlide } from './content/watch';

import type { SlideDefinition } from './types';

export const SLIDES: SlideDefinition[] = [
	{ id: 'title', title: 'Sandbox SDK', component: TitleSlide, steps: TitleSlide.steps },
	{ id: 'architecture', title: 'How it Works', component: ArchitectureSlide, steps: ArchitectureSlide.steps },
	{ id: 'commands', title: 'Execute Commands', component: CommandsSlide, steps: CommandsSlide.steps },
	{ id: 'files', title: 'File System', component: FilesSlide, steps: FilesSlide.steps },
	{ id: 'interpreter', title: 'Code Interpreter', component: InterpreterSlide, steps: InterpreterSlide.steps },
	{ id: 'ai', title: 'AI Code Execution', component: AISlide, steps: AISlide.steps },
	{ id: 'terminal', title: 'Interactive Terminal', component: TerminalSlide, steps: TerminalSlide.steps },
	{ id: 'preview', title: 'Preview URLs', component: PreviewSlide, steps: PreviewSlide.steps },
	{ id: 'watch', title: 'File Watching', component: WatchSlide, steps: WatchSlide.steps },
	{ id: 'opencode', title: 'AI Coding Agents', component: OpencodeSlide, steps: OpencodeSlide.steps },
	{ id: 'backup', title: 'Backup & Restore', component: BackupSlide, steps: BackupSlide.steps },
	{ id: 'closing', title: 'Get Started', component: ClosingSlide, steps: ClosingSlide.steps },
];
