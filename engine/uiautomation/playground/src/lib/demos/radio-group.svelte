<script lang="ts">
	import * as RadioGroup from '$generated/components/RadioGroup';

	let choice = $state('balanced');
	const options = [
		{ id: 'fast', label: 'Fast' },
		{ id: 'balanced', label: 'Balanced' },
		{ disabled: true, id: 'paranoid', label: 'Paranoid' }
	];
</script>

<RadioGroup.Root bind:value={choice} orientation="vertical">
	{#each options as option (option.id)}
		<label class="pg-label">
			<RadioGroup.Item value={option.id} disabled={option.disabled} />
			{option.label}
			{#if option.disabled}<span class="pg-sub">(disabled)</span>{/if}
		</label>
	{/each}
</RadioGroup.Root>
