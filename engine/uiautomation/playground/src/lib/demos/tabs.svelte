<script lang="ts">
	import * as Tabs from '$generated/components/Tabs';

	let { values = {} }: { values?: Record<string, string> } = $props();

	let value = $state('roles');
	const tabs = [
		{ body: 'A role is a name for a set of declarations. The recipe picks names; it never writes CSS.', id: 'roles', label: 'Roles' },
		{ body: 'Tokens come from the adapter. Component Sass may only name tokens a role in its own recipe reaches - a gate enforces it.', id: 'tokens', label: 'Tokens' },
		{ body: 'Axes are data. `data-size` is stamped by the wrapper, and each role declares which values it answers.', id: 'axes', label: 'Axes' }
	];
</script>

<Tabs.Root bind:value size={values.size}>
	<Tabs.List size={values.size}>
		{#each tabs as tab (tab.id)}
			<Tabs.Trigger value={tab.id} size={values.size}>{tab.label}</Tabs.Trigger>
		{/each}
	</Tabs.List>

	{#each tabs as tab (tab.id)}
		<Tabs.Content value={tab.id}>{tab.body}</Tabs.Content>
	{/each}
</Tabs.Root>
