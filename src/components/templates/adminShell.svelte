<script lang="ts">
	import AdminSidebar from '../organisms/adminSidebar.svelte';
	export let userName = 'Administrador';
	export let active = 'overview';
	export let onLogout: () => void;
</script>

<div class="admin-shell">
	<AdminSidebar {active} {onLogout} />
	<div class="admin-main">
		<header class="topbar">
			<div>
				<span class="overline">Simplesmente Sim</span>
				<p>Olá, {userName}</p>
			</div>
			<div class="account">
				<span class="avatar">{userName.slice(0, 1).toUpperCase()}</span><span>Conta admin</span>
			</div>
		</header>
		<main class="content"><slot /></main>
	</div>
</div>

<style lang="scss">
	.admin-shell {
		display: flex;
		min-height: 100vh;
		background: #f5f6f4;
		color: #26322f;
	}
	.admin-main {
		flex: 1;
		min-width: 0;
	}
	.topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 78px;
		padding: 1rem clamp(1.25rem, 4vw, 3rem);
		background: #fff;
		border-bottom: 1px solid #e7e9e6;
	}
	.overline {
		color: #9aa19f;
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}
	.topbar p {
		margin-top: 0.25rem;
		font-size: 0.9rem;
		font-weight: 600;
	}
	.account {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		color: #68736f;
		font-size: 0.78rem;
	}
	.avatar {
		display: grid;
		width: 30px;
		height: 30px;
		place-items: center;
		border-radius: 50%;
		color: #76101b;
		background: #f3dce1;
		font-size: 0.78rem;
		font-weight: 700;
	}
	.content {
		max-width: 1280px;
		margin: 0 auto;
		padding: clamp(1.25rem, 3vw, 2.75rem);
	}
</style>
