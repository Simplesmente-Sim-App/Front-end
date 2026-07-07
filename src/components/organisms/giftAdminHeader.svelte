<script lang="ts">
	import { LoaderCircle, Plus, RefreshCcw } from '@lucide/svelte';

	import GiftBrand from '../atoms/giftBrand.svelte';

	let { coupleNames, loading, tokenReady, onRefresh, onNewGift } = $props<{
		coupleNames: string;
		loading: boolean;
		tokenReady: boolean;
		onRefresh: () => void | Promise<void>;
		onNewGift: () => void;
	}>();
</script>

<header class="gift-admin-header">
	<div>
		<div class="gift-admin-header__brand">
			<GiftBrand />
		</div>
		<p class="gift-eyebrow">Casamento</p>
		<h1>Lista de presentes</h1>
		<p class="gift-admin-header__subtitle">{coupleNames || 'Para o novo lar'}</p>
	</div>

	<div class="gift-admin-header__actions">
		<button
			class="gift-button gift-button--secondary"
			type="button"
			onclick={() => void onRefresh()}
			disabled={loading}
		>
			{#if loading}
				<LoaderCircle class="gift-spin" size={18} />
			{:else}
				<RefreshCcw size={18} />
			{/if}
			Atualizar
		</button>
		<button
			class="gift-button gift-button--primary"
			type="button"
			onclick={onNewGift}
			disabled={loading || !tokenReady}
		>
			<Plus size={18} />
			Novo presente
		</button>
	</div>
</header>
