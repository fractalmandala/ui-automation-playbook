<script lang="ts">
	import { Marked } from 'marked';
	import type { Snippet } from 'svelte';
	import './markdown.css';

	const markedInstance = new Marked();

	interface Props {
		/** The markdown text to parse and render. */
		content?: string;
		/** The tab stop width used when converting leading tabs to spaces. */
		tabSize?: number;
		/** Optional slot content for static markdown. */
		children?: Snippet;
	}

	let {
		content = '',
		tabSize = 4,
		children
	}: Props = $props();

	let containerEl = $state<HTMLElement>();
	let rawSlotText = $state('');

	function dedent(text: string): string {
		const normalized = text.replace(/\r\n/g, '\n');
		const lines = normalized.split('\n').map(line => {
			let expanded = '';
			let column = 0;
			for (let i = 0; i < line.length; i++) {
				const char = line[i];
				if (char === '\t') {
					const spaces = tabSize - (column % tabSize);
					expanded += ' '.repeat(spaces);
					column += spaces;
				} else if (char === ' ') {
					expanded += ' ';
					column++;
				} else {
					expanded += line.slice(i);
					break;
				}
			}
			return expanded;
		});

		let start = 0;
		while (start < lines.length && lines[start].trim() === '') start++;
		let end = lines.length - 1;
		while (end >= start && lines[end].trim() === '') end--;

		const trimmedLines = lines.slice(start, end + 1);
		if (trimmedLines.length === 0) return '';

		let minIndent = Infinity;
		for (const line of trimmedLines) {
			if (line.trim() === '') continue;
			const indent = line.match(/^ */)?.[0].length ?? 0;
			minIndent = Math.min(minIndent, indent);
		}

		if (minIndent === Infinity || minIndent === 0) {
			return trimmedLines.join('\n');
		}

		return trimmedLines.map(line => line.slice(minIndent)).join('\n');
	}

	const sourceText = $derived(content || rawSlotText);
	const renderedHtml = $derived.by(() => {
		if (!sourceText) return '';
		const cleaned = dedent(sourceText);
		return markedInstance.parse(cleaned) as string;
	});

	$effect(() => {
		if (!content && containerEl) {
			// Read raw text if children provided
			const text = containerEl.textContent || '';
			if (text !== rawSlotText) {
				rawSlotText = text;
			}
		}
	});
</script>

<div class="wa-markdown" bind:this={containerEl}>
	{#if renderedHtml}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html renderedHtml}
	{:else if children}
		<span style="display: none;">{@render children()}</span>
	{/if}
</div>
