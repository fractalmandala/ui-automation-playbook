<script lang="ts">
	import * as Slider from '$generated/components/Slider';

	let level = $state(60);
</script>

<div class="pg-stack">
	<Slider.Root type="single" bind:value={level} min={0} max={100} step={25}>
		<!-- The root's children snippet receives { tickItems, thumbItems } from
		     bits-ui. The wrapper forwards those arguments rather than calling the
		     snippet empty-handed, which is what makes this demo possible at all. -->
		{#snippet children(params)}
			{@const tickItems = params.tickItems as { index: number; value: number }[]}
			{@const thumbItems = params.thumbItems as { index: number; value: number }[]}
			<Slider.Range />
			{#each tickItems as tick (tick.index)}
				<Slider.Tick index={tick.index} />
			{/each}
			{#each thumbItems as thumb (thumb.index)}
				<Slider.Thumb index={thumb.index} />
			{/each}
		{/snippet}
	</Slider.Root>

	<div class="pg-row">
		<span class="pg-sub">value {level}</span>
	</div>
</div>
