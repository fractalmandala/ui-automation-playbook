<script lang="ts">
	import * as Checkbox from '$generated/components/Checkbox';

	// Inside a Checkbox.Group the group's `value` array owns the state - each
	// root derives its checked state from `value.includes(...)`, so binding a
	// root's `checked` here would be overwritten on the first flush. The demo is
	// written the way the library actually works.
	let selected = $state<string[]>(['telemetry']);
	let indeterminate = $state(true);
</script>

<Checkbox.Group name="features" bind:value={selected}>
	<Checkbox.GroupLabel>Enabled features</Checkbox.GroupLabel>

	<label class="pg-label">
		<Checkbox.Root value="telemetry">
			{#if selected.includes('telemetry')}✓{/if}
		</Checkbox.Root>
		Telemetry
	</label>

	<label class="pg-label">
		<Checkbox.Root value="experiments" bind:indeterminate>
			{#if indeterminate}−{/if}
		</Checkbox.Root>
		Experiments <span class="pg-sub">(indeterminate)</span>
	</label>

	<label class="pg-label">
		<Checkbox.Root value="unsupported" disabled />
		Locked out <span class="pg-sub">(disabled)</span>
	</label>
</Checkbox.Group>
