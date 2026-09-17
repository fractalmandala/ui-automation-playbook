<script lang="ts">
	import * as Button from '$generated/components/Button';

	let { values = {} }: { values?: Record<string, string> } = $props();
</script>

<div class="pg-stack">
	<div class="pg-row">
		<Button.Root size={values.size}>Save changes</Button.Root>
		<Button.Root size={values.size} disabled>Disabled</Button.Root>
		<Button.Root size={values.size} onclick={() => alert('Solid button clicked')}>Clickable</Button.Root>
	</div>
	<p class="pg-note">
		One part, and the anatomy records its tag as <code>svelte:element</code>: bits-ui renders a
		<code>&lt;button&gt;</code> or an <code>&lt;a&gt;</code> from its own props, and the generated class
		lands on whichever it picks. The emitter has no branch for that.
	</p>
</div>
