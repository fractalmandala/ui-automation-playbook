<script lang="ts">
	import { setContext, type Snippet } from 'svelte';
	import { BreadcrumbContext, BREADCRUMB_KEY } from './context.svelte.js';
	import './breadcrumb.css';

	interface Props {
		/** The label to use for the breadcrumb control. Not shown on screen, but announced
		 *  by screen readers to provide more context. Maps to `aria-label` on the `nav`. */
		label?: string;
		/** The separator between items. Works best with an icon. When omitted, a
		 *  chevron (flipped in RTL via CSS) is rendered by each item. Replaces WA's
		 *  `separator` slot cloning — children read this through context instead. */
		separator?: Snippet;
		/** One or more breadcrumb items to display. */
		children: Snippet;
	}

	let { label = '', separator, children }: Props = $props();

	const ctx = new BreadcrumbContext(() => ({ separator }));
	setContext(BREADCRUMB_KEY, ctx);
</script>

<nav part="base breadcrumb" class="wa-breadcrumb breadcrumb" aria-label={label}>
	{@render children()}
</nav>
