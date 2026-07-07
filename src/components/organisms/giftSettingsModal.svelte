<script lang="ts">
	import { Check, LoaderCircle, X } from '@lucide/svelte';

	import { normalizeGiftListSlug } from '$lib/gifts/api';
	import { defaultGiftListMeta } from '$lib/gifts/defaults';
	import type { GiftListMeta, PixKeyType } from '$lib/gifts/types';

	const PIX_TYPES: { label: string; value: PixKeyType }[] = [
		{ label: 'CPF', value: 'cpf' },
		{ label: 'E-mail', value: 'email' },
		{ label: 'Telefone', value: 'phone' },
		{ label: 'Aleatoria', value: 'random' }
	];

	let { meta, saving, onClose, onInvalid, onSave } = $props<{
		meta: GiftListMeta;
		saving: boolean;
		onClose: () => void;
		onInvalid: (message: string) => void;
		onSave: (meta: GiftListMeta) => void | Promise<void>;
	}>();

	let form = $state<GiftListMeta>({ ...defaultGiftListMeta });

	$effect(() => {
		form = { ...meta };
	});

	function closeOnBackdrop(event: MouseEvent) {
		if (event.target === event.currentTarget) onClose();
	}

	function submit(event: SubmitEvent) {
		event.preventDefault();
		if (saving) return;

		if (!form.pixKey.trim() || !form.pixHolderName.trim()) {
			onInvalid('Informe a chave PIX e o nome do recebedor.');
			return;
		}

		void onSave({
			...form,
			slug: normalizeGiftListSlug(form.slug),
			pixKey: form.pixKey.trim(),
			pixHolderName: form.pixHolderName.trim(),
			pixCity: form.pixCity.trim().toUpperCase() || 'BRASIL'
		});
	}
</script>

<div class="gift-modal-backdrop" role="presentation" onclick={closeOnBackdrop}>
	<div
		class="gift-modal gift-modal--settings"
		role="dialog"
		aria-modal="true"
		aria-labelledby="gift-settings-title"
	>
		<div class="gift-modal-header">
			<div>
				<p class="gift-eyebrow">Publicacao</p>
				<h2 id="gift-settings-title">Configurar lista</h2>
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
				<span>Nomes do casal</span>
				<input disabled bind:value={form.coupleNames} />
			</label>

			<label class="gift-field gift-span-2">
				<span>Slug publico</span>
				<input required maxlength="120" placeholder="marina-e-joao" bind:value={form.slug} />
			</label>

			<label class="gift-field gift-span-2">
				<span>Mensagem aos convidados</span>
				<textarea maxlength="500" placeholder="Escreva uma mensagem curta" bind:value={form.message}
				></textarea>
			</label>

			<div class="gift-field gift-span-2">
				<span>Tipo da chave</span>
				<div class="gift-segmented">
					{#each PIX_TYPES as type}
						<button
							class:active={form.pixKeyType === type.value}
							type="button"
							onclick={() => (form.pixKeyType = type.value)}
						>
							{type.label}
						</button>
					{/each}
				</div>
			</div>

			<label class="gift-field gift-span-2">
				<span>Chave PIX</span>
				<input
					required
					maxlength="120"
					placeholder="casamento@email.com"
					bind:value={form.pixKey}
				/>
			</label>

			<label class="gift-field">
				<span>Nome do recebedor</span>
				<input
					required
					maxlength="25"
					placeholder="Nome no banco"
					bind:value={form.pixHolderName}
				/>
			</label>

			<label class="gift-field">
				<span>Cidade</span>
				<input required maxlength="15" placeholder="SAO PAULO" bind:value={form.pixCity} />
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
					Salvar
				</button>
			</div>
		</form>
	</div>
</div>
