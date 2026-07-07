<script lang="ts">
	let {
		value,
		label,
		wide = false
	} = $props<{
		value: string | number;
		label: string;
		wide?: boolean;
	}>();
</script>

<div class:gift-metric--wide={wide} class="gift-metric">
	<span class="gift-metric__value">{value}</span>
	<p class="gift-metric__label">{label}</p>
</div>
