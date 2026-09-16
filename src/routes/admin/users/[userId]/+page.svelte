<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import AdminShell from '../../../../components/templates/adminShell.svelte';
	import AdminStatusBadge from '../../../../components/atoms/adminStatusBadge.svelte';
	import { adminApi, ApiError } from '$lib/admin/api';
	import type { AdminUserDetails, AuthResponse } from '$lib/admin/types';

	let user: AuthResponse | null = null;
	let details: AdminUserDetails | null = null;
	let loading = true;
	let error = '';

	onMount(async () => {
		try {
			const session = await adminApi.refresh();
			if (session.role !== 'ADMIN') throw new ApiError(403, 'Acesso negado');
			user = session;
			const userId = page.params.userId;
			if (!userId) throw new ApiError(400, 'Usuário inválido');
			details = await adminApi.userDetails(session.token, userId);
		} catch (cause) {
			error =
				cause instanceof ApiError && cause.status === 404
					? 'Usuário não encontrado.'
					: 'Não foi possível carregar os dados do usuário.';
		} finally {
			loading = false;
		}
	});

	async function logout() {
		await adminApi.logout().catch(() => undefined);
		user = null;
	}
</script>

<svelte:head
	><title>{details ? `${details.name} | Administração` : 'Usuário | Administração'}</title><meta
		name="robots"
		content="noindex,nofollow"
	/></svelte:head
>

{#if user}<AdminShell userName={user.name} active="users" onLogout={logout}>
		<a class="back-link" href="/admin">← Voltar para visão geral</a>
		{#if loading}<div class="state">Carregando usuário...</div>{:else if error}<div
				class="state error"
				role="alert"
			>
				{error}
			</div>{:else if details}
			<div class="heading">
				<div>
					<span class="eyebrow">Detalhes da conta</span>
					<h1>{details.name || 'Sem nome'}</h1>
					<p>{details.email}</p>
				</div>
				<AdminStatusBadge status={details.subscriptionStatus ?? 'INACTIVE'} />
			</div>
			<section class="grid" aria-label="Resumo do usuário">
				<div class="card">
					<span>Plano atual</span><strong>{details.planName ?? 'Sem plano'}</strong><small
						>{details.planCode ?? 'Nenhuma assinatura vinculada'}</small
					>
				</div>
				<div class="card">
					<span>Casamentos próprios</span><strong>{details.ownedWeddings}</strong>
				</div>
				<div class="card">
					<span>Membro ativo em</span><strong>{details.activeMemberWeddings}</strong>
				</div>
				<div class="card"><span>Eventos</span><strong>{details.events}</strong></div>
				<div class="card"><span>Convidados</span><strong>{details.guests}</strong></div>
				<div class="card">
					<span>E-mail verificado</span><strong>{details.emailVerified ? 'Sim' : 'Não'}</strong>
				</div>
			</section>
		{:else}<div class="state">Nenhum dado disponível.</div>{/if}
	</AdminShell>{:else}<main class="state error" role="alert">
		Sessão administrativa não encontrada.
	</main>{/if}

<style lang="scss">
	.back-link {
		display: inline-block;
		margin-bottom: 1.5rem;
		color: #84000b;
		font-size: 0.8rem;
		font-weight: 700;
		text-decoration: none;
	}
	.heading {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}
	.eyebrow {
		color: #b2475e;
		font-size: 0.67rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}
	h1 {
		margin-top: 0.5rem;
		color: #26322f;
		font-size: clamp(2rem, 4vw, 2.7rem);
	}
	.heading p {
		margin-top: 0.35rem;
		color: #78817e;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}
	.card {
		min-height: 110px;
		padding: 1.2rem;
		background: #fff;
		border: 1px solid #e7e9e6;
		border-radius: 12px;
	}
	.card span,
	.card small {
		display: block;
		color: #78817e;
		font-size: 0.75rem;
	}
	.card strong {
		display: block;
		margin: 0.55rem 0 0.25rem;
		color: #84000b;
		font-size: 1.45rem;
	}
	.state {
		padding: 4rem 1rem;
		color: #78817e;
		text-align: center;
	}
	.state.error {
		color: #8e3b32;
	}
	@media (max-width: 700px) {
		.grid {
			grid-template-columns: repeat(2, 1fr);
		}
		.heading {
			flex-direction: column;
		}
	}
</style>
