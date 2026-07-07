<script lang="ts">
	import GiftManagementPage from '../../../../components/templates/giftManagementPage.svelte';

	type PageData = {
		weddingId: string;
	};

	let { data } = $props<{ data: PageData }>();
	let weddingId = $derived(data.weddingId);
</script>

<GiftManagementPage {weddingId} />
