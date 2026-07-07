<script lang="ts">
	import { Gift as GiftIcon, LoaderCircle } from '@lucide/svelte';

	import type { Gift } from '$lib/gifts/types';

	import GiftEmptyState from '../atoms/giftEmptyState.svelte';
	import GiftPublicCard from '../molecules/giftPublicCard.svelte';

	let {
		title,
		eyebrow,
		gifts,
		loading = false,
		emptyMessage,
		onChoose
	} = $props<{
		title: string;
		eyebrow: string;
		gifts: Gift[];
		loading?: boolean;
		emptyMessage: string;
		onChoose?: (gift: Gift) => void;
	}>();
</script>

<section class="gift-public-section">
	<div class="gift-public-heading">
		<div>
			<p class="gift-eyebrow">{eyebrow}</p>
			<h2>{title}</h2>
		</div>
		<span>{gifts.length} itens</span>
	</div>

	{#if loading}
		<GiftEmptyState icon={LoaderCircle} message="Carregando lista..." />
	{:else if gifts.length === 0}
		<GiftEmptyState icon={GiftIcon} message={emptyMessage} />
	{:else}
		<div class="gift-public-grid">
			{#each gifts as gift (gift.id)}
				<GiftPublicCard {gift} {onChoose} />
			{/each}
		</div>
	{/if}
</section>
