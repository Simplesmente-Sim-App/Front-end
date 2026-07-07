<script lang="ts">
	import { formatCurrency } from '$lib/gifts/currency';

	import GiftMetric from '../molecules/giftMetric.svelte';

	let { totalCount, purchasedCount, reservedCount, receivedValue, totalValue, listConfigured } =
		$props<{
			totalCount: number;
			purchasedCount: number;
			reservedCount: number;
			receivedValue: number;
			totalValue: number;
			listConfigured: boolean;
		}>();
</script>

<section class="gift-panel gift-summary-panel">
	<div class="gift-panel__header">
		<div>
			<p class="gift-eyebrow">Resumo</p>
			<h2>Presentes e recebimentos</h2>
		</div>
		<span class:gift-publish-status--ready={listConfigured} class="gift-publish-status">
			{listConfigured ? 'Publicada' : 'Nao publicada'}
		</span>
	</div>

	<div class="gift-metrics">
		<GiftMetric value={totalCount} label="presentes" />
		<GiftMetric value={purchasedCount} label="comprados" />
		<GiftMetric value={reservedCount} label="pendentes" />
		<GiftMetric
			value={formatCurrency(receivedValue)}
			label={`recebido de ${formatCurrency(totalValue)}`}
			wide
		/>
	</div>
</section>
