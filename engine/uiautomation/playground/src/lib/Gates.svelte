<script lang="ts">
	// report.json is written by scripts/check.mjs on every verification run, so
	// this panel shows the actual gate results rather than a hand-maintained list.
	import { gates, generatedCount, globalFindings, summary, type Entry } from './registry';

	let { entry }: { entry: Entry } = $props();

	let filter = $state<string | null>(null);

	const findings = $derived(
		[
			...entry.findings.map((finding) => ({ ...finding, scope: 'this component' })),
			...globalFindings.map((finding) => ({ ...finding, scope: 'all components' }))
		].filter((finding) => !filter || finding.gate === filter)
	);
</script>

<div class="pg-panel">
	<h2 class="pg-panel-title">
		<span>gate results</span>
		<span class={summary.errors ? 'pg-err' : summary.warnings ? 'pg-warn' : 'pg-ok'}>
			{summary.errors} errors · {summary.warnings} warnings
		</span>
	</h2>

	<div class="pg-chip-row">
		{#each gates as gate (gate.name)}
			<button
				class="pg-chip"
				data-on={filter === gate.name}
				onclick={() => (filter = filter === gate.name ? null : gate.name)}
			>
				{gate.label}
				<span class={gate.errors ? 'pg-err' : 'pg-warn'}>{gate.errors || gate.warnings}</span>
			</button>
		{/each}
	</div>

	<div style="margin-top: var(--space-2xs)">
		{#each findings as finding (finding.gate + finding.message)}
			<div class="pg-finding">
				<span class="pg-finding-tag">{finding.gate}</span>
				<span class={finding.level === 'error' ? 'pg-err' : 'pg-warn'}>{finding.message}</span>
			</div>
		{:else}
			<p class="pg-note">No findings for this component.</p>
		{/each}
	</div>

	<p class="pg-sub" style="margin-top: var(--space-2xs)">
		{generatedCount} generated files · {entry.plan.parts.length} styled parts ·
		{entry.plan.passthrough.length} re-exported untouched
	</p>
</div>
