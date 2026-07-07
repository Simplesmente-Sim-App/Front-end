<script lang="ts">
	import { Copy, ExternalLink, LoaderCircle, Settings } from '@lucide/svelte';

	let { publicUrl, sharing, tokenReady, onSettings, onCopy } = $props<{
		publicUrl: string;
		sharing: boolean;
		tokenReady: boolean;
		onSettings: () => void;
		onCopy: () => void | Promise<void>;
	}>();
</script>

<aside class="gift-panel gift-publish-panel">
	<div>
		<p class="gift-eyebrow">Publicacao</p>
		<h2>Link da lista</h2>
	</div>
	<p class="gift-public-link">{publicUrl || 'Configure o PIX para gerar o link publico.'}</p>
	<div class="gift-publish-actions">
		<button
			class="gift-button gift-button--secondary"
			type="button"
			onclick={onSettings}
			disabled={!tokenReady}
		>
			<Settings size={18} />
			Configurar
		</button>
		<button
			class="gift-button gift-button--primary"
			type="button"
			onclick={() => void onCopy()}
			disabled={!publicUrl || sharing}
		>
			{#if sharing}
				<LoaderCircle class="gift-spin" size={18} />
			{:else}
				<Copy size={18} />
			{/if}
			Copiar
		</button>
		<a
			class:disabled={!publicUrl}
			class="gift-icon-button"
			href={publicUrl || undefined}
			title="Abrir preview"
			aria-label="Abrir preview"
		>
			<ExternalLink size={18} />
		</a>
	</div>
</aside>
