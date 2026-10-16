<script lang="ts">
	let { children } = $props();
</script>

<div class="text-neutral-content container mx-auto max-w-3xl px-4 py-24">
	{@render children()}
</div>
