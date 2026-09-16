<script lang="ts">
  import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
  import Store from '@lucide/svelte/icons/store';
  import Bell from '@lucide/svelte/icons/bell';
  import Activity from '@lucide/svelte/icons/activity';
  import Settings from '@lucide/svelte/icons/settings';
  import LogOut from '@lucide/svelte/icons/log-out';
  export let active = 'overview';
  export let onLogout: () => void;
  const items = [
    { id: 'overview', label: 'Visão geral', href: '/admin', icon: LayoutDashboard },
    { id: 'suppliers', label: 'Fornecedores', href: '/admin/suppliers', icon: Store },
    { id: 'notifications', label: 'Notificações', href: '/admin/notifications', icon: Bell },
    { id: 'operations', label: 'Operações', href: '/admin/operations', icon: Activity }
  ];
</script>

<aside class="sidebar">
  <a class="brand" href="/admin"><img src="/logo-favicon.svg" alt="" /><span>Administração</span></a>
  <p class="section-label">Workspace</p>
  <nav aria-label="Navegação administrativa">
    {#each items as item}
      <a class:active={active === item.id} href={item.href}><svelte:component this={item.icon} size={17} aria-hidden="true" />{item.label}</a>
    {/each}
  </nav>
  <div class="sidebar-bottom">
    <a href="/admin/settings"><Settings size={17} aria-hidden="true" />Configurações</a>
    <button type="button" onclick={onLogout}><LogOut size={17} aria-hidden="true" />Sair</button>
  </div>
</aside>

<style lang="scss">
  .sidebar { display: flex; flex-direction: column; width: 236px; min-height: 100vh; padding: 1.4rem 1rem; background: #fff; border-right: 1px solid #e7e9e6; }
  .brand { display: flex; align-items: center; gap: .7rem; padding: .3rem .6rem 2.25rem; color: #26322f; text-decoration: none; font-size: .9rem; font-weight: 700; }
  .brand img { width: 28px; height: 28px; object-fit: contain; }
  .section-label { padding: 0 .7rem .65rem; color: #9aa19f; font-size: .65rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
  nav, .sidebar-bottom { display: grid; gap: .25rem; }
  nav a, .sidebar-bottom a, .sidebar-bottom button { display: flex; align-items: center; gap: .7rem; padding: .7rem .75rem; border: 0; border-radius: 8px; color: #6d7773; background: transparent; font: inherit; font-size: .82rem; text-decoration: none; cursor: pointer; text-align: left; }
  nav a:hover, .sidebar-bottom a:hover, .sidebar-bottom button:hover, nav a.active { color: #84000b; background: #f9e8eb; }
  .sidebar-bottom { margin-top: auto; padding-top: 1rem; border-top: 1px solid #edf0ed; }
  @media (max-width: 760px) { .sidebar { width: 68px; padding-inline: .55rem; } .brand { justify-content: center; padding-inline: 0; } .brand span, .section-label, nav a:not(.active)::after, nav a, .sidebar-bottom a, .sidebar-bottom button { font-size: 0; } nav a, .sidebar-bottom a, .sidebar-bottom button { justify-content: center; } .brand img { width: 32px; height: 32px; } }
</style>
