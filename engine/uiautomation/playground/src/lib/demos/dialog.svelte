<script lang="ts">
	import * as Dialog from '$generated/components/Dialog';

	let { values = {} }: { values?: Record<string, string> } = $props();
</script>

<Dialog.Root>
	<Dialog.Trigger size={values.size}>Open dialog</Dialog.Trigger>

	<!-- Root and Portal are re-exported from bits-ui rather than wrapped: they render
	     no element, so there is no class for the pipeline to own. Everything under
	     them is generated. -->
	<Dialog.Portal>
		<Dialog.Overlay />
		<Dialog.Content size={values.size}>
			<Dialog.Title size={values.size}>Generated dialog</Dialog.Title>
			<Dialog.Description>
				The overlay is <code>surface.overlay</code>; the panel centres with
				<code>inset: 0; margin: auto</code>, because the role vocabulary has no composite-value
				syntax and a transform just to centre a box would be the wrong place to invent one.
			</Dialog.Description>
			<div class="pg-row" style="margin-top: var(--space-m)">
				<Dialog.Close size={values.size} aria-label="Close">×</Dialog.Close>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
