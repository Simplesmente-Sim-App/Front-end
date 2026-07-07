<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	import {
		createGift,
		deleteGift,
		fetchPrivateGiftList,
		releaseGiftReservation,
		saveGiftListSettings,
		updateGift,
		updateGiftPurchased
	} from '$lib/gifts/api';
	import { defaultGiftListMeta } from '$lib/gifts/defaults';
	import type { EditableGift, Gift, GiftListMeta } from '$lib/gifts/types';

	import GiftNotice from '../atoms/giftNotice.svelte';
	import GiftToast from '../atoms/giftToast.svelte';
	import GiftAdminHeader from '../organisms/giftAdminHeader.svelte';
	import GiftCatalog from '../organisms/giftCatalog.svelte';
	import GiftEditorModal from '../organisms/giftEditorModal.svelte';
	import GiftPublishPanel from '../organisms/giftPublishPanel.svelte';
	import GiftSettingsModal from '../organisms/giftSettingsModal.svelte';
	import GiftSummaryPanel from '../organisms/giftSummaryPanel.svelte';

	import '../../styles/gifts.scss';

	type ToastTone = 'success' | 'error' | 'info';

	const TOKEN_STORAGE_KEYS = [
		'simplesmente_sim_token',
		'simplesmente-sim-token',
		'auth-token',
		'token',
		'accessToken'
	];

	let { weddingId } = $props<{ weddingId: string }>();

	let token = $state<string | null>(null);
	let gifts = $state<Gift[]>([]);
	let meta = $state<GiftListMeta>({ ...defaultGiftListMeta });
	let listConfigured = $state(false);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let busyGiftId = $state<string | null>(null);
	let sharing = $state(false);
	let savingGift = $state(false);
	let savingSettings = $state(false);
	let giftEditorOpen = $state(false);
	let settingsOpen = $state(false);
	let editingGift = $state<Gift | null>(null);
	let toast = $state<{ message: string; tone: ToastTone } | null>(null);
	let toastTimeout: ReturnType<typeof setTimeout> | null = null;

	let purchasedCount = $derived(gifts.filter((gift) => gift.purchase).length);
	let reservedCount = $derived(gifts.filter((gift) => gift.reservation && !gift.purchase).length);
	let totalValue = $derived(gifts.reduce((sum, gift) => sum + gift.price, 0));
	let receivedValue = $derived(
		gifts.filter((gift) => gift.purchase).reduce((sum, gift) => sum + gift.price, 0)
	);
	let publicUrl = $derived.by(() => {
		if (!browser || !listConfigured || !meta.slug) return '';

		return `${window.location.origin}/lista/${encodeURIComponent(meta.slug)}`;
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

	function extractToken(value: string | null) {
		const rawValue = value?.trim();

		if (!rawValue) return null;

		try {
			const parsed = JSON.parse(rawValue) as { token?: unknown; accessToken?: unknown };
			const parsedToken = parsed.token ?? parsed.accessToken;

			return typeof parsedToken === 'string' && parsedToken.trim() ? parsedToken.trim() : null;
		} catch {
			return rawValue;
		}
	}

	function readToken() {
		if (!browser) return null;

		const queryToken = extractToken(new URL(window.location.href).searchParams.get('token'));

		if (queryToken) {
			localStorage.setItem(TOKEN_STORAGE_KEYS[0], queryToken);
			return queryToken;
		}

		for (const key of TOKEN_STORAGE_KEYS) {
			const storedToken = extractToken(localStorage.getItem(key));

			if (storedToken) return storedToken;
		}

		return null;
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
		const nextToken = readToken();
		token = nextToken;

		if (!nextToken) {
			gifts = [];
			error = 'Sessao nao encontrada. A lista precisa de autenticacao para carregar.';
			loading = false;
			return;
		}

		try {
			const snapshot = await fetchPrivateGiftList(weddingId, nextToken);
			meta = snapshot.meta;
			gifts = snapshot.gifts;
			listConfigured = snapshot.configured;
		} catch (loadError) {
			gifts = [];
			error = errorMessage(loadError, 'Nao foi possivel carregar a lista de presentes.');
		} finally {
			loading = false;
		}
	}

	function openNewGift() {
		editingGift = null;
		giftEditorOpen = true;
	}

	function openEditGift(gift: Gift) {
		editingGift = gift;
		giftEditorOpen = true;
	}

	function closeGiftEditor() {
		if (savingGift) return;

		giftEditorOpen = false;
		editingGift = null;
	}

	function openSettings() {
		settingsOpen = true;
	}

	function closeSettings() {
		if (!savingSettings) settingsOpen = false;
	}

	async function saveGift(gift: EditableGift) {
		if (!token || savingGift) return;

		savingGift = true;

		try {
			if (editingGift) {
				const savedGift = await updateGift(editingGift.id, gift, token);
				gifts = gifts.map((currentGift) =>
					currentGift.id === editingGift?.id ? savedGift : currentGift
				);
				showToast('Presente atualizado.', 'success');
			} else {
				const savedGift = await createGift(weddingId, gift, token);
				gifts = [savedGift, ...gifts];
				showToast('Presente adicionado.', 'success');
			}

			closeGiftEditor();
		} catch (saveError) {
			showToast(errorMessage(saveError, 'Nao foi possivel salvar o presente.'), 'error');
		} finally {
			savingGift = false;
		}
	}

	async function saveMeta(nextMeta: GiftListMeta) {
		if (!token || savingSettings) return;

		savingSettings = true;

		try {
			const savedMeta = await saveGiftListSettings(weddingId, nextMeta, token);
			meta = savedMeta;
			listConfigured = true;
			settingsOpen = false;
			showToast('Dados da lista salvos.', 'success');
		} catch (saveError) {
			showToast(errorMessage(saveError, 'Nao foi possivel salvar os dados da lista.'), 'error');
		} finally {
			savingSettings = false;
		}
	}

	async function removeGift(gift: Gift) {
		if (!token || busyGiftId) return;
		if (!confirm(`Remover "${gift.name}" da lista?`)) return;

		busyGiftId = gift.id;

		try {
			await deleteGift(gift.id, token);
			gifts = gifts.filter((currentGift) => currentGift.id !== gift.id);
			showToast('Presente removido.', 'success');
		} catch (removeError) {
			showToast(errorMessage(removeError, 'Nao foi possivel excluir o presente.'), 'error');
		} finally {
			busyGiftId = null;
		}
	}

	async function togglePurchased(gift: Gift) {
		if (!token || busyGiftId) return;

		busyGiftId = gift.id;

		try {
			const nextPurchased = !gift.purchase;
			const savedGift = await updateGiftPurchased(
				gift.id,
				nextPurchased,
				token,
				gift.reservation?.buyerName ?? 'Casal',
				gift.reservation?.message
			);
			gifts = gifts.map((currentGift) => (currentGift.id === gift.id ? savedGift : currentGift));
			showToast(nextPurchased ? 'Compra confirmada.' : 'Presente liberado.', 'success');
		} catch (toggleError) {
			showToast(errorMessage(toggleError, 'Nao foi possivel atualizar o presente.'), 'error');
		} finally {
			busyGiftId = null;
		}
	}

	async function clearReservation(gift: Gift) {
		if (!token || busyGiftId) return;

		busyGiftId = gift.id;

		try {
			await releaseGiftReservation(gift.id, token);
			gifts = gifts.map((currentGift) =>
				currentGift.id === gift.id
					? { ...currentGift, unavailable: false, reservation: undefined }
					: currentGift
			);
			showToast('Reserva liberada.', 'success');
		} catch (releaseError) {
			showToast(errorMessage(releaseError, 'Nao foi possivel liberar a reserva.'), 'error');
		} finally {
			busyGiftId = null;
		}
	}

	async function copyPublicUrl() {
		if (!publicUrl || sharing) return;

		sharing = true;

		try {
			await navigator.clipboard.writeText(publicUrl);
			showToast('Link copiado.', 'success');
		} catch {
			showToast('Nao foi possivel copiar o link.', 'error');
		} finally {
			sharing = false;
		}
	}
</script>

<svelte:head>
	<title>Lista de presentes | Simplesmente Sim</title>
</svelte:head>

<main class="gift-page">
	<GiftAdminHeader
		coupleNames={meta.coupleNames}
		{loading}
		tokenReady={Boolean(token)}
		onRefresh={loadGiftList}
		onNewGift={openNewGift}
	/>

	{#if toast}
		<GiftToast message={toast.message} tone={toast.tone} />
	{/if}

	{#if error}
		<GiftNotice title="Nao foi possivel continuar." message={error} />
	{/if}

	<section class="gift-admin-overview">
		<GiftSummaryPanel
			totalCount={gifts.length}
			{purchasedCount}
			{reservedCount}
			{receivedValue}
			{totalValue}
			{listConfigured}
		/>
		<GiftPublishPanel
			{publicUrl}
			{sharing}
			tokenReady={Boolean(token)}
			onSettings={openSettings}
			onCopy={copyPublicUrl}
		/>
	</section>

	<GiftCatalog
		{gifts}
		{loading}
		{busyGiftId}
		tokenReady={Boolean(token)}
		onNewGift={openNewGift}
		onEdit={openEditGift}
		onDelete={removeGift}
		onTogglePurchased={togglePurchased}
		onReleaseReservation={clearReservation}
	/>
</main>

{#if giftEditorOpen}
	<GiftEditorModal
		gift={editingGift}
		saving={savingGift}
		onClose={closeGiftEditor}
		onInvalid={(message) => showToast(message, 'error')}
		onSave={saveGift}
	/>
{/if}

{#if settingsOpen}
	<GiftSettingsModal
		{meta}
		saving={savingSettings}
		onClose={closeSettings}
		onInvalid={(message) => showToast(message, 'error')}
		onSave={saveMeta}
	/>
{/if}
