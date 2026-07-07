<script lang="ts">
	import { Check, Image as ImageIcon, LoaderCircle, Pencil, Trash2, Unlock } from '@lucide/svelte';

	import { formatCurrency } from '$lib/gifts/currency';
	import type { Gift } from '$lib/gifts/types';

	let { gift, busy, disabled, onEdit, onDelete, onTogglePurchased, onReleaseReservation } = $props<{
		gift: Gift;
		busy: boolean;
		disabled: boolean;
		onEdit: (gift: Gift) => void;
		onDelete: (gift: Gift) => void | Promise<void>;
		onTogglePurchased: (gift: Gift) => void | Promise<void>;
		onReleaseReservation: (gift: Gift) => void | Promise<void>;
	}>();

	let bought = $derived(Boolean(gift.purchase));
	let reserved = $derived(Boolean(gift.reservation && !gift.purchase));
	let status = $derived(bought ? 'Comprado' : reserved ? 'Pagamento informado' : 'Disponivel');
	let description = $derived.by(() => {
		if (gift.purchase?.buyerName) return `Presenteado por ${gift.purchase.buyerName}`;
		if (gift.reservation?.buyerName) return `Pagamento informado por ${gift.reservation.buyerName}`;
		if (gift.purchase) return 'Presente comprado';
		if (gift.reservation) return 'Pagamento informado';

		return gift.description || 'Sem descricao cadastrada.';
	});
</script>

<article class:gift-card--busy={busy} class="gift-card">
	<div class="gift-card-image">
		{#if gift.imageUrl}
			<img src={gift.imageUrl} alt={gift.name} />
		{:else}
			<div class="gift-image-placeholder">
				<ImageIcon size={34} />
			</div>
		{/if}
		<span
			class:gift-card-status--available={!gift.unavailable}
			class:gift-card-status--reserved={reserved}
			class:gift-card-status--purchased={bought}
			class="gift-card-status"
		>
			{status}
		</span>
	</div>

	<div class="gift-card-content">
		<div class="gift-card-title-row">
			<div>
				<h3>{gift.name}</h3>
				{#if gift.category}
					<p class="gift-category">{gift.category}</p>
				{/if}
			</div>
			<strong>{formatCurrency(gift.price)}</strong>
		</div>

		<p class="gift-card-description">{description}</p>

		<div class="gift-card-actions">
			<button
				class="gift-button gift-button--compact"
				type="button"
				onclick={() => void onTogglePurchased(gift)}
				{disabled}
			>
				{#if busy}
					<LoaderCircle class="gift-spin" size={16} />
				{:else}
					<Check size={16} />
				{/if}
				{bought ? 'Disponibilizar' : reserved ? 'Confirmar' : 'Comprado'}
			</button>

			{#if reserved}
				<button
					class="gift-icon-button"
					type="button"
					onclick={() => void onReleaseReservation(gift)}
					{disabled}
					title="Liberar reserva"
					aria-label="Liberar reserva"
				>
					<Unlock size={16} />
				</button>
			{/if}

			<button
				class="gift-icon-button"
				type="button"
				onclick={() => onEdit(gift)}
				{disabled}
				title="Editar presente"
				aria-label="Editar presente"
			>
				<Pencil size={16} />
			</button>
			<button
				class="gift-icon-button gift-icon-button--danger"
				type="button"
				onclick={() => void onDelete(gift)}
				{disabled}
				title="Excluir presente"
				aria-label="Excluir presente"
			>
				<Trash2 size={16} />
			</button>
		</div>
	</div>
</article>
