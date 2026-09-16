<script lang="ts">
	import Container from '../atoms/container.svelte';
	import IconCircle from '../atoms/iconCircle.svelte';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Mail from '@lucide/svelte/icons/mail';
	let email = '';
	let submitted = false;
	let status: { type: 'success' | 'error'; message: string } | null = null;
	let submitting = false;
	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		const form = event.currentTarget as HTMLFormElement;
		if (!form.checkValidity()) {
			form.reportValidity();
			return;
		}

		submitting = true;
		status = null;
		try {
			const response = await fetch(
				'https://api.simplesmentesim.com/api/public/newsletter/subscribe',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email })
				}
			);

			if (!response.ok) throw new Error(`Newsletter request failed: ${response.status}`);
			status = { type: 'success', message: 'E-mail cadastrado com sucesso!' };
			email = '';
		} catch (error) {
			console.error(error);
			status = { type: 'error', message: 'Não foi possível cadastrar agora. Tente novamente.' };
		} finally {
			submitting = false;
		}
	}
</script>

<a class="skip-link" href="#conteudo-principal">Ir para o conteúdo principal</a>
<header class="brand" aria-label="Simplesmente Sim">
	<a class="brand-mark" href="/" aria-label="Simplesmente Sim — página inicial"
		><img src="/logo-header.svg" width="512" height="512" alt="" /></a
	>
</header>

<main id="conteudo-principal">
	<section class="hero" aria-labelledby="hero-title">
		<IconCircle
			><img
				class="logo-icon"
				src="/logo-hero.svg"
				width="835"
				height="568"
				alt="Simplesmente Sim"
				fetchpriority="high"
				decoding="async"
			/></IconCircle
		>
		<Container>
			<p class="eyebrow">SEU CASAMENTO SEM ESTRESSE, DO PLANEJAMENTO AO ALTAR</p>
			<h1 id="hero-title">Seu casamento começa com um <em>Sim</em>.</h1>
			<p class="intro">
				Assine nossa newsletter e receba o Guia da Noiva, um material especial para acompanhar você
				na organização do casamento, do planejamento ao altar.
			</p>
			<form class="signup" onsubmit={handleSubmit} novalidate={false}>
				<div class="email-field">
					<Mail class="email-icon" size={17} aria-hidden="true" />
					<label class="sr-only" for="newsletter-email">Seu e-mail</label>
					<input
						id="newsletter-email"
						bind:value={email}
						type="email"
						name="email"
						placeholder="seu@email.com"
						autocomplete="email"
						inputmode="email"
						spellcheck="false"
						required
						aria-describedby="newsletter-status"
						aria-invalid={submitted && !email.includes('@')}
					/>
				</div>
				<button type="submit" disabled={submitting}
					>{submitting ? 'Enviando...' : 'Quero receber'}
					<ArrowRight size={17} aria-hidden="true" /></button
				>
			</form>
			<p
				id="newsletter-status"
				class:error={status?.type === 'error'}
				class="form-status"
				aria-live="polite"
			>
				{status?.message ?? ''}
			</p>
		</Container>
	</section>
</main>

<style lang="scss">
	.skip-link {
		position: fixed;
		top: 8px;
		left: 8px;
		z-index: 10000;
		padding: 0.65rem 1rem;
		color: #fff;
		background: #84000b;
		border-radius: 0.5rem;
		transform: translateY(-150%);
	}
	.skip-link:focus {
		transform: translateY(0);
	}
	.hero {
		height: calc(100svh - 56px);
		overflow: hidden;
		padding: 1rem 1.5rem 3rem;
		background: #f8eddf;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
	}
	.brand {
		position: static;
		align-self: flex-start;
		display: flex;
		align-items: center;
		margin: 8px 0 0 20px;
	}
	.brand-mark {
		display: block;
		width: 48px;
		height: 48px;
	}
	.brand-mark img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.logo-icon {
		display: block;
		width: 30vw;
		max-width: 400px;
		height: auto;
		aspect-ratio: 835 / 568;
		object-fit: contain;
	}
	h1 {
		max-width: 780px;
		color: #76101b;
		font-size: clamp(3.2rem, 7vw, 5.4rem);
		line-height: 0.96;
		font-weight: 500;
		margin-bottom: 1.5rem;
		em {
			font-family: 'Imperial Script', cursive;
			font-size: 1.2em;
			font-weight: 400;
		}
	}
	.eyebrow {
		margin: 1.5rem auto 1rem;
		color: #b23d52;
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.28em;
	}
	.intro {
		max-width: 650px;
		color: #805b5d;
		margin: 0 auto 1rem;
		font-size: 1.08rem;
		line-height: 1.7;
	}
	.signup {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.8rem;
		width: min(100%, 620px);
		margin-inline: auto;
	}
	.email-field {
		position: relative;
		display: flex;
		flex-direction: row;
		align-items: center;
		flex: 1;
		min-width: 0;
	}
	.email-field :global(svg.email-icon) {
		position: absolute;
		transform: translateY(-50%);
		top: 50%;
		left: 16px;
		color: #84000b;
		stroke: #84000b;
	}
	input {
		width: 100%;
		height: 48px;
		padding: 0.25rem 1rem 0.25rem 2.7rem;
		border: 1px solid #f0cfd0;
		outline: 0;
		border-radius: 999px;
		box-shadow: 0 8px 22px rgba(132, 0, 11, 0.08);
		color: #5f4144;
		background: #fff;
		font: inherit;
		font-size: 0.95rem;
	}
	input::placeholder {
		color: #a88b8d;
	}
	button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.65rem;
		height: 48px;
		padding: 0 1.7rem;
		border: 0;
		border-radius: 999px;
		color: #fff;
		background: #84000b;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
		transition:
			transform 0.2s ease,
			background 0.2s ease;
	}
	button:hover {
		background: #6d0009;
		transform: translateY(-1px);
	}
	button:disabled {
		opacity: 0.7;
		cursor: wait;
		transform: none;
	}
	button:focus-visible,
	input:focus-visible {
		outline: 2px solid #b23d52;
		outline-offset: 2px;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
	.form-status {
		margin-top: 0.8rem;
		color: #805b5d;
		font-size: 0.82rem;
	}
	.form-status.error {
		color: #84000b;
	}
	@media (max-width: 600px) {
		.signup {
			flex-direction: column;
		}
		.email-field,
		button {
			width: 100%;
		}
		.logo-icon {
			width: 80vw;
			height: 40vw;
			max-width: none;
		}
	}
	@media (max-width: 600px) {
		.brand {
			margin: 8px 0 0 20px;
		}
		.brand-mark {
			width: 48px;
			height: 48px;
		}
		.brand-mark img {
			width: 100%;
			height: 100%;
			object-fit: contain;
		}
	}
</style>
