<script lang="ts">
	import { onMount } from 'svelte';

	import { fetchPublicGiftList, purchasePublicGift } from '$lib/gifts/api';
	import { defaultGiftListMeta } from '$lib/gifts/defaults';
	import { buildPixPayload } from '$lib/gifts/pix';
	import type { Gift, GiftListMeta } from '$lib/gifts/types';

	import GiftNotice from '../atoms/giftNotice.svelte';
	import GiftToast from '../atoms/giftToast.svelte';
	import PublicGiftHero from '../organisms/publicGiftHero.svelte';
	import PublicGiftPaymentModal from '../organisms/publicGiftPaymentModal.svelte';
	import PublicGiftSection from '../organisms/publicGiftSection.svelte';

	import '../../styles/gifts.scss';

	type ToastTone = 'success' | 'error' | 'info';

	let { slug } = $props<{ slug: string }>();

	let gifts = $state<Gift[]>([]);
	let meta = $state<GiftListMeta>({ ...defaultGiftListMeta });
	let loading = $state(true);
	let error = $state<string | null>(null);
	let selectedGift = $state<Gift | null>(null);
	let submitting = $state(false);
	let purchaseAttemptKey = $state<string | null>(null);
	let copying = $state(false);
	let toast = $state<{ message: string; tone: ToastTone } | null>(null);
	let toastTimeout: ReturnType<typeof setTimeout> | null = null;

	let availableGifts = $derived(gifts.filter((gift) => !gift.unavailable));
	let unavailableGifts = $derived(gifts.filter((gift) => gift.unavailable));
	let pixPayload = $derived.by(() => {
		if (!selectedGift || !meta.pixKey) return '';

		return buildPixPayload({
			pixKey: meta.pixKey,
			amount: selectedGift.price,
			merchantName: meta.pixHolderName || meta.coupleNames,
			merchantCity: meta.pixCity || 'BRASIL',
			txid: selectedGift.id
		});
	});

	onMount(() => {
		void loadGiftList();

		return () => {
			if (toastTimeout) clearTimeout(toastTimeout);
		};
	});

	function errorMessage(loadError: unknown, fallback: string) {
		return loadError instanceof Error ? loadError.message : fallback;
	}

	function createIdempotencyKey() {
		return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
	}

	function showToast(message: string, tone: ToastTone = 'info') {
		toast = { message, tone };

		if (toastTimeout) clearTimeout(toastTimeout);

		toastTimeout = setTimeout(() => {
			toast = null;
		}, 4200);
	}

	async function loadGiftList() {
		loading = true;
		error = null;

		try {
			const snapshot = await fetchPublicGiftList(slug);
			meta = snapshot.meta;
			gifts = snapshot.gifts;
		} catch (loadError) {
			meta = { ...defaultGiftListMeta, slug };
			gifts = [];
			error = errorMessage(loadError, 'Nao foi possivel carregar a lista.');
		} finally {
			loading = false;
		}
	}

	function chooseGift(gift: Gift) {
		if (gift.unavailable || submitting) return;

		selectedGift = gift;
		purchaseAttemptKey = createIdempotencyKey();
	}

	function closePayment() {
		if (submitting) return;

		selectedGift = null;
		purchaseAttemptKey = null;
	}

	async function copyText(value: string) {
		if (!value || copying) return;

		copying = true;

		try {
			await navigator.clipboard.writeText(value);
			showToast('Copiado.', 'success');
		} catch {
			showToast('Nao foi possivel copiar.', 'error');
		} finally {
			copying = false;
		}
	}

	async function confirmPurchase(buyerName: string, message?: string) {
		if (!selectedGift || !purchaseAttemptKey || submitting) return;

		submitting = true;

		try {
			const savedGift = await purchasePublicGift(
				slug,
				selectedGift.id,
				buyerName,
				purchaseAttemptKey,
				message
			);
			gifts = gifts.map((gift) => (gift.id === selectedGift?.id ? savedGift : gift));
			closePayment();
			showToast('Presente registrado para o casal.', 'success');
		} catch (purchaseError) {
			showToast(errorMessage(purchaseError, 'Nao foi possivel registrar o presente.'), 'error');
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Lista de presentes | {meta.coupleNames}</title>
</svelte:head>

<main class="public-gifts-page">
	<PublicGiftHero
		{meta}
		availableCount={availableGifts.length}
		unavailableCount={unavailableGifts.length}
	/>

	{#if toast}
		<GiftToast message={toast.message} tone={toast.tone} />
	{/if}

	{#if error}
		<GiftNotice title="Nao foi possivel continuar." message={error} />
	{/if}

	<PublicGiftSection
		title="Escolha um presente"
		eyebrow="Disponiveis"
		gifts={availableGifts}
		{loading}
		emptyMessage="Todos os presentes ja foram escolhidos."
		onChoose={chooseGift}
	/>

	{#if unavailableGifts.length > 0}
		<PublicGiftSection
			title="Com carinho recebido"
			eyebrow="Ja escolhidos"
			gifts={unavailableGifts}
			emptyMessage="Nenhum presente escolhido ainda."
		/>
	{/if}

	<p class="gift-signature">Com amor, {meta.coupleNames}</p>
</main>

{#if selectedGift}
	<PublicGiftPaymentModal
		gift={selectedGift}
		{meta}
		{pixPayload}
		{submitting}
		{copying}
		onClose={closePayment}
		onCopy={copyText}
		onInvalid={(message) => showToast(message, 'error')}
		onConfirm={confirmPurchase}
	/>
{/if}
