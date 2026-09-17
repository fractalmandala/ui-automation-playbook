import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// The playground deliberately lives *beside* the pipeline rather than inside it:
// it consumes generated artifacts the same way a real app would, through
// aliases, so nothing in the demo is special-cased by the generator.
const pipeline = resolve(process.cwd(), '../pipeline');

export default defineConfig({
	plugins: [svelte()],
	// bits-ui ships uncompiled .svelte parts. esbuild's dependency pre-bundler has
	// no loader for them, so the library has to stay out of the optimizer and be
	// transformed by the Svelte plugin on request instead.
	optimizeDeps: {
		exclude: ['bits-ui']
	},
	resolve: {
		alias: {
			$generated: resolve(pipeline, 'generated'),
			$pipeline: pipeline
		}
	},
	server: {
		fs: {
			// generated/ and report.json are outside this package's root.
			allow: [resolve(process.cwd(), '..')]
		},
		host: '127.0.0.1',
		port: 5273
	}
});
