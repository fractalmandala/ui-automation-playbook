<script lang="ts">
	import { getContext, type Snippet } from 'svelte';
	import { animate, parseDuration } from '../_shared/animate.js';
	import { ACCORDION_KEY, type AccordionContext, type ItemHandle } from './context.svelte.js';
	import './accordion-item.css';

	interface Props {
		/** Plain-text label. Use the `label` snippet when you need markup.
		 *  WA overloads one `label` name for both; a Snippet and a string cannot share one. */
		text?: string;
		expanded?: boolean;
		disabled?: boolean;
		/** Return `false` to cancel. Returning `undefined` does NOT cancel. */
		onexpand?: () => boolean | void;
		/** Return `false` to cancel. Returning `undefined` does NOT cancel. */
		oncollapse?: () => boolean | void;
		onafterexpand?: () => void;
		onaftercollapse?: () => void;
		label?: Snippet;
		icon?: Snippet;
		children: Snippet;
	}

	let {
		text = '',
		expanded = $bindable(false),
		disabled = false,
		onexpand,
		oncollapse,
		onafterexpand,
		onaftercollapse,
		label,
		icon,
		children
	}: Props = $props();

	// An item outside a group still works; it just governs itself.
	const ctx = getContext<AccordionContext | undefined>(ACCORDION_KEY);

	const uid = $props.id();
	const headingLevel = $derived(ctx?.headingLevel ?? '3');
	const iconPlacement = $derived(ctx?.iconPlacement ?? 'end');
	const appearance = $derived(ctx?.appearance ?? 'outlined');
	const heading = $derived.by(() => {
		if (headingLevel === 'none') return null;
		const level = parseInt(headingLevel, 10);
		return `h${level >= 1 && level <= 6 ? level : 3}`;
	});

	let trigger = $state<HTMLButtonElement>();
	let body = $state<HTMLElement>();
	let isAnimating = $state(false);

	// WA's generation counter, kept: it is what makes an interrupted toggle land
	// on the right final height. The stylesheet also selects on `.animating`.
	let animationGeneration = 0;

	function expand() {
		if (expanded || disabled) return;
		if (onexpand?.() === false) return;
		expanded = true;
		void run(true);
	}

	function collapse() {
		if (!expanded || disabled) return;
		if (oncollapse?.() === false) return;
		expanded = false;
		void run(false);
	}

	async function run(show: boolean) {
		if (!body) return;
		const generation = ++animationGeneration;
		isAnimating = true;

		const styles = getComputedStyle(body);
		const duration = parseDuration(
			styles.getPropertyValue(show ? '--show-duration' : '--hide-duration') || '200ms'
		);
		const easing = styles.getPropertyValue('--easing') || 'ease';
		const height = `${body.scrollHeight}px`;

		await animate(
			body,
			show
				? [{ height: '0', opacity: '0' }, { height, opacity: '1' }]
				: [{ height, opacity: '1' }, { height: '0', opacity: '0' }],
			{ duration, easing }
		);

		if (animationGeneration !== generation) return;
		body.style.height = show ? 'auto' : '0';
		isAnimating = false;
		(show ? onafterexpand : onaftercollapse)?.();
	}

	export function toggle() {
		if (ctx) ctx.toggle(handle);
		else if (expanded) collapse();
		else expand();
	}

	export function focus(options?: FocusOptions) {
		trigger?.focus(options);
	}

	const handle: ItemHandle = {
		el: undefined as unknown as HTMLElement,
		get disabled() { return disabled; },
		get expanded() { return expanded; },
		expand,
		collapse,
		focus
	};

	function join(node: HTMLElement) {
		handle.el = node;
		return ctx?.register(handle);
	}

	// WA does this in firstUpdated(): the panel starts at its resting height so
	// the first toggle animates from a known value rather than from `auto`.
	function initBody(node: HTMLElement) {
		node.style.height = expanded ? 'auto' : '0';
	}
</script>

{#snippet button()}
	<button
		bind:this={trigger}
		part="button"
		type="button"
		id="{uid}-trigger"
		aria-expanded={expanded}
		aria-controls="{uid}-panel"
		aria-disabled={disabled}
		tabindex={disabled ? -1 : 0}
		onclick={toggle}
		onkeydown={(e) => ctx?.keydown(e, handle)}
	>
		<span part="label">{#if label}{@render label()}{:else}{text}{/if}</span>
		<span part="icon">
			{#if icon}
				{@render icon()}
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="m9 18 6-6-6-6" />
				</svg>
			{/if}
		</span>
	</button>
{/snippet}

<div
	class="wa-accordion-item"
	part="accordion-item"
	data-expanded={expanded ? '' : undefined}
	data-disabled={disabled ? '' : undefined}
	data-appearance={appearance}
	data-icon-placement={iconPlacement}
	{@attach join}
>
	{#if heading}
		<svelte:element this={heading} part="heading">{@render button()}</svelte:element>
	{:else}
		{@render button()}
	{/if}

	<div
		bind:this={body}
		class="body"
		class:animating={isAnimating}
		part="panel"
		id="{uid}-panel"
		role="region"
		aria-labelledby="{uid}-trigger"
		inert={!expanded}
		{@attach initBody}
	>
		<div class="content" part="content">
			{@render children()}
		</div>
	</div>
</div>
