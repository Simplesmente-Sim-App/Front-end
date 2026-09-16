<script lang="ts">
	let { children } = $props();
</script>

<div class="container">
	{@render children?.()}
</div>

<style lang="scss">
	.container {
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 24px;
	}
</style>
