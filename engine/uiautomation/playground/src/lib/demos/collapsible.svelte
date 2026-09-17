<script lang="ts">
	import * as Collapsible from '$generated/components/Collapsible';

	let { values = {} }: { values?: Record<string, string> } = $props();

	let open = $state(true);
</script>

<Collapsible.Root bind:open size={values.size}>
	<Collapsible.Trigger size={values.size}>
		{open ? 'Hide' : 'Show'} the details
	</Collapsible.Trigger>
	<Collapsible.Content size={values.size}>
		The trigger's label reads <code>open</code> straight off the root: the wrapper keeps bits-ui's
		bindable props bindable, so <code>bind:</code> never silently stops working through the
		generated layer.
	</Collapsible.Content>
</Collapsible.Root>
