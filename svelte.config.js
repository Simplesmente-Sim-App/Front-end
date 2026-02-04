import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-vercel';
import { sveltePreprocess } from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: { adapter: adapter() },
	preprocess: [mdsvex(), sveltePreprocess({
		defaults: {
			style: 'scss',
			script: 'typescript'
		}
	})],
	extensions: ['.svelte', '.svx']
};

export default config;
