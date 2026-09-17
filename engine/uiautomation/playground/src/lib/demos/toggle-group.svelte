<script lang="ts">
	import * as ToggleGroup from '$generated/components/ToggleGroup';

	let { values = {} }: { values?: Record<string, string> } = $props();

	let align = $state('center');
	const options = [
		{ id: 'left', label: 'Left' },
		{ id: 'center', label: 'Center' },
		{ id: 'right', label: 'Right' }
	];
</script>

<ToggleGroup.Root type="single" bind:value={align} size={values.size}>
	{#each options as option (option.id)}
		<ToggleGroup.Item value={option.id} size={values.size} disabled={option.id === 'right'}>
			{option.label}
		</ToggleGroup.Item>
	{/each}
</ToggleGroup.Root>

<p class="pg-note">
	The same <code>control.toggle</code> role styles both this and the single Toggle - one role, two
	components, which is the only way a taxonomy pays for itself.
</p>
