<script lang="ts">
	// Everything shown here comes from the resolved plan the compiler wrote, not
	// from re-deriving anything in the browser. The emitter renders the Sass from
	// this same object, so this panel cannot disagree with the stylesheet.
	import type { Entry } from './registry';

	let { entry, selected = $bindable(null) }: { entry: Entry; selected?: string | null } = $props();

	const part = $derived(entry.plan.parts.find((candidate) => candidate.partName === selected) ?? entry.plan.parts[0]);
</script>

<div class="pg-panel">
	<h2 class="pg-panel-title">
		<span>plan · {entry.title}.{part.exportName}</span>
		<span class="pg-sub">recipe order {entry.plan.parts.indexOf(part) + 1}/{entry.plan.parts.length}</span>
	</h2>

	<div class="pg-chip-row" style="margin-bottom: var(--space-2xs)">
		{#each entry.plan.parts as candidate (candidate.partName)}
			<button class="pg-chip" data-on={candidate.partName === part.partName} onclick={() => (selected = candidate.partName)}>
				.{candidate.className}
			</button>
		{/each}
		{#each entry.plan.passthrough as passthrough (passthrough.partName)}
			<span class="pg-chip" data-passthrough="true" title={passthrough.reason}>
				{passthrough.exportName} ↗
			</span>
		{/each}
	</div>

	<div class="pg-chip-row">
		{#each part.roles as role (role)}
			<span class="pg-role">{role}</span>
		{/each}
	</div>

	<div class="pg-table-scroll" style="margin-top: var(--space-2xs)">
		<table class="pg-table">
			<thead>
				<tr><th>from roles</th><th>resolved value</th></tr>
			</thead>
			<tbody>
				{#each part.declarations.base as [property, value] (property)}
					<tr><td>{property}</td><td>{value}</td></tr>
				{/each}
				{#each part.declarations.states as state (state.selector)}
					{#each state.declarations as [property, value] (`${state.selector}${property}`)}
						<tr><td>{state.selector} {property}</td><td>{value}</td></tr>
					{/each}
				{/each}
				{#each part.declarations.when as when (when.modifier)}
					{#each when.declarations as [property, value] (`${when.modifier}${property}`)}
						<tr><td>[{when.attribute}="{when.modifier.split('=')[1]}"] {property}</td><td>{value}</td></tr>
					{/each}
				{/each}
			</tbody>
		</table>
	</div>

	<p class="pg-sub" style="margin-top: var(--space-2xs)">
		&lt;{part.tag}&gt; · {part.file}
		{#if part.states.length}· states {part.states.join(', ')}{/if}
		{#if part.snippets.length}· snippets {part.snippets.join(', ')}{/if}
	</p>

	{#if entry.plan.unstyled?.[part.partName]?.length}
		<!-- The coverage gate's third answer: a state the designer has decided needs
		     no declaration. Recorded in the recipe, so it is a decision rather than
		     a missing one. -->
		<p class="pg-sub" style="margin: 0">
			deliberately unstyled: {entry.plan.unstyled[part.partName].join(', ')}
		</p>
	{/if}
</div>
