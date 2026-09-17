<script lang="ts">
	import { setContext, type Snippet } from 'svelte';
	import {
		AccordionContext,
		ACCORDION_KEY,
		type AccordionMode,
		type Appearance,
		type IconPlacement
	} from './context.svelte.js';
	import './accordion.css';

	interface Props {
		/** `multiple` — any number open. `single` — one open, clicking it does not close it.
		 *  `single-collapsible` — one open, clicking it closes it. */
		mode?: AccordionMode;
		iconPlacement?: IconPlacement;
		/** Heading level (1–6) wrapping each trigger, or `none` to omit the heading. */
		headingLevel?: string;
		appearance?: Appearance;
		children: Snippet;
	}

	let {
		mode = 'multiple',
		iconPlacement = 'end',
		headingLevel = '3',
		appearance = 'outlined',
		children
	}: Props = $props();

	const ctx = new AccordionContext(() => ({ mode, iconPlacement, headingLevel, appearance }));
	setContext(ACCORDION_KEY, ctx);

	export function expandAll() { ctx.expandAll(); }
	export function collapseAll() { ctx.collapseAll(); }
</script>

<div class="wa-accordion" data-appearance={appearance}>
	{@render children()}
</div>
