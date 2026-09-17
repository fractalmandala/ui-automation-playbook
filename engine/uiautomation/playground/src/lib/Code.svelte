<script lang="ts">
	// The generated artifact itself, read as text: this panel shows exactly what
	// landed on disk, not a copy of it. Only the selected part's block is shown so
	// the panel stays the size of the thing being discussed.
	import type { Entry } from './registry';

	let { entry, selected = null }: { entry: Entry; selected?: string | null } = $props();

	const part = $derived(entry.plan.parts.find((candidate) => candidate.partName === selected) ?? null);

	const excerpt = $derived.by(() => {
		if (!part) return entry.sass;
		const lines = entry.sass.split('\n');
		const start = lines.findIndex((line) => line === `.${part.className}`);
		if (start === -1) return entry.sass;
		let end = start + 1;
		while (end < lines.length && !(lines[end].startsWith('.') && lines[end].length > 1)) end++;
		return lines.slice(start, end).join('\n').trimEnd();
	});
</script>

<div class="pg-panel">
	<h2 class="pg-panel-title">
		<span>generated/styles/components/{entry.slug}.sass</span>
		<span class="pg-sub">{part ? `selected: ${part.partName}` : 'whole file'}</span>
	</h2>
	<pre class="pg-code">{excerpt}</pre>
</div>
