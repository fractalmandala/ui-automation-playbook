<script lang="ts">
	// The shell. Three columns, and every one of them is driven by the pipeline's
	// own output: the sidebar by generated/plan/*.json, the demo frame by the axes
	// the plan resolved, the panels by the plan and by report.json.
	import Code from './lib/Code.svelte';
	import DemoFrame from './lib/DemoFrame.svelte';
	import Gates from './lib/Gates.svelte';
	import Inspector from './lib/Inspector.svelte';
	import Sidebar from './lib/Sidebar.svelte';
	import Tokens from './lib/Tokens.svelte';
	import { entries, generatedCount, summary } from './lib/registry';

	let slug = $state(entries[0]?.slug ?? '');
	let selected = $state<string | null>(null);
	// Falls back rather than throwing, so a checkout whose pipeline has not run
	// shows an empty shell instead of a blank screen.
	const entry = $derived(entries.find((candidate) => candidate.slug === slug) ?? entries[0]);
</script>

{#if entry}
	<div class="pg-shell">
		<Sidebar bind:slug />

		<main class="pg-main">
			<header class="pg-header">
				<div>
					<h2 class="pg-title">{entry.title}</h2>
					<p class="pg-sub">{entry.blurb}</p>
					<p class="pg-sub">
						recipes/{entry.slug}.json → {entry.plan.parts.length} generated wrapper(s) over real
						{entry.plan.source}{entry.plan.passthrough.length
							? ` · ${entry.plan.passthrough.length} part(s) re-exported untouched`
							: ''}
					</p>
				</div>
				<div class="pg-chip-row">
					<span class="pg-chip" data-on={summary.errors === 0}>
						{summary.errors ? '✕' : '✓'} {summary.errors} errors
					</span>
					<span class="pg-chip">{summary.warnings} warnings</span>
					<span class="pg-chip">{generatedCount} files</span>
				</div>
			</header>

			<DemoFrame {entry} bind:selected />
			<Code {entry} {selected} />
		</main>

		<aside class="pg-side">
			<Inspector {entry} bind:selected />
			<Gates {entry} />
			<Tokens {entry} />
		</aside>
	</div>
{:else}
	<p class="pg-note" style="padding: var(--space-m)">
		No generated components found. Run <code>pnpm --dir ../pipeline verify</code>, then reload.
	</p>
{/if}
