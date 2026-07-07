<script lang="ts">
	import { Check, Image as ImageIcon } from '@lucide/svelte';

	import { formatCurrency } from '$lib/gifts/currency';
	import type { Gift } from '$lib/gifts/types';

	let { gift, onChoose } = $props<{
		gift: Gift;
		onChoose?: (gift: Gift) => void;
	}>();
</script>

<article class:gift-card--unavailable={gift.unavailable} class="gift-card">
	<div class="gift-card-image gift-card-image--public">
		{#if gift.imageUrl}
			<img src={gift.imageUrl} alt={gift.name} />
		{:else}
			<div class="gift-image-placeholder">
				<ImageIcon size={34} />
			</div>
		{/if}

		{#if gift.unavailable}
			<span class="gift-chosen-badge">Escolhido</span>
		{/if}
	</div>

	<div class="gift-card-content">
		<div>
			<h3>{gift.name}</h3>
			{#if gift.category}
				<p class="gift-category">{gift.category}</p>
			{/if}
		</div>
		<p class="gift-public-description">
			{gift.description ||
				(gift.unavailable ? 'Obrigado pelo carinho.' : 'Presente para o novo lar.')}
		</p>
		<div class="gift-card-footer">
			<strong>{formatCurrency(gift.price)}</strong>
			{#if !gift.unavailable && onChoose}
				<button
					class="gift-button gift-button--primary"
					type="button"
					onclick={() => onChoose?.(gift)}
				>
					<Check size={16} />
					Escolher
				</button>
			{/if}
		</div>
	</div>
</article>
