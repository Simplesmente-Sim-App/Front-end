<script lang="ts">
	let { title, message } = $props<{
		title: string;
		message: string;
	}>();
</script>

<section class="gift-notice" aria-live="polite">
	<strong>{title}</strong>
	<span>{message}</span>
</section>
