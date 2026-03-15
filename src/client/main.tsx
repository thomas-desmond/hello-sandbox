import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app';
import { ErrorBoundary } from './components/error-boundary';
import './index.css';

createRoot(document.querySelector('#root')!).render(
	<StrictMode>
		<ErrorBoundary label="Application">
			<App />
		</ErrorBoundary>
	</StrictMode>,
);
