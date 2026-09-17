<script lang="ts">
	import * as Pagination from '$generated/components/Pagination';

	let { values = {} }: { values?: Record<string, string> } = $props();

	let page = $state(3);
</script>

<div class="pg-stack">
	<Pagination.Root count={50} perPage={10} bind:page size={values.size}>
		<!-- Page's own prop is the page *item* (`{ type, value, key }`), not a
		     number: the anatomy listed `page` and declined to guess its shape,
		     which is exactly the prop whose misuse would otherwise be silent. -->
		{#snippet children(params)}
			{@const pages = params.pages as { key: string; type: 'page' | 'ellipsis'; value?: number }[]}
			<Pagination.PrevButton size={values.size}>Prev</Pagination.PrevButton>
			{#each pages as item (item.key)}
				{#if item.type === 'ellipsis'}
					<span class="pg-sub">…</span>
				{:else}
					<!-- Two roles on one part: control.ghost owns the shape and the
					     hover, control.selected adds [data-selected] on top. -->
					<Pagination.Page page={item} size={values.size} />
				{/if}
			{/each}
			<Pagination.NextButton size={values.size}>Next</Pagination.NextButton>
		{/snippet}
	</Pagination.Root>
	<p class="pg-note">page {page} of 5 · the current chip stays accent while hovered because the later role wins per property.</p>
</div>
