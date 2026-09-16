<script lang="ts">
	export let status: string;
	const labels: Record<string, string> = {
		ACTIVE: 'Ativo',
		INACTIVE: 'Inativo',
		ARCHIVED: 'Arquivado',
		OK: 'Normal',
		ERROR: 'Atenção'
	};
</script>

<span class={`status status--${status.toLowerCase()}`}
	><span class="dot"></span>{labels[status] ?? status}</span
>

<style lang="scss">
	.status {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		width: fit-content;
		padding: 0.35rem 0.65rem;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 600;
		color: #50605c;
		background: #eef2ef;
	}
	.dot {
		width: 0.4rem;
		height: 0.4rem;
		border-radius: 50%;
		background: currentColor;
	}
	.status--active,
	.status--ok {
		color: #35715a;
		background: #e4f1e8;
	}
	.status--inactive,
	.status--error {
		color: #9a5b29;
		background: #fff0dc;
	}
	.status--archived {
		color: #747d82;
		background: #edf0f1;
	}
</style>
