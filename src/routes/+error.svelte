<script>
	import { page } from '$app/state'
</script>


<div class="text-content mx-auto max-w-4xl px-4 pt-24
  pb-16 text-center font-main">

  <div class="error">
    <h1>{page.status}: {page.error?.message}</h1>
    <h2>sorry there, big guy...</h2>
  </div>

</div>

<style>
	.error {
		height: 100%;
		display: grid;
		place-content: center;
	}
</style>
