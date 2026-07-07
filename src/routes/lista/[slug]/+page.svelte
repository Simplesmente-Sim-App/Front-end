<script lang="ts">
	import PublicGiftListPage from '../../../components/templates/publicGiftListPage.svelte';

	type PageData = {
		slug: string;
	};

	let { data } = $props<{ data: PageData }>();
	let slug = $derived(data.slug);
</script>

<PublicGiftListPage {slug} />
