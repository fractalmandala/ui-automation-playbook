<script lang="ts">
	// The list is the pipeline's output, not a hand-maintained array: `grouped`
	// comes from generated/plan/*.json, so generating a new component adds a
	// sidebar entry on reload with no edit here.
	import { demoCount, entries, grouped, summary } from './registry';

	let { slug = $bindable('') } = $props();
</script>

<nav class="pg-nav" aria-label="Generated components">
	<div>
		<h1 class="pg-nav-title">fractal ui</h1>
		<p class="pg-sub">
			{entries.length} components · {summary.errors} errors · {summary.warnings} warnings
		</p>
	</div>

	{#each grouped as section (section.group)}
		<div class="pg-nav-group">
			<span class="pg-nav-group-label">{section.group}</span>
			{#each section.entries as entry (entry.slug)}
				<button class="pg-nav-link" data-on={entry.slug === slug} onclick={() => (slug = entry.slug)}>
					<span>{entry.title}</span>
					{#if entry.errors}
						<span class="pg-nav-badge pg-err">{entry.errors}</span>
					{:else if entry.warnings}
						<span class="pg-nav-badge pg-warn">{entry.warnings}</span>
					{:else if entry.demo}
						<span class="pg-nav-badge pg-ok">✓</span>
					{:else}
						<span class="pg-nav-badge" title="no demo authored yet">·</span>
					{/if}
				</button>
			{/each}
		</div>
	{/each}

	<p class="pg-sub">
		{demoCount}/{entries.length} with demos · recipes/ → generated/
	</p>
</nav>
