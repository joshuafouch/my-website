<script>
  import { fly } from 'svelte/transition';
  import { links } from '$lib/config';
 
  export let open = false;
</script>

{#if open}
  <div
    role="button"
    tabindex="0"
    on:click={() => (open = false)}
    on:keydown={(e) => e.key === 'Enter' && (open = false)}
    class="fixed inset-0 bg-black/60 z-40"
    transition:fly={{ duration: 300, x: '100%' }}
  ></div>
	<aside
		class="fixed top-0 right-0 h-min w-64 bg-base-200/80 backdrop-blur-md z-[60] p-4 rounded-l-xl shadow-lg shadow-info"
		transition:fly={{ duration: 300, x: '100%' }}
	>
		<ul class="flex flex-col justify-center gap-4 ">
			{#each links as link (link.href)}
				<li>
					<a href={link.href} on:click={() => (open = false)}
						class="btn btn-ghost font-title text-xl w-full hover:text-success">{link.text}</a>
				</li>
			{/each}
		</ul>
	</aside>
{/if}
