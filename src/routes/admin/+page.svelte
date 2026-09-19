<script lang="ts">
	import { onMount } from 'svelte';
	import AdminShell from '../../components/templates/adminShell.svelte';
	import AdminMetricCard from '../../components/molecules/adminMetricCard.svelte';
	import AdminStatusBadge from '../../components/atoms/adminStatusBadge.svelte';
	import { adminApi, ApiError } from '$lib/admin/api';
	import type { AuthResponse, OperationOverview } from '$lib/admin/types';
	import {
		loginAdmin,
		logoutAdmin,
		restoreAdminSession,
		withAdminSession
	} from '$lib/admin/session';

	let token = '';
	let user: AuthResponse | null = null;
	let email = '';
	let password = '';
	let rememberMe = false;
	let overview: OperationOverview | null = null;
	let userSummary: import('$lib/admin/types').AdminUserSummary | null = null;
	let users: import('$lib/admin/types').AdminUser[] = [];
	let loading = true;
	let loginLoading = false;
	let error = '';
	let refreshCycle = 0;
	let refreshingSession = false;
	let refreshTimer: ReturnType<typeof setTimeout> | undefined;
	let lastUpdatedAt: Date | null = null;

	function errorMessage(cause: unknown, context: 'login' | 'dashboard'): string {
		if (cause instanceof ApiError) {
			if (context === 'login' && (cause.status === 401 || cause.status === 403))
				return 'E-mail ou senha inválidos.';
			if (cause.status === 403) return 'Sua conta não tem permissão para acessar o painel.';
			if (cause.status === 401) return 'Sua sessão expirou. Entre novamente.';
			if (cause.status >= 500)
				return 'O serviço está indisponível no momento. Tente novamente em instantes.';
		}
		if (cause instanceof TypeError)
			return 'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.';
		return context === 'login'
			? 'Não foi possível entrar agora. Tente novamente.'
			: 'Não foi possível carregar os dados do painel.';
	}

	onMount(() => {
		const initialize = async () => {
			try {
				const response = await restoreAdminSession();
				if (!response) return;
				if (response.role === 'ADMIN') {
					token = response.token;
					user = response;
					await loadDashboard();
				}
			} catch {
				/* login required */
			} finally {
				loading = false;
			}
		};
		void initialize();
	});

	function refreshData() {
		return loadDashboard();
	}

	async function loadDashboard() {
		loading = true;
		error = '';
		try {
			[overview, userSummary] = await withAdminSession((sessionToken) =>
				Promise.all([adminApi.overview(sessionToken), adminApi.userSummary(sessionToken)])
			);
			users = (await withAdminSession((sessionToken) => adminApi.users(sessionToken))).content;
			lastUpdatedAt = new Date();
			scheduleRefresh();
		} catch (cause) {
			if (cause instanceof ApiError && cause.status === 401 && !refreshingSession) {
				refreshingSession = true;
				try {
					const response = await adminApi.refresh();
					token = response.token;
					user = response;
					return await loadDashboard();
				} catch {
					/* session is no longer valid */
				} finally {
					refreshingSession = false;
				}
			}
			error = errorMessage(cause, 'dashboard');
			if (cause instanceof ApiError && (cause.status === 401 || cause.status === 403))
				await logout();
		} finally {
			loading = false;
			refreshCycle += 1;
		}
	}

	function scheduleRefresh() {
		if (refreshTimer) clearTimeout(refreshTimer);
		refreshTimer = setTimeout(() => {
			if (!loading) void refreshData();
		}, 20000);
	}

	async function login() {
		if (loginLoading) return;
		error = '';
		if (!email.trim() || !password) {
			error = 'Informe seu e-mail e sua senha.';
			return;
		}
		loginLoading = true;
		try {
			const response = await loginAdmin(email.trim(), password, rememberMe);
			if (response.role !== 'ADMIN')
				throw new Error('Esta conta não possui acesso administrativo.');
			token = response.token;
			user = response;
			password = '';
			await loadDashboard();
		} catch (cause) {
			error =
				cause instanceof Error && !(cause instanceof ApiError)
					? cause.message
					: errorMessage(cause, 'login');
			token = '';
			user = null;
		} finally {
			loginLoading = false;
		}
	}

	async function logout() {
		await logoutAdmin();
		if (refreshTimer) clearTimeout(refreshTimer);
		token = '';
		user = null;
		overview = null;
		userSummary = null;
		users = [];
	}
</script>

<svelte:head
	><title>Administração | Simplesmente Sim</title><meta
		name="robots"
		content="noindex,nofollow"
	/></svelte:head
>

{#if !token}
	<main class="login-page">
		<section class="login-card" aria-labelledby="login-title">
			<img src="/logo-favicon.svg" alt="" /><span class="eyebrow">Área restrita</span>
			<h1 id="login-title">Acesso administrativo</h1>
			<p>Entre com uma conta ADMIN para gerenciar os recursos da plataforma.</p>
			<form
				aria-busy={loginLoading}
				onsubmit={(event) => {
					event.preventDefault();
					login();
				}}
			>
				<label for="email">E-mail</label><input
					id="email"
					type="email"
					bind:value={email}
					autocomplete="email"
					aria-invalid={Boolean(error)}
					aria-describedby={error ? 'login-error' : undefined}
					required
				/><label for="password">Senha</label><input
					id="password"
					type="password"
					bind:value={password}
					autocomplete="current-password"
					aria-invalid={Boolean(error)}
					aria-describedby={error ? 'login-error' : undefined}
					required
				/><label class="remember"
					><input type="checkbox" bind:checked={rememberMe} /> Lembrar de mim por 30 dias</label
				><button type="submit" disabled={loginLoading}
					>{loginLoading ? 'Entrando...' : 'Entrar no painel'}</button
				>{#if error}<p id="login-error" class="error" role="alert">{error}</p>{/if}
			</form>
		</section>
	</main>
{:else}
	<AdminShell userName={user?.name ?? 'Administrador'} onLogout={logout}>
		<div class="page-heading">
			<div>
				<span class="eyebrow">Workspace administrativo</span>
				<h1>Visão geral</h1>
				<p>Acompanhe a operação e os recursos disponíveis no Simplesmente Sim.</p>
			</div>
			<div class="refresh-control">
				<button
					class="refresh"
					type="button"
					onclick={refreshData}
					disabled={loading}
					aria-busy={loading}
					>{#if loading}<span class="loading-spinner" aria-hidden="true"
						></span>Atualizando...{:else}Atualizar dados{/if}{#if !loading}{#key refreshCycle}<span
								class="refresh-progress"
								role="progressbar"
								aria-label="Próxima atualização automática"
							></span>{/key}{/if}</button
				>
			</div>
		</div>
		{#if error}<div class="alert" role="alert">{error}</div>{/if}
		{#if loading}<div class="loading">Carregando dados da operação...</div>{:else}
			<section class="metrics" aria-label="Métricas de usuários">
				<AdminMetricCard
					label="Usuários cadastrados"
					value={userSummary?.totalUsers ?? 0}
					detail="Contados sem duplicação"
				/><AdminMetricCard
					label="Sem plano"
					value={userSummary?.usersWithoutPlan ?? 0}
					detail="Precisam de acompanhamento"
					tone={userSummary?.usersWithoutPlan ? 'warning' : 'default'}
				/><AdminMetricCard
					label="Eventos totais"
					value={overview?.totalEvents ?? 0}
					detail="Registrados pela aplicação"
				/><AdminMetricCard
					label="Eventos recentes"
					value={overview?.last24HoursEvents ?? 0}
					detail="Últimas 24 horas"
				/>
			</section>
			<section class="split-panels">
				<section class="panel">
					<div class="panel-heading">
						<div>
							<h2>Usuários por plano</h2>
							<p>Distribuição dos usuários cadastrados.</p>
						</div>
					</div>
					{#if userSummary?.byPlan.length}<div class="plan-list">
							{#each userSummary.byPlan as plan}<div class="plan-row">
									<span>{plan.planName}<small>{plan.planCode}</small></span><strong
										>{plan.userCount}</strong
									>
								</div>{/each}
						</div>{:else}<div class="empty">Nenhum plano encontrado.</div>{/if}
				</section>
				<section class="panel">
					<div class="panel-heading">
						<div>
							<h2>Usuários recentes</h2>
							<p>Contas criadas mais recentemente.</p>
						</div>
						<a href="/admin/users">Ver todos</a>
					</div>
					{#if users.length}<div class="table-wrap">
							<table>
								<thead><tr><th>Usuário</th><th>Plano</th><th>Status</th></tr></thead><tbody
									>{#each users as adminUser}<tr
											><td
												><a class="user-link" href={`/admin/users/${adminUser.id}`}
													><strong>{adminUser.name || 'Sem nome'}</strong><small
														>{adminUser.email}</small
													></a
												></td
											><td>{adminUser.planName ?? 'Sem plano'}</td><td
												><AdminStatusBadge
													status={adminUser.subscriptionStatus ?? 'INACTIVE'}
												/></td
											></tr
										>{/each}</tbody
								>
							</table>
						</div>{:else}<div class="empty">Nenhum usuário encontrado.</div>{/if}
				</section>
			</section>
		{/if}
	</AdminShell>
{/if}

<style lang="scss">
	.login-page {
		display: grid;
		min-height: 100vh;
		place-items: center;
		padding: 1.5rem;
		background: #f5f6f4;
	}
	.login-card {
		width: min(100%, 420px);
		padding: 2.25rem;
		background: #fff;
		border: 1px solid #e7e9e6;
		border-radius: 14px;
		box-shadow: 0 18px 50px rgba(52, 50, 44, 0.08);
	}
	.login-card > img {
		display: block;
		width: 48px;
		height: 48px;
		margin-bottom: 2rem;
		object-fit: contain;
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
		font-size: clamp(2rem, 4vw, 2.75rem);
		letter-spacing: -0.04em;
	}
	.login-card > p,
	.page-heading p,
	.panel-heading p {
		margin-top: 0.55rem;
		color: #78817e;
		font-size: 0.86rem;
		line-height: 1.55;
	}
	form {
		display: grid;
		gap: 0.45rem;
		margin-top: 1.75rem;
	}
	label {
		margin-top: 0.55rem;
		color: #4d5955;
		font-size: 0.78rem;
		font-weight: 600;
	}
	input {
		height: 44px;
		padding: 0 0.8rem;
		border: 1px solid #dfe4e1;
		border-radius: 7px;
		color: #26322f;
		background: #fbfcfb;
		font: inherit;
	}
	button {
		height: 44px;
		margin-top: 0.85rem;
		border: 0;
		border-radius: 7px;
		color: #fff;
		background: #84000b;
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.65;
		cursor: wait;
	}
	button:focus-visible,
	a:focus-visible,
	input:focus-visible {
		outline: 2px solid #cc8799;
		outline-offset: 2px;
	}
	.error,
	.alert {
		color: #8e3b32;
		font-size: 0.78rem;
	}
	.page-heading {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.75rem;
	}
	.page-heading h1 {
		font-size: clamp(2rem, 4vw, 2.7rem);
	}
	.refresh {
		margin: 0;
		padding: 0 1rem;
		color: #84000b;
		background: #f9e8eb;
	}
	.loading,
	.empty {
		padding: 3rem;
		color: #78817e;
		text-align: center;
	}
	.alert {
		margin-bottom: 1rem;
		padding: 0.85rem 1rem;
		border: 1px solid #f0c5c2;
		border-radius: 8px;
		background: #fff3f1;
	}
	.metrics {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
	}
	.split-panels {
		display: grid;
		grid-template-columns: minmax(220px, 0.75fr) minmax(0, 1.25fr);
		gap: 1rem;
	}
	.panel {
		margin-top: 1rem;
		padding: 1.25rem;
		background: #fff;
		border: 1px solid #e7e9e6;
		border-radius: 12px;
	}
	.panel-heading {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1rem;
	}
	h2 {
		color: #26322f;
		font-size: 1.1rem;
	}
	.panel-heading a {
		color: #84000b;
		font-size: 0.78rem;
		font-weight: 700;
		text-decoration: none;
	}
	.plan-list {
		display: grid;
		gap: 0.25rem;
	}
	.plan-row {
		display: flex;
		justify-content: space-between;
		padding: 0.8rem 0;
		border-bottom: 1px solid #eef0ee;
		color: #35413d;
		font-size: 0.84rem;
	}
	.plan-row small {
		display: block;
		margin-top: 0.25rem;
		color: #9aa19f;
		font-size: 0.7rem;
	}
	.plan-row strong {
		color: #84000b;
		font-size: 1.1rem;
	}
	.table-wrap {
		overflow-x: auto;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.8rem;
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
		padding: 0.8rem 0.5rem;
		border-bottom: 1px solid #eef0ee;
	}
	td {
		color: #65706c;
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
	@media (max-width: 900px) {
		.metrics {
			grid-template-columns: repeat(2, 1fr);
		}
		.split-panels {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 600px) {
		.page-heading {
			align-items: flex-start;
			flex-direction: column;
		}
		.metrics {
			grid-template-columns: 1fr 1fr;
			gap: 0.65rem;
		}
		:global(.metric-card) {
			padding: 0.9rem;
		}
		.panel {
			padding: 0.85rem;
		}
		:global(.account > span:last-child) {
			display: none;
		}
	}
	.refresh-control {
		position: relative;
		display: grid;
		width: 160px;
		gap: 0.45rem;
	}
	.refresh {
		width: 100%;
		height: auto;
		min-height: 44px;
		padding: 0.65rem 1rem 0.55rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}
	.loading-spinner {
		width: 0.85rem;
		height: 0.85rem;
		border: 2px solid rgba(132, 0, 11, 0.22);
		border-top-color: #84000b;
		border-radius: 50%;
		animation: refresh-spinner 0.7s linear infinite;
	}
	.refresh-progress {
		position: absolute;
		bottom: 0;
		left: 0;
		display: block;
		width: 100%;
		height: 3px;
		border-radius: 999px;
		background: #650008;
		transform-origin: left;
		animation: refresh-countdown 20s linear forwards;
	}
	@keyframes refresh-countdown {
		from {
			transform: scaleX(1);
		}
		to {
			transform: scaleX(0);
		}
	}
	@keyframes refresh-spinner {
		to {
			transform: rotate(360deg);
		}
	}
</style>
