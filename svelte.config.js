import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-vercel';
import { sveltePreprocess } from 'svelte-preprocess';
// import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: { 
		adapter: adapter(), 
		alias: {
			'$lib/*': './src/*',
		}
	 },
	preprocess: [mdsvex(), 
		sveltePreprocess({
		defaults: {
			style: 'scss',
			script: 'typescript'
		}
	})
	// vitePreprocess()
],
	extensions: ['.svelte', '.svx']
};

export default config;

// import adapter from '@sveltejs/adapter-vercel';
// import { sveltekit } from '@sveltejs/kit/vite';

// /** @type {import('@sveltejs/kit').Config} */
// const config = {
// 	kit: {
// 		adapter: adapter(),
// 		alias: {
// 			'$lib/*': './src',
// 			$types: './src/types'
// 		}
// 	},
// 	preprocess: sveltekit(),
// 	extensions: ['.svelte', '.svx']
// };

// export default config;