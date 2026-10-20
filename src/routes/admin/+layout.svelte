<script lang="ts">
  import { resolve } from '$app/paths';

  let { data, children } = $props();
</script>

<div class="text-neutral-content container mx-auto max-w-4xl px-4 py-24">
  {#if data.isAdmin}
    <div class="mb-8 flex items-center justify-between gap-4">
      {#if data.needsMfa}
        <span></span>
      {:else}
        <div class="flex items-center gap-4">
          <a href={resolve('/admin')} class="font-title text-lg">Posts</a>
          <a href={resolve('/admin/mfa')} class="font-main text-sm opacity-70">Authenticator</a>
        </div>
      {/if}
      <form method="POST" action="/admin/logout">
        <button class="btn btn-ghost btn-sm font-main" type="submit">Log out</button>
      </form>
    </div>
  {/if}

  {@render children()}
</div>
