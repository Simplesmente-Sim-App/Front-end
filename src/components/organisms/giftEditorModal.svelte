<script lang="ts">
	import { Check, Image as ImageIcon, LoaderCircle, X } from '@lucide/svelte';

	import { formatCurrencyInput, MAX_GIFT_PRICE, parseCurrencyInput } from '$lib/gifts/currency';
	import type { EditableGift, Gift } from '$lib/gifts/types';

	type GiftForm = {
		name: string;
		description: string;
		price: string;
		category: string;
		imageUrl: string;
	};

	let { gift, saving, onClose, onInvalid, onSave } = $props<{
		gift: Gift | null;
		saving: boolean;
		onClose: () => void;
		onInvalid: (message: string) => void;
		onSave: (gift: EditableGift) => void | Promise<void>;
	}>();

	let form = $state<GiftForm>(emptyGiftForm());
	let isEdit = $derived(Boolean(gift));

	$effect(() => {
		form = gift
			? {
					name: gift.name,
					description: gift.description ?? '',
					price: formatCurrencyInput(gift.price),
					category: gift.category ?? '',
					imageUrl: gift.imageUrl ?? ''
				}
			: emptyGiftForm();
	});

	function emptyGiftForm(): GiftForm {
		return {
			name: '',
			description: '',
			price: '',
			category: '',
			imageUrl: ''
		};
	}

	function closeOnBackdrop(event: MouseEvent) {
		if (event.target === event.currentTarget) onClose();
	}

	function buildGiftPayload(): EditableGift | null {
		const parsedPrice = parseCurrencyInput(form.price);

		if (!form.name.trim() || parsedPrice <= 0) {
			onInvalid('Informe nome e valor do presente.');
			return null;
		}

		if (parsedPrice > MAX_GIFT_PRICE) {
			onInvalid('Informe um valor de ate R$ 9.999.999.999,99.');
			return null;
		}

		return {
			name: form.name.trim(),
			description: form.description.trim() || undefined,
			price: parsedPrice,
			category: form.category.trim() || undefined,
			imageUrl: form.imageUrl.trim() || undefined
		};
	}

	function submit(event: SubmitEvent) {
		event.preventDefault();
		if (saving) return;

		const payload = buildGiftPayload();
		if (!payload) return;

		void onSave(payload);
	}
</script>

<div class="gift-modal-backdrop" role="presentation" onclick={closeOnBackdrop}>
	<div class="gift-modal" role="dialog" aria-modal="true" aria-labelledby="gift-editor-title">
		<div class="gift-modal-header">
			<div>
				<p class="gift-eyebrow">{isEdit ? 'Editar' : 'Novo'}</p>
				<h2 id="gift-editor-title">{isEdit ? 'Editar presente' : 'Novo presente'}</h2>
			</div>
			<button
				class="gift-icon-button"
				type="button"
				onclick={onClose}
				title="Fechar"
				aria-label="Fechar"
			>
				<X size={18} />
			</button>
		</div>

		<form class="gift-form-grid" onsubmit={submit}>
			<label class="gift-field gift-span-2">
				<span>URL da imagem</span>
				<input type="url" placeholder="https://..." maxlength="2048" bind:value={form.imageUrl} />
			</label>

			<div class="gift-image-preview gift-span-2">
				{#if form.imageUrl}
					<img src={form.imageUrl} alt="Preview do presente" />
				{:else}
					<ImageIcon size={34} />
				{/if}
			</div>

			<label class="gift-field gift-span-2">
				<span>Nome</span>
				<input required maxlength="150" placeholder="Jogo de panelas" bind:value={form.name} />
			</label>

			<label class="gift-field">
				<span>Preco (R$)</span>
				<input
					required
					inputmode="decimal"
					maxlength="20"
					placeholder="0,00"
					bind:value={form.price}
				/>
			</label>

			<label class="gift-field">
				<span>Categoria</span>
				<input maxlength="80" placeholder="Cozinha" bind:value={form.category} />
			</label>

			<label class="gift-field gift-span-2">
				<span>Descricao</span>
				<textarea
					maxlength="255"
					placeholder="Algumas palavras sobre esse presente..."
					bind:value={form.description}
				></textarea>
			</label>

			<div class="gift-modal-actions gift-span-2">
				<button
					class="gift-button gift-button--secondary"
					type="button"
					onclick={onClose}
					disabled={saving}
				>
					Cancelar
				</button>
				<button class="gift-button gift-button--primary" type="submit" disabled={saving}>
					{#if saving}
						<LoaderCircle class="gift-spin" size={18} />
					{:else}
						<Check size={18} />
					{/if}
					{isEdit ? 'Salvar' : 'Adicionar'}
				</button>
			</div>
		</form>
	</div>
</div>
