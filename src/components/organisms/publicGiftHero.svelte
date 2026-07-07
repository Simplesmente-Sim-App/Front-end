<script lang="ts">
	import { Heart } from '@lucide/svelte';

	import type { GiftListMeta } from '$lib/gifts/types';

	import GiftBrand from '../atoms/giftBrand.svelte';

	let { meta, availableCount, unavailableCount } = $props<{
		meta: GiftListMeta;
		availableCount: number;
		unavailableCount: number;
	}>();
</script>

<header class="public-gifts-hero">
	<GiftBrand />

	<div class="public-gifts-hero__content">
		<div class="gift-hero-icon"><Heart size={28} /></div>
		<p class="gift-eyebrow">Lista de presentes</p>
		<h1>{meta.coupleNames}</h1>
		<p class="public-gifts-hero__message">{meta.message}</p>
		<div class="public-gifts-hero__stats" aria-label="Resumo da lista">
			<span class="gift-public-stat">{availableCount} disponiveis</span>
			<span class="gift-public-stat">{unavailableCount} escolhidos</span>
		</div>
	</div>
</header>
