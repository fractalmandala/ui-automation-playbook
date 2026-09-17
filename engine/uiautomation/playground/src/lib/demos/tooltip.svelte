<script lang="ts">
	import * as Tooltip from '$generated/components/Tooltip';

	let { values = {} }: { values?: Record<string, string> } = $props();
</script>

<Tooltip.Provider>
	<div class="pg-row">
		<!-- delayDuration={0} only so the demo opens on the first hover; the default
		     is bits-ui's 700ms. -->
		<Tooltip.Root delayDuration={0}>
			<Tooltip.Trigger size={values.size}>Hover me</Tooltip.Trigger>
			<Tooltip.Portal>
				<Tooltip.Content side="top" sideOffset={6}>surface.floating + typography.muted</Tooltip.Content>
			</Tooltip.Portal>
		</Tooltip.Root>

		<Tooltip.Root>
			<Tooltip.Trigger size={values.size} disabled>Disabled</Tooltip.Trigger>
			<Tooltip.Portal>
				<Tooltip.Content side="top">Never shown</Tooltip.Content>
			</Tooltip.Portal>
		</Tooltip.Root>
	</div>
</Tooltip.Provider>

<p class="pg-note">
	Provider, Portal, Root and Arrow are re-exported from bits-ui, not wrapped: the provider and portal
	render nothing, and Root and Arrow render components. Four of seven parts, and the recipe says
	exactly that by leaving them out.
</p>
