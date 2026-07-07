<script lang="ts">
	import type { Component, Snippet } from 'svelte';

	let {
		icon: Icon,
		title,
		message,
		children
	} = $props<{
		icon: Component<{ size?: number; class?: string }>;
		title?: string;
		message: string;
		children?: Snippet;
	}>();
</script>

<div class="gift-empty-state">
	<Icon size={32} />
	{#if title}
		<h3>{title}</h3>
	{/if}
	<p>{message}</p>
	{@render children?.()}
</div>
