<script lang="ts">
	// The demo is the only hand-written part of a component page: it says how the
	// parts are meant to be composed. `values` carries the axis picks the frame
	// derived from the plan (size columns, tone chips).
	import * as Accordion from '$generated/components/Accordion';

	let { values = {} }: { values?: Record<string, string> } = $props();

	let open = $state('two');
	const items = [
		{ body: 'Five parts, five roles, one Sass block. No inline styles anywhere.', id: 'one', title: 'What owns the styling here?' },
		{ body: 'bits-ui builds data-state, data-disabled and data-orientation in its state classes; the roles match on exactly those hooks.', id: 'two', title: 'How does the state reach CSS?' },
		{ body: 'Disabled on the item, so this trigger should ignore pointer and keyboard activation.', disabled: true, id: 'three', title: 'A disabled item' }
	];
</script>

<div class="pg-stack">
	<Accordion.Root type="single" bind:value={open} size={values.size}>
		{#each items as item (item.id)}
			<Accordion.Item value={item.id} size={values.size} tone={values.tone} disabled={item.disabled}>
				<Accordion.Header size={values.size}>
					<Accordion.Trigger size={values.size}>{item.title}</Accordion.Trigger>
				</Accordion.Header>
				<Accordion.Content size={values.size}>{item.body}</Accordion.Content>
			</Accordion.Item>
		{/each}
	</Accordion.Root>
	<p class="pg-note">
		<code>tone</code> only appears on Item, because only <code>surface.raised</code> answers the tone
		axis - the wrapper knows that from the recipe, not from a prop list.
	</p>
</div>
