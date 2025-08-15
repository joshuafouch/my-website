<script lang="ts">
	import { fade } from "svelte/transition";

	let response = false;

	function toggleResponse() {
		response = !response
	}

</script>

{#if response}
  <blockquote transition:fade={{delay: 300, duration: 350}} class="text-xl font-title pt-5"> 
		Glory to Him forever.
  </blockquote>
{/if}

<button class="btn btn-primary" on:click={toggleResponse}><span class="font-main">Respond</span></button>

