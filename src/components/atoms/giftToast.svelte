<script lang="ts">
	type ToastTone = 'success' | 'error' | 'info';

	let { message, tone = 'info' } = $props<{
		message: string;
		tone?: ToastTone;
	}>();
</script>

<div
	class:gift-toast--success={tone === 'success'}
	class:gift-toast--error={tone === 'error'}
	class="gift-toast"
>
	{message}
</div>
