<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';

	let {
		children = () => '',
		href = '#pesquisa',
		text = 'Participar da pesquisa',
		...props
	} = $props();
</script>

<a
	{href}
	class="cta-button"
>
		<ArrowRight size="16" color="white" class="icon" />
	{text}
</a>

<style lang="scss">
	.cta-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1rem;
		padding: 1rem 1.5rem;

		scale: 1;

		background: #84000b;
		box-shadow:
			rgba(0, 0, 0, 0) 0px 0px 0px 0px,
			rgba(0, 0, 0, 0) 0px 0px 0px 0px,
			rgba(0, 0, 0, 0.1) 0px 10px 15px -3px,
			rgba(0, 0, 0, 0.1) 0px 4px 6px -4px;
		color: white;
		text-decoration: none;
		border-radius: 999px;
		font-weight: 500;
		transition: all 0.3s ease;
		cursor: pointer;

		@media (max-width: 800px) {
			scale: 1.3;
			font-size: 0.8rem;
			padding: 1rem;
		}

		.icon {
			width: 1rem;
			height: 1rem;
			flex-shrink: 0;
		}

		&:hover {
			background-color: #ce5065;
			transform: translateY(-2px);
			box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		}

		&:active {
			transform: translateY(0);
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		}

		&:focus {
			outline: 2px solid #ce5065;
			outline-offset: 2px;
		}
	}
</style>
