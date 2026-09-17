<script lang="ts">
	// Renders the selected component's demo once per value of its first axis, and
	// passes the rest as chips. Which axes exist, and which parts respond to them,
	// is read from the resolved plan - the frame has no per-component knowledge.
	//
	// Hover tracking reads data-slot off the live DOM instead of asking the
	// components to cooperate. If the pipeline ever stopped stamping data-slot, the
	// inspector would go blank - a useful canary.
	import type { Entry } from './registry';

	let { entry, selected = $bindable(null) }: { entry: Entry; selected?: string | null } = $props();

	let axis = $state<Record<string, string>>({});
	// Off by default: a dashed outline on every hover competes with the component
	// you are trying to look at. The inspector still follows the pointer either way.
	let outline = $state(false);

	// Reset the chip choices whenever the component changes.
	$effect(() => {
		axis = Object.fromEntries(entry.axes.map(({ name, default: value }) => [name, value]));
		selected = null;
	});

	const columns = $derived(entry.axes.length ? entry.axes[0].values : [null]);
	const rest = $derived(entry.axes.slice(1));
	const Demo = $derived(entry.demo);

	function trackPart(event: Event) {
		const target = event.target as HTMLElement | null;
		const slot = target?.closest?.('[data-slot]')?.getAttribute('data-slot');
		// data-slot is `<component>-<part>`; the component name is never hyphenated.
		if (slot) selected = slot.replace(/^[a-z]+-/, '');
	}
</script>

<div class="pg-panel">
	<h2 class="pg-panel-title">
		<span>live · real {entry.plan.source} behaviour · generated styling</span>
		{#if entry.axes.length}
			<span class="pg-sub">{entry.axes.map((a) => a.name).join(' + ')}</span>
		{/if}
	</h2>

	<div class="pg-controls" style="margin-bottom: var(--space-2xs)">
		{#each rest as { name, values } (name)}
			<span class="pg-field">{name}</span>
			{#each values as value (value)}
				<button class="pg-chip" data-on={axis[name] === value} onclick={() => (axis[name] = value)}>
					{value}
				</button>
			{/each}
		{/each}
		<button class="pg-chip" data-on={outline} onclick={() => (outline = !outline)} title="Outline the part under the pointer">
			outline parts
		</button>
		<span class="pg-sub">hover any part to inspect it →</span>
	</div>

	{#if entry.demo}
		<div class="pg-cols" data-count={columns.length}>
			{#each columns as column (column)}
				{@const values = { ...axis, ...(column === null ? {} : { [entry.axes[0].name]: column }) }}
				<div class="pg-col">
					{#if column !== null}
						<div class="pg-col-label">
							<span>{entry.axes[0].name}={column}</span>
							<span>{entry.axes[0].attribute}="{column}"</span>
						</div>
					{/if}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="pg-demo"
						data-outline={outline}
						onmouseover={trackPart}
						onfocusin={trackPart}
					>
						<Demo {values} />
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<p class="pg-note">
			No demo authored for {entry.title} yet. The recipe, the generated Sass, the plan and the
			gates below are all real - a demo is the one thing the pipeline cannot write, because it
			encodes how the component is meant to be used.
		</p>
	{/if}
</div>
