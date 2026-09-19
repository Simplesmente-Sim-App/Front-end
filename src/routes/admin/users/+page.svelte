<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import AdminShell from '../../../components/templates/adminShell.svelte';
	import AdminStatusBadge from '../../../components/atoms/adminStatusBadge.svelte';
	import { adminApi, ApiError } from '$lib/admin/api';
	import { logoutAdmin, restoreAdminSession, withAdminSession } from '$lib/admin/session';
	import type { AdminRole, AdminUser, AuthResponse } from '$lib/admin/types';

	let session = $state<AuthResponse | null>(null);
	let users = $state<AdminUser[]>([]);
	let metadata = $state({ number: 0, totalPages: 0, totalElements: 0, size: 20 });
	let loading = $state(true);
	let error = $state('');
	let query = $state('');
	let role = $state<AdminRole | ''>('');
	let planCode = $state('');
	let requestVersion = 0;
	let initialized = false;

	function syncFromUrl() {
		const params = page.url.searchParams;
		query = params.get('query') ?? '';
		role = (params.get('role') as AdminRole | '') || '';
		planCode = params.get('planCode') ?? '';
	}

	async function loadUsers(version: number) {
		loading = true;
		error = '';
		try {
			const current = await restoreAdminSession();
			if (!current) throw new ApiError(401, 'Sessão administrativa expirada.');
			session = current;
			const result = await withAdminSession((token) =>
				adminApi.users(token, {
					query: page.url.searchParams.get('query') || undefined,
					role: (page.url.searchParams.get('role') as AdminRole) || undefined,
					planCode: page.url.searchParams.get('planCode') || undefined,
					page: Number(page.url.searchParams.get('page') ?? 0),
					size: 20
				})
			);
			if (version === requestVersion) {
				users = result.content;
				metadata = result.page;
			}
		} catch (cause) {
			if (version === requestVersion)
				error =
					cause instanceof ApiError && cause.status === 403
						? 'Sua conta não tem permissão para acessar usuários.'
						: 'Não foi possível carregar os usuários.';
		} finally {
			if (version === requestVersion) loading = false;
		}
	}

	onMount(() => {
		syncFromUrl();
		initialized = true;
		const version = ++requestVersion;
		void loadUsers(version);
	});

	$effect(() => {
		const key = page.url.pathname + page.url.search;
		if (!initialized || !key) return;
		syncFromUrl();
		const version = ++requestVersion;
		void loadUsers(version);
	});

	async function applyFilters(event: SubmitEvent) {
		event.preventDefault();
		const params = new URLSearchParams();
		if (query.trim()) params.set('query', query.trim());
		if (role) params.set('role', role);
		await goto(`/admin/users?${params}`);
	}

	async function changePage(next: number) {
		const params = new URLSearchParams(page.url.search);
		params.set('page', String(next));
		await goto(`/admin/users?${params}`);
	}

	async function logout() {
		await logoutAdmin();
		session = null;
	}
</script>

<svelte:head
	><title>Usuários | Administração</title><meta
		name="robots"
		content="noindex,nofollow"
	/></svelte:head
>

{#if session}<AdminShell userName={session.name} active="users" onLogout={logout}>
		<div class="heading">
			<div>
				<span class="eyebrow">Workspace administrativo</span>
				<h1>Usuários</h1>
				<p>Pesquise e acompanhe as contas cadastradas.</p>
			</div>
			<strong class="total">{metadata.totalElements} usuários</strong>
		</div>
		<form class="filters" onsubmit={applyFilters}>
			<input
				aria-label="Buscar por nome ou e-mail"
				placeholder="Nome ou e-mail"
				bind:value={query}
			/><select aria-label="Filtrar por role" bind:value={role}
				><option value="">Todas as roles</option><option value="USER">Usuário</option><option
					value="ADMIN">Administrador</option
				></select
			><input
				aria-label="Filtro indisponível: assinatura é por casamento"
				placeholder="Código do plano"
				bind:value={planCode}
			/><button>Filtrar</button>
		</form>
		{#if error}<div class="alert" role="alert">
				{error}<button type="button" onclick={() => loadUsers(++requestVersion)}
					>Tentar novamente</button
				>
			</div>{/if}
		{#if loading}<div class="state">Carregando usuários...</div>{:else if !users.length}<div
				class="state"
			>
				Nenhum usuário encontrado.
			</div>{:else}<div class="table-wrap">
				<table>
					<thead><tr><th>Usuário</th><th>Conta</th><th>Assinaturas</th></tr></thead><tbody
						>{#each users as item}<tr
								><td
									><a href={`/admin/users/${item.id}`}
										><strong>{item.name || 'Sem nome'}</strong><small>{item.email}</small></a
									></td
								><td><AdminStatusBadge status={item.status} /></td><td
									>Consulte os casamentos e assinaturas no detalhe</td
								></tr
							>{/each}</tbody
					>
				</table>
			</div>
			<nav class="pagination" aria-label="Paginação de usuários">
				<button
					type="button"
					disabled={metadata.number <= 0}
					onclick={() => changePage(metadata.number - 1)}>Anterior</button
				><span>Página {metadata.number + 1} de {Math.max(metadata.totalPages, 1)}</span><button
					type="button"
					disabled={metadata.number + 1 >= metadata.totalPages}
					onclick={() => changePage(metadata.number + 1)}>Próxima</button
				>
			</nav>{/if}
	</AdminShell>{:else}<main class="state">Validando sessão administrativa...</main>{/if}

<style lang="scss">
	.heading {
		display: flex;
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
		margin-top: 0.5rem;
		color: #78817e;
	}
	.total {
		align-self: end;
		color: #84000b;
		font-size: 0.85rem;
	}
	.filters {
		display: grid;
		grid-template-columns: 1.5fr 1fr 1fr auto;
		gap: 0.65rem;
		margin-bottom: 1rem;
	}
	.filters input,
	.filters select {
		min-height: 42px;
		padding: 0 0.7rem;
		border: 1px solid #dfe4e1;
		border-radius: 7px;
		background: #fff;
		color: #26322f;
		font: inherit;
	}
	button {
		min-height: 42px;
		padding: 0 1rem;
		border: 0;
		border-radius: 7px;
		color: #fff;
		background: #84000b;
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.alert {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1rem;
		padding: 0.8rem 1rem;
		border: 1px solid #f0c5c2;
		border-radius: 8px;
		color: #8e3b32;
		background: #fff3f1;
	}
	.alert button {
		min-height: 34px;
		background: #8e3b32;
	}
	.state {
		padding: 4rem 1rem;
		color: #78817e;
		text-align: center;
	}
	.table-wrap {
		overflow-x: auto;
		padding: 0 1rem;
		border: 1px solid #e7e9e6;
		border-radius: 12px;
		background: #fff;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.82rem;
	}
	th {
		color: #9aa19f;
		font-size: 0.68rem;
		letter-spacing: 0.08em;
		text-align: left;
		text-transform: uppercase;
	}
	th,
	td {
		padding: 0.9rem 0.5rem;
		border-bottom: 1px solid #eef0ee;
	}
	td {
		color: #65706c;
	}
	td a {
		color: inherit;
		text-decoration: none;
	}
	td a:hover strong,
	td a:focus-visible strong {
		color: #84000b;
		text-decoration: underline;
	}
	td strong,
	td small {
		display: block;
	}
	td strong {
		color: #35413d;
	}
	td small {
		margin-top: 0.25rem;
		color: #9aa19f;
		font-size: 0.72rem;
	}
	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		margin-top: 1rem;
		color: #65706c;
		font-size: 0.8rem;
	}
	.pagination button {
		min-height: 36px;
		background: #84000b;
	}
	@media (max-width: 760px) {
		.filters {
			grid-template-columns: 1fr 1fr;
		}
		.filters input:first-child {
			grid-column: span 2;
		}
		.heading {
			align-items: flex-start;
			flex-direction: column;
		}
		.total {
			align-self: start;
		}
	}
</style>
