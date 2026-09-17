<script lang="ts">
	// Only the tokens this component actually reaches, read back out of its own
	// plan. Overriding one writes straight to :root - the same variable the
	// generated stylesheet defines - and the component follows with no re-render.
	import adapter from '$pipeline/tokens/kitui.json';
	import { usedTokens, type Entry } from './registry';
	import { applyToken, overrides, resetTokens } from './state.svelte';

	let { entry }: { entry: Entry } = $props();

	const tokens = $derived(
		usedTokens(entry.plan)
			.filter((name) => `--${name}` in adapter.values)
			.map((name) => [`--${name}`, adapter.values[`--${name}`]] as const)
	);

	const isColour = (value: string) => /^#|^rgb/.test(value);
	// Offered regardless of the component: proving that an override crosses
	// component boundaries is the point of writing them to :root.
	const editable = ['--accent', '--bg', '--radius-m', '--space-s'];
</script>

<div class="pg-panel">
	<h2 class="pg-panel-title">
		<span>tokens · {adapter.name}</span>
		<span class="pg-sub">{tokens.length} reached by this recipe</span>
	</h2>

	{#each tokens as [name, value] (name)}
		<div class="pg-token-row">
			<span>{name}</span>
			<span class="pg-token-value" title={value}>{value}</span>
			{#if isColour(value)}
				<span class="pg-swatch" style="background: var({name})"></span>
			{/if}
		</div>
	{/each}
</div>

<div class="pg-panel">
	<h2 class="pg-panel-title">
		<span>live override · writes to :root</span>
		<button class="pg-chip" onclick={resetTokens}>reset</button>
	</h2>
	<div class="pg-controls">
		{#each editable as name (name)}
			<label class="pg-field">
				{name}
				<input
					class="pg-token-value"
					style="width: 96px"
					value={overrides[name] ?? adapter.values[name]}
					oninput={(event) => applyToken(name, event.currentTarget.value)}
				/>
			</label>
		{/each}
	</div>
</div>
