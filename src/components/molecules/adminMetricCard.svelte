<script lang="ts">
	export let label: string;
	export let value: string | number;
	export let detail: string;
	export let tone: 'default' | 'warning' = 'default';
</script>

<article class:warning={tone === 'warning'} class="metric-card">
	<div class="metric-top"><span>{label}</span><span class="metric-mark"></span></div>
	<strong>{value}</strong>
	<p>{detail}</p>
</article>

<style lang="scss">
	.metric-card {
		padding: 1.25rem;
		background: #fff;
		border: 1px solid #e8e8e5;
		border-radius: 12px;
		box-shadow: 0 8px 24px rgba(52, 50, 44, 0.04);
	}
	.metric-card.warning {
		border-color: #f1d6b8;
	}
	.metric-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		color: #737a78;
		font-size: 0.78rem;
		font-weight: 600;
	}
	.metric-mark {
		width: 0.55rem;
		height: 0.55rem;
		border-radius: 50%;
		background: #cc8799;
	}
	.warning .metric-mark {
		background: #d69552;
	}
	strong {
		display: block;
		margin-top: 0.85rem;
		color: #26322f;
		font-size: 2rem;
		letter-spacing: -0.04em;
	}
	p {
		margin-top: 0.35rem;
		color: #858c89;
		font-size: 0.75rem;
	}
</style>
