<script lang="ts">
	import { Check, Copy, Gift, Heart, Search, ShieldCheck, Sparkles, X } from '@lucide/svelte';
	import {
		getPublicGiftList,
		GiftApiError,
		giftSummaryFromGifts,
		giftErrorMessage,
		purchasePublicGift
	} from '$lib/gifts/api';
	import type { PublicGift, PublicGiftList } from '$lib/gifts/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	// svelte-ignore state_referenced_locally
	let activeSlug = $state(data.slug);
	// These are intentionally mutable copies: reservations update the catalog before a reload.
	// svelte-ignore state_referenced_locally
	let giftList = $state<PublicGiftList | null>(data.giftList);
	// svelte-ignore state_referenced_locally
	let loadError = $state<string | null>(data.initialError);
	let loading = $state(false);
	let search = $state('');
	let selectedCategory = $state('Todos');
	let selectedGift = $state<PublicGift | null>(null);
	let confirmation = $state<PublicGift | null>(null);
	let buyerName = $state('');
	let message = $state('');
	let purchaseError = $state('');
	let submitting = $state(false);
	let copied = $state(false);
	let idempotencyKey = $state('');

	$effect(() => {
		if (data.slug !== activeSlug) {
			activeSlug = data.slug;
			giftList = data.giftList;
			loadError = data.initialError;
		}
	});

	let categories = $derived([
		'Todos',
		...new Set(
			(giftList?.gifts ?? [])
				.map((gift) => gift.category?.trim())
				.filter((category): category is string => Boolean(category))
		)
	]);
	let visibleGifts = $derived(
		(giftList?.gifts ?? []).filter((gift) => {
			const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');
			const matchesSearch =
				!normalizedSearch ||
				gift.name.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
				gift.description?.toLocaleLowerCase('pt-BR').includes(normalizedSearch);
			const matchesCategory = selectedCategory === 'Todos' || gift.category === selectedCategory;
			return Boolean(matchesSearch) && matchesCategory;
		})
	);

	const currency = new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL'
	});

	function createIdempotencyKey() {
		if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
		return `${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
	}

	function openGift(gift: PublicGift) {
		if (!gift.available) return;
		selectedGift = gift;
		confirmation = null;
		buyerName = '';
		message = '';
		purchaseError = '';
		copied = false;
		idempotencyKey = createIdempotencyKey();
	}

	function closeModal() {
		if (submitting) return;
		selectedGift = null;
		confirmation = null;
		purchaseError = '';
		copied = false;
		idempotencyKey = '';
	}

	async function confirmGift() {
		if (!selectedGift || submitting) return;
		if (!buyerName.trim()) {
			purchaseError = 'Conte ao casal quem está enviando este presente.';
			return;
		}

		submitting = true;
		purchaseError = '';
		try {
			const updatedGift = await purchasePublicGift(data.slug, selectedGift.id, {
				buyerName: buyerName.trim(),
				message: message.trim() || undefined,
				idempotencyKey: idempotencyKey || createIdempotencyKey()
			});
			if (giftList) {
				const gifts = giftList.gifts.map((gift) =>
					gift.id === updatedGift.id ? updatedGift : gift
				);
				giftList = {
					...giftList,
					gifts,
					summary: giftSummaryFromGifts(gifts)
				};
			}
			confirmation = updatedGift;
		} catch (error) {
			purchaseError = giftErrorMessage(error);
			if (error instanceof GiftApiError && error.status === 409) {
				await retryLoad();
			}
		} finally {
			submitting = false;
		}
	}

	async function retryLoad() {
		loading = true;
		loadError = null;
		try {
			giftList = await getPublicGiftList(data.slug);
		} catch (error) {
			loadError = giftErrorMessage(error);
		} finally {
			loading = false;
		}
	}

	async function copyPix() {
		if (!giftList?.meta.pixKey) return;
		try {
			await navigator.clipboard.writeText(giftList.meta.pixKey);
			copied = true;
			setTimeout(() => (copied = false), 2500);
		} catch {
			copied = false;
		}
	}
</script>

<svelte:head>
	<title
		>{giftList ? `Lista de presentes de ${giftList.meta.coupleNames}` : 'Lista de presentes'} | Simplesmente
		Sim</title
	>
	<meta
		name="description"
		content={giftList?.meta.message ??
			'Escolha um presente para celebrar este casamento com carinho.'}
	/>
	<meta name="robots" content="index,follow" />
	<meta property="og:type" content="website" />
	<meta
		property="og:title"
		content={`Lista de presentes de ${giftList?.meta.coupleNames ?? 'um casal especial'}`}
	/>
	<meta
		property="og:description"
		content={giftList?.meta.message ?? 'Celebre este casamento com um presente especial.'}
	/>
</svelte:head>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape' && (selectedGift || confirmation)) closeModal();
	}}
/>

<main class="gift-page">
	<header class="brand-header">
		<a href="/" aria-label="Página inicial do Simplesmente Sim">
			<img src="/logo-header.svg" alt="Simplesmente Sim" />
		</a>
		<span>Lista de presentes</span>
	</header>

	{#if loadError || !giftList}
		<section class="state-card" aria-live="polite">
			<div class="state-icon"><Gift size={30} /></div>
			<h1>Não conseguimos abrir esta lista</h1>
			<p>{loadError ?? 'A lista de presentes não está disponível.'}</p>
			<button type="button" onclick={retryLoad} disabled={loading}>
				{loading ? 'Tentando novamente...' : 'Tentar novamente'}
			</button>
		</section>
	{:else}
		<section class="hero">
			<div class="rings" aria-hidden="true"><Heart size={24} /><Sparkles size={18} /></div>
			<p class="eyebrow">Um novo capítulo começa</p>
			<h1>{giftList.meta.coupleNames}</h1>
			<p class="message">
				{giftList.meta.message ??
					'Sua presença é o nosso maior presente. Se quiser celebrar conosco de outra forma, preparamos esta lista com muito carinho.'}
			</p>
		</section>

		<section class="catalog" aria-labelledby="gift-heading">
			<div class="catalog-heading">
				<div>
					<p class="eyebrow">Escolha com carinho</p>
					<h2 id="gift-heading">Nossa lista</h2>
				</div>
				<span
					>{giftList.summary.availableCount} de {giftList.summary.totalCount}
					{giftList.summary.availableCount === 1 ? 'disponível' : 'disponíveis'}</span
				>
			</div>

			<div class="filters">
				<label class="search-field">
					<span class="sr-only">Buscar presente</span>
					<Search size={18} aria-hidden="true" />
					<input bind:value={search} type="search" placeholder="Buscar presente" />
				</label>
				{#if categories.length > 1}
					<div class="category-list" aria-label="Categorias">
						{#each categories as category}
							<button
								type="button"
								class:active={selectedCategory === category}
								onclick={() => (selectedCategory = category)}
							>
								{category}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			{#if visibleGifts.length}
				<div class="gift-grid">
					{#each visibleGifts as gift (gift.id)}
						<article class:unavailable={!gift.available} class="gift-card">
							{#if gift.imageUrl}
								<img src={gift.imageUrl} alt={`Imagem de ${gift.name}`} loading="lazy" />
							{:else}
								<div class="gift-placeholder" aria-hidden="true"><Gift size={34} /></div>
							{/if}
							<div class="gift-content">
								<div class="gift-topline">
									{#if gift.category}<span>{gift.category}</span>{/if}
									{#if !gift.available}<span class="chosen">Escolhido</span>{/if}
								</div>
								<h3>{gift.name}</h3>
								{#if gift.description}<p>{gift.description}</p>{/if}
								<strong>{currency.format(gift.estimatedPrice)}</strong>
								<button type="button" disabled={!gift.available} onclick={() => openGift(gift)}>
									{gift.available ? 'Quero presentear' : 'Presente escolhido'}
								</button>
							</div>
						</article>
					{/each}
				</div>
			{:else}
				<div class="empty-state">
					<Gift size={28} />
					<h3>Nenhum presente encontrado</h3>
					<p>Tente outra busca ou categoria.</p>
				</div>
			{/if}
		</section>

		<section class="trust-card">
			<ShieldCheck size={26} aria-hidden="true" />
			<div>
				<h2>Um gesto simples e seguro</h2>
				<p>
					Ao escolher um presente, ele fica reservado em seu nome. O pagamento é feito diretamente
					ao casal pela chave PIX informada.
				</p>
			</div>
		</section>
	{/if}

	<footer>
		<img src="/logo-favicon.svg" alt="" />
		<p>Feito com carinho no <a href="/">Simplesmente Sim</a></p>
	</footer>
</main>

{#if selectedGift || confirmation}
	<button class="modal-backdrop" type="button" aria-label="Fechar confirmação" onclick={closeModal}
	></button>
	<div class="gift-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
		<button
			class="modal-close"
			type="button"
			aria-label="Fechar"
			onclick={closeModal}
			disabled={submitting}
		>
			<X size={20} />
		</button>
		{#if confirmation}
			<div class="success-icon"><Check size={30} /></div>
			<p class="eyebrow">Presente reservado</p>
			<h2 id="modal-title">Que gesto lindo!</h2>
			<p class="modal-copy">
				O presente <strong>{confirmation.name}</strong> foi reservado em seu nome. Agora é só enviar o
				valor ao casal.
			</p>
			{#if giftList?.meta.pixKey}
				<div class="pix-card">
					<span>Chave PIX · {giftList.meta.pixKeyType ?? 'PIX'}</span>
					<strong>{giftList.meta.pixKey}</strong>
					{#if giftList.meta.pixHolderName}<small
							>{giftList.meta.pixHolderName}{giftList.meta.pixCity
								? ` · ${giftList.meta.pixCity}`
								: ''}</small
						>{/if}
					<button type="button" onclick={copyPix}>
						{#if copied}<Check size={16} /> Chave copiada{:else}<Copy size={16} /> Copiar chave PIX{/if}
					</button>
				</div>
			{:else}
				<p class="notice">
					O casal ainda não informou a chave PIX. Entre em contato para combinar o envio.
				</p>
			{/if}
			<button class="primary-action" type="button" onclick={closeModal}>Concluir</button>
		{:else if selectedGift}
			<p class="eyebrow">Você escolheu</p>
			<h2 id="modal-title">{selectedGift.name}</h2>
			<p class="gift-price">{currency.format(selectedGift.estimatedPrice)}</p>
			<form
				onsubmit={(event) => {
					event.preventDefault();
					void confirmGift();
				}}
			>
				<label for="buyer-name">Seu nome</label>
				<input
					id="buyer-name"
					bind:value={buyerName}
					maxlength="120"
					autocomplete="name"
					placeholder="Como o casal conhece você"
					required
				/>
				<label for="gift-message">Mensagem ao casal <span>(opcional)</span></label>
				<textarea
					id="gift-message"
					bind:value={message}
					maxlength="255"
					rows="3"
					placeholder="Deixe um recado carinhoso"
				></textarea>
				{#if purchaseError}<p class="form-error" role="alert">{purchaseError}</p>{/if}
				<p class="privacy-note">
					Seu nome e sua mensagem serão compartilhados somente com o casal.
				</p>
				<button class="primary-action" type="submit" disabled={submitting}>
					{submitting ? 'Reservando...' : 'Confirmar presente'}
				</button>
			</form>
		{/if}
	</div>
{/if}

<style lang="scss">
	:global(body) {
		background: #f8eddf;
	}

	.gift-page {
		min-height: 100vh;
		background:
			radial-gradient(circle at 10% 12%, rgba(204, 135, 153, 0.16), transparent 28rem),
			linear-gradient(180deg, #fffaf3 0%, #f8eddf 52%, #fffaf3 100%);
		color: #573b40;
	}

	.brand-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		max-width: 1180px;
		margin: 0 auto;
		padding: 24px 28px;
		border-bottom: 1px solid rgba(131, 7, 12, 0.1);
	}

	.brand-header img {
		width: 158px;
		height: auto;
		display: block;
	}
	.brand-header span {
		color: #8b6068;
		font-size: 0.76rem;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.hero {
		max-width: 760px;
		margin: 0 auto;
		padding: 70px 28px 60px;
		text-align: center;
	}

	.rings {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		color: #a9304a;
		margin-bottom: 18px;
	}
	.eyebrow {
		color: #a9304a;
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.2em;
		text-transform: uppercase;
	}
	.hero h1 {
		margin-top: 12px;
		color: #76101b;
		font-family: 'Imperial Script', cursive;
		font-size: clamp(4.2rem, 12vw, 7.4rem);
		font-weight: 400;
		line-height: 0.95;
	}
	.hero .message {
		max-width: 630px;
		margin: 28px auto 0;
		color: #72535b;
		font-size: 1rem;
		line-height: 1.8;
	}

	.catalog {
		max-width: 1180px;
		margin: 0 auto;
		padding: 0 28px 72px;
	}
	.catalog-heading {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 24px;
		margin-bottom: 28px;
	}
	.catalog-heading h2 {
		margin-top: 3px;
		color: #76101b;
		font-size: clamp(2.1rem, 5vw, 3.2rem);
		font-weight: 500;
	}
	.catalog-heading > span {
		padding: 8px 14px;
		border: 1px solid #e9bdc5;
		border-radius: 999px;
		background: #fffaf4;
		color: #875660;
		font-size: 0.78rem;
		font-weight: 600;
	}

	.filters {
		margin-bottom: 28px;
	}
	.search-field {
		display: flex;
		align-items: center;
		width: min(100%, 440px);
		height: 48px;
		padding: 0 16px;
		border: 1px solid #e9bdc5;
		border-radius: 14px;
		background: rgba(255, 253, 249, 0.92);
		color: #9b7279;
	}
	.search-field input {
		width: 100%;
		height: 100%;
		margin-left: 10px;
		border: 0;
		outline: 0;
		background: transparent;
		color: #573b40;
		font: inherit;
	}
	.category-list {
		display: flex;
		gap: 8px;
		margin-top: 14px;
		padding-bottom: 4px;
		overflow-x: auto;
	}
	.category-list button {
		flex: 0 0 auto;
		padding: 9px 15px;
		border: 1px solid #e9bdc5;
		border-radius: 999px;
		background: #fffdf9;
		color: #76101b;
		cursor: pointer;
		font: inherit;
		font-size: 0.78rem;
		font-weight: 600;
	}
	.category-list button.active {
		border-color: #76101b;
		background: #76101b;
		color: white;
	}

	.gift-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 20px;
	}
	.gift-card {
		display: flex;
		min-width: 0;
		flex-direction: column;
		overflow: hidden;
		border: 1px solid #ecc6cb;
		border-radius: 22px;
		background: #fffdf9;
		box-shadow: 0 16px 38px rgba(89, 26, 36, 0.08);
	}
	.gift-card > img,
	.gift-placeholder {
		width: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
		background: linear-gradient(145deg, #f7dce0, #fbf0df);
	}
	.gift-placeholder {
		display: grid;
		place-items: center;
		color: #b1465d;
	}
	.gift-content {
		display: flex;
		flex: 1;
		flex-direction: column;
		padding: 20px;
	}
	.gift-topline {
		display: flex;
		min-height: 24px;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}
	.gift-topline span {
		color: #a14b5d;
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.gift-topline .chosen {
		padding: 4px 8px;
		border-radius: 999px;
		background: #eadfd7;
		color: #76615d;
	}
	.gift-content h3 {
		margin-top: 8px;
		color: #6f0710;
		font-size: 1.35rem;
		font-weight: 600;
		line-height: 1.18;
	}
	.gift-content p {
		margin-top: 10px;
		color: #806169;
		font-size: 0.84rem;
		line-height: 1.55;
	}
	.gift-content strong {
		display: block;
		margin-top: auto;
		padding-top: 18px;
		color: #76101b;
		font-family: var(--font-display);
		font-size: 1.28rem;
	}
	.gift-content > button {
		width: 100%;
		margin-top: 14px;
		padding: 12px 16px;
		border: 0;
		border-radius: 12px;
		background: #76101b;
		color: white;
		cursor: pointer;
		font: inherit;
		font-size: 0.84rem;
		font-weight: 600;
	}
	.gift-content > button:disabled {
		background: #d8c7c1;
		color: #776964;
		cursor: not-allowed;
	}
	.gift-card.unavailable img,
	.gift-card.unavailable .gift-placeholder {
		filter: grayscale(0.65);
		opacity: 0.72;
	}

	.empty-state,
	.state-card {
		display: grid;
		place-items: center;
		padding: 58px 24px;
		border: 1px dashed #dfadb7;
		border-radius: 22px;
		background: rgba(255, 253, 249, 0.82);
		text-align: center;
		color: #a9304a;
	}
	.empty-state h3,
	.state-card h1 {
		margin-top: 12px;
		color: #76101b;
		font-size: 1.7rem;
	}
	.empty-state p,
	.state-card p {
		margin-top: 8px;
		color: #806169;
		line-height: 1.6;
	}
	.state-card {
		max-width: 620px;
		margin: 90px auto;
		border-style: solid;
	}
	.state-icon,
	.success-icon {
		display: grid;
		width: 64px;
		height: 64px;
		place-items: center;
		border-radius: 50%;
		background: #f7dce0;
	}
	.state-card button {
		margin-top: 22px;
		padding: 12px 20px;
		border: 0;
		border-radius: 999px;
		background: #76101b;
		color: white;
		cursor: pointer;
		font: inherit;
		font-weight: 600;
	}

	.trust-card {
		display: flex;
		max-width: 780px;
		align-items: flex-start;
		gap: 18px;
		margin: 0 auto 76px;
		padding: 24px 28px;
		border: 1px solid #e9bdc5;
		border-radius: 20px;
		background: #fffaf4;
		color: #a9304a;
	}
	.trust-card h2 {
		color: #76101b;
		font-size: 1.25rem;
	}
	.trust-card p {
		margin-top: 5px;
		color: #72535b;
		font-size: 0.84rem;
		line-height: 1.6;
	}

	footer {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 28px;
		border-top: 1px solid rgba(131, 7, 12, 0.1);
		color: #806169;
		font-size: 0.78rem;
	}
	footer img {
		width: 28px;
	}
	footer a {
		color: #76101b;
		font-weight: 600;
	}

	.modal-backdrop {
		position: fixed;
		z-index: 50;
		inset: 0;
		width: 100%;
		height: 100%;
		border: 0;
		background: rgba(48, 18, 23, 0.72);
		cursor: default;
	}
	.gift-modal {
		position: fixed;
		z-index: 51;
		top: 50%;
		left: 50%;
		width: min(calc(100% - 28px), 520px);
		max-height: calc(100vh - 32px);
		padding: 34px;
		overflow-y: auto;
		transform: translate(-50%, -50%);
		border: 1px solid #e9bdc5;
		border-radius: 24px;
		background: #fffaf4;
		box-shadow: 0 28px 90px rgba(42, 12, 18, 0.3);
	}
	.modal-close {
		position: absolute;
		top: 18px;
		right: 18px;
		display: grid;
		width: 36px;
		height: 36px;
		place-items: center;
		border: 0;
		border-radius: 50%;
		background: #f7dce0;
		color: #76101b;
		cursor: pointer;
	}
	.gift-modal > .eyebrow {
		margin-top: 16px;
	}
	.gift-modal h2 {
		margin-top: 8px;
		padding-right: 36px;
		color: #76101b;
		font-size: 2rem;
	}
	.gift-price {
		margin-top: 8px;
		color: #a9304a;
		font-family: var(--font-display);
		font-size: 1.3rem;
	}
	.modal-copy {
		margin-top: 14px;
		color: #72535b;
		line-height: 1.65;
	}
	.gift-modal form {
		display: grid;
		gap: 9px;
		margin-top: 22px;
	}
	.gift-modal label {
		margin-top: 9px;
		color: #65474d;
		font-size: 0.82rem;
		font-weight: 600;
	}
	.gift-modal label span {
		color: #9b7279;
		font-weight: 400;
	}
	.gift-modal input,
	.gift-modal textarea {
		width: 100%;
		padding: 12px 14px;
		border: 1px solid #e2b3bd;
		border-radius: 12px;
		outline: none;
		background: white;
		color: #573b40;
		font: inherit;
	}
	.gift-modal input:focus,
	.gift-modal textarea:focus {
		border-color: #a9304a;
		box-shadow: 0 0 0 3px rgba(177, 70, 93, 0.11);
	}
	.form-error,
	.notice {
		margin-top: 7px;
		padding: 10px 12px;
		border-radius: 10px;
		background: #f8e0e3;
		color: #861927;
		font-size: 0.8rem;
		line-height: 1.5;
	}
	.privacy-note {
		color: #8b6d73;
		font-size: 0.72rem;
		line-height: 1.5;
	}
	.primary-action {
		width: 100%;
		margin-top: 14px;
		padding: 13px 18px;
		border: 0;
		border-radius: 12px;
		background: #76101b;
		color: white;
		cursor: pointer;
		font: inherit;
		font-weight: 600;
	}
	.primary-action:disabled {
		opacity: 0.6;
		cursor: wait;
	}
	.pix-card {
		display: grid;
		gap: 8px;
		margin-top: 22px;
		padding: 18px;
		border: 1px solid #e1b2bc;
		border-radius: 16px;
		background: #fff;
	}
	.pix-card span {
		color: #a14b5d;
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.pix-card strong {
		overflow-wrap: anywhere;
		color: #76101b;
		font-size: 1rem;
	}
	.pix-card small {
		color: #806169;
	}
	.pix-card button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 7px;
		margin-top: 6px;
		padding: 10px;
		border: 1px solid #76101b;
		border-radius: 10px;
		background: transparent;
		color: #76101b;
		cursor: pointer;
		font: inherit;
		font-size: 0.8rem;
		font-weight: 600;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	@media (max-width: 860px) {
		.gift-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 560px) {
		.brand-header {
			padding: 18px;
		}
		.brand-header img {
			width: 132px;
		}
		.brand-header span {
			display: none;
		}
		.hero {
			padding: 54px 20px 44px;
		}
		.hero h1 {
			font-size: 4.35rem;
		}
		.catalog {
			padding: 0 16px 54px;
		}
		.catalog-heading {
			align-items: flex-start;
		}
		.catalog-heading > span {
			margin-top: 6px;
			white-space: nowrap;
		}
		.gift-grid {
			grid-template-columns: 1fr;
		}
		.gift-card {
			flex-direction: row;
		}
		.gift-card > img,
		.gift-card > .gift-placeholder {
			width: 34%;
			min-width: 116px;
			aspect-ratio: auto;
		}
		.gift-content {
			padding: 16px;
		}
		.trust-card {
			margin: 0 16px 54px;
			padding: 20px;
		}
		.gift-modal {
			padding: 28px 22px 22px;
		}
	}

	@media (max-width: 390px) {
		.gift-card {
			flex-direction: column;
		}
		.gift-card > img,
		.gift-card > .gift-placeholder {
			width: 100%;
			aspect-ratio: 16 / 9;
		}
	}
</style>
