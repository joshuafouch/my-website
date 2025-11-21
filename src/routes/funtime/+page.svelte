<script lang="ts">
	import { onMount } from 'svelte';

	let colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8'];
	let currentColor = 0;

	onMount(() => {
		const interval = setInterval(() => {
			currentColor = (currentColor + 1) % colors.length;
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>🎉 Secret Funtime Zone!</title>
</svelte:head>

<div class="funtime-container" style="background-color: {colors[currentColor]}">
	<div class="content">
		<h1 class="title">🎉 YOU FOUND THE SECRET PAGE! 🎉</h1>
		<p class="subtitle">Welcome to the funtime zone!</p>
		<div class="emoji-parade">
			<span>🎊</span>
			<span>🎈</span>
			<span>🎯</span>
			<span>🎪</span>
			<span>🎨</span>
			<span>🎭</span>
			<span>🎸</span>
			<span>🎮</span>
		</div>
		<p class="secret-text">Shhh... this is a secret! 🤫</p>
	</div>
</div>

<style>
	.funtime-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background-color 1s ease;
		padding: 2rem;
	}

	.content {
		text-align: center;
		color: white;
		max-width: 600px;
	}

	.title {
		font-size: 3rem;
		font-weight: bold;
		margin-bottom: 1rem;
		animation: bounce 2s infinite;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
	}

	.subtitle {
		font-size: 1.5rem;
		margin-bottom: 2rem;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
	}

	.emoji-parade {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin: 2rem 0;
	}

	.emoji-parade span {
		font-size: 3rem;
		animation: spin 3s infinite;
		display: inline-block;
	}

	.emoji-parade span:nth-child(1) { animation-delay: 0s; }
	.emoji-parade span:nth-child(2) { animation-delay: 0.2s; }
	.emoji-parade span:nth-child(3) { animation-delay: 0.4s; }
	.emoji-parade span:nth-child(4) { animation-delay: 0.6s; }
	.emoji-parade span:nth-child(5) { animation-delay: 0.8s; }
	.emoji-parade span:nth-child(6) { animation-delay: 1s; }
	.emoji-parade span:nth-child(7) { animation-delay: 1.2s; }
	.emoji-parade span:nth-child(8) { animation-delay: 1.4s; }

	.secret-text {
		font-size: 1.25rem;
		margin-top: 2rem;
		font-style: italic;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
	}

	@keyframes bounce {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-20px); }
	}

	@keyframes spin {
		0%, 100% { transform: rotate(0deg); }
		25% { transform: rotate(10deg); }
		75% { transform: rotate(-10deg); }
	}

	@media (max-width: 768px) {
		.title {
			font-size: 2rem;
		}

		.subtitle {
			font-size: 1.25rem;
		}

		.emoji-parade span {
			font-size: 2rem;
		}
	}
</style>
