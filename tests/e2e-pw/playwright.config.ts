import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

/**
 * NavSweeper end-to-end + accessibility tests.
 *
 *   bun run test:e2e
 *
 * Expects the wp-env site (bun run start) — it is started if not reachable.
 * Every test seeds its own menu through the REST API, so specs are isolated
 * and can run in parallel.
 *
 * Specs are plain JS (with JSDoc types): when Playwright runs under Bun, its
 * TypeScript transform is bypassed for test files. Shared helpers can be TS.
 */
const baseURL = process.env.WP_BASE_URL ?? 'http://localhost:8888';

export default defineConfig( {
	testDir: './specs',
	fullyParallel: true,
	forbidOnly: !! process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: [
		[ 'list' ],
		[ 'html', { open: 'never', outputFolder: 'playwright-report' } ],
	],
	outputDir: 'test-results',
	use: {
		baseURL,
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
	},
	projects: [
		{
			name: 'setup',
			testMatch: /auth\.setup\.js/,
		},
		{
			name: 'desktop',
			use: {
				...devices[ 'Desktop Chrome' ],
				storageState: path.resolve( __dirname, '.auth/admin.json' ),
			},
			dependencies: [ 'setup' ],
		},
	],
	webServer: {
		command: 'bun run start',
		url: baseURL,
		reuseExistingServer: true,
		timeout: 300_000,
	},
} );
