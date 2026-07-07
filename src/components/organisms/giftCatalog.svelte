<script lang="ts">
	import { Gift as GiftIcon, LoaderCircle, Plus, Search } from '@lucide/svelte';

	import type { Gift } from '$lib/gifts/types';

	import GiftEmptyState from '../atoms/giftEmptyState.svelte';
	import GiftManagerCard from '../molecules/giftManagerCard.svelte';

	type StatusFilter = 'all' | 'available' | 'reserved' | 'purchased';

	let {
		gifts,
		loading,
		busyGiftId,
		tokenReady,
		onNewGift,
		onEdit,
		onDelete,
		onTogglePurchased,
		onReleaseReservation
	} = $props<{
		gifts: Gift[];
		loading: boolean;
		busyGiftId: string | null;
		tokenReady: boolean;
		onNewGift: () => void;
		onEdit: (gift: Gift) => void;
		onDelete: (gift: Gift) => void | Promise<void>;
		onTogglePurchased: (gift: Gift) => void | Promise<void>;
		onReleaseReservation: (gift: Gift) => void | Promise<void>;
	}>();

	let searchTerm = $state('');
	let statusFilter = $state<StatusFilter>('all');

	let purchasedCount = $derived(gifts.filter((gift: Gift) => gift.purchase).length);
	let reservedCount = $derived(
		gifts.filter((gift: Gift) => gift.reservation && !gift.purchase).length
	);
	let availableCount = $derived(gifts.filter((gift: Gift) => !gift.unavailable).length);
	let filteredGifts = $derived.by(() => {
		const normalizedSearch = searchTerm.trim().toLowerCase();

		return gifts.filter((gift: Gift) => {
			const matchesSearch =
				!normalizedSearch ||
				gift.name.toLowerCase().includes(normalizedSearch) ||
				gift.category?.toLowerCase().includes(normalizedSearch) ||
				gift.description?.toLowerCase().includes(normalizedSearch);

			if (!matchesSearch) return false;

			if (statusFilter === 'available') return !gift.unavailable;
			if (statusFilter === 'reserved') return Boolean(gift.reservation && !gift.purchase);
			if (statusFilter === 'purchased') return Boolean(gift.purchase);

			return true;
		});
	});
</script>

<section class="gift-workspace">
	<div class="gift-workspace__header">
		<div>
			<p class="gift-eyebrow">Catalogo</p>
			<h2>Presentes</h2>
			<p class="gift-workspace__caption">
				{availableCount} disponiveis, {reservedCount} aguardando confirmacao,
				{purchasedCount} comprados
			</p>
		</div>

		<div class="gift-filters">
			<label class="gift-search-field">
				<Search size={18} />
				<input type="search" placeholder="Buscar presente" bind:value={searchTerm} />
			</label>
			<select bind:value={statusFilter} aria-label="Filtrar status">
				<option value="all">Todos</option>
				<option value="available">Disponiveis</option>
				<option value="reserved">Pendentes</option>
				<option value="purchased">Comprados</option>
			</select>
		</div>
	</div>

	{#if loading}
		<GiftEmptyState icon={LoaderCircle} message="Carregando lista..." />
	{:else if filteredGifts.length === 0}
		<GiftEmptyState
			icon={GiftIcon}
			title={gifts.length === 0 ? 'Sua lista esta vazia' : 'Nenhum presente encontrado'}
			message={gifts.length === 0
				? 'Adicione o primeiro item para montar sua lista.'
				: 'Ajuste a busca ou o filtro selecionado.'}
		>
			<button
				class="gift-button gift-button--primary"
				type="button"
				onclick={onNewGift}
				disabled={!tokenReady}
			>
				<Plus size={18} />
				Novo presente
			</button>
		</GiftEmptyState>
	{:else}
		<div class="gift-grid">
			{#each filteredGifts as gift (gift.id)}
				<GiftManagerCard
					{gift}
					busy={busyGiftId === gift.id}
					disabled={busyGiftId !== null}
					{onEdit}
					{onDelete}
					{onTogglePurchased}
					{onReleaseReservation}
				/>
			{/each}
		</div>
	{/if}
</section>
