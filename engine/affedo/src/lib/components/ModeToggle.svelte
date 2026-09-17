<script lang="ts">
	import { onMount } from 'svelte';
	import { mode, toggleMode, initMode } from '$lib/states/mode.svelte';

	let { class: className = '', size = 18 }: { class?: string; size?: number } = $props();

	onMount(() => {
		initMode();
	});

	const isDark = $derived(mode.current === 'dark');
</script>

<button
	type="button"
	class="mode-toggle-btn {className}"
	aria-pressed={isDark}
	aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
	title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
	onclick={() => toggleMode()}
>
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		{#if isDark}
			<!-- Sun Icon (showing while dark mode is active to switch to light) -->
			<circle cx="12" cy="12" r="4" fill="currentColor" />
			<line x1="12" y1="2" x2="12" y2="4" />
			<line x1="12" y1="20" x2="12" y2="22" />
			<line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
			<line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
			<line x1="2" y1="12" x2="4" y2="12" />
			<line x1="20" y1="12" x2="22" y2="12" />
			<line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
			<line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
		{:else}
			<!-- Moon Icon (showing while light mode is active to switch to dark) -->
			<path
				d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
				fill="currentColor"
			/>
		{/if}
	</svg>
</button>

<style>
	.mode-toggle-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 4px;
		color: var(--text-secondary);
		padding: 4px 8px;
		font-size: 12px;
		cursor: pointer;
		transition: all 0.15s ease;
		box-sizing: border-box;
	}

	.mode-toggle-btn:hover {
		border-color: var(--text-primary);
		color: var(--text-primary);
	}
</style>
