<script lang="ts">
	import { tick, type Snippet } from 'svelte';
	import { animateWithClass } from '../_shared/animate.js';
	import {
		isTopDismissible,
		registerDismissible,
		unregisterDismissible
	} from '../_shared/dismissible-stack.js';
	import './tooltip.css';

	export type TooltipPlacement =
		| 'top'
		| 'top-start'
		| 'top-end'
		| 'right'
		| 'right-start'
		| 'right-end'
		| 'bottom'
		| 'bottom-start'
		| 'bottom-end'
		| 'left'
		| 'left-start'
		| 'left-end';

	interface Props {
		/** Plain-text content. Rendered when no `children` snippet is provided. */
		content?: string;
		/**
		 * The preferred placement of the tooltip. Note that the actual placement may vary as needed
		 * to keep the tooltip inside of the viewport.
		 */
		placement?: TooltipPlacement;
		/** Disables the tooltip so it won't show when triggered. */
		disabled?: boolean;
		/** The distance in pixels from which to offset the tooltip away from its target. */
		distance?: number;
		/** Indicates whether or not the tooltip is open. You can use this in lieu of the show/hide methods. */
		open?: boolean;
		/** The distance in pixels from which to offset the tooltip along its target. */
		skidding?: number;
		/** The amount of time to wait before showing the tooltip when the user mouses in. */
		showDelay?: number;
		/** The amount of time to wait before hiding the tooltip when the user mouses out. */
		hideDelay?: number;
		/**
		 * Controls how the tooltip is activated. Possible options include `click`, `hover`, `focus`,
		 * and `manual`. Multiple options can be passed by separating them with a space. When manual
		 * is used, the tooltip must be activated programmatically.
		 */
		trigger?: string;
		/** Removes the arrow from the tooltip. */
		withoutArrow?: boolean;
		/** The `id` of the element the tooltip describes. Positioning and accessibility are wired up for you. */
		for?: string | null;
		/** Emitted when the tooltip begins to show. Return `false` to cancel. Returning `undefined` does NOT cancel. */
		onshow?: () => boolean | void;
		/** Emitted after the tooltip has shown and all animations are complete. */
		onaftershow?: () => void;
		/** Emitted when the tooltip begins to hide. Return `false` to cancel. Returning `undefined` does NOT cancel. */
		onhide?: () => boolean | void;
		/** Emitted after the tooltip has hidden and all animations are complete. */
		onafterhide?: () => void;
		/** The tooltip's content. Keep to text and presentational content — tooltips can't be reliably keyboard-operated. */
		children?: Snippet;
	}

	let {
		content = '',
		placement = 'top',
		disabled = false,
		distance = 8,
		open = $bindable(false),
		skidding = 0,
		showDelay = 150,
		hideDelay = 0,
		trigger = 'hover focus',
		withoutArrow = false,
		for: forId = null,
		onshow,
		onaftershow,
		onhide,
		onafterhide,
		children
	}: Props = $props();

	// Unique id pair for the aria-labelledby wiring. `$props.id()` uses the
	// consumer's `id` when one is passed, else generates a unique one.
	const uid = $props.id();

	let rootEl = $state<HTMLElement>();
	let popupEl = $state<HTMLElement>();
	let anchorEl = $state<Element | null>(null);

	// Drives the popup's `hidden` attribute. Set true before showing so the
	// popup can be measured, and back to false only after the hide animation
	// finishes (port of WA's `body.hidden` bookkeeping).
	let rendered = $state(open);
	let popupTop = $state(0);
	let popupLeft = $state(0);
	let dynamicPlacement = $state<TooltipPlacement | undefined>(undefined);
	const currentPlacement = $derived(dynamicPlacement ?? placement);

	let hoverTimeout: ReturnType<typeof setTimeout> | undefined;
	// Set when the anchor is pressed to light dismiss the tooltip. While true,
	// hover and focus won't reopen it. Cleared when the pointer fully leaves
	// the anchor and tooltip or when the anchor blurs.
	let dismissedByPress = false;
	let firstOpenRun = true;
	// Identity for the dismissible stack (Escape coordination).
	const dismissHandle = {};

	// `show()`/`hide()` resolve after the corresponding after-event, like WA's
	// `waitForEvent(this, 'wa-after-show' | 'wa-after-hide')`.
	let showResolvers: Array<() => void> = [];
	let hideResolvers: Array<() => void> = [];
	function flushResolvers(list: Array<() => void>) {
		for (const resolve of list.splice(0)) resolve();
	}

	function hasTrigger(triggerType: string) {
		return trigger.split(' ').includes(triggerType);
	}

	function handleBlur() {
		// Moving focus away re-arms the tooltip after a light dismiss. On touch
		// devices no mouseout fires, so this is the reset path.
		dismissedByPress = false;
		if (hasTrigger('focus')) void hide();
	}

	function handleClick() {
		if (hasTrigger('click')) {
			if (open) void hide();
			else void show();
			return;
		}
		if (hasTrigger('manual')) return;
		// Light dismiss for activations that don't fire mousedown, like Enter or Space on a button.
		lightDismiss();
	}

	function handleFocus() {
		if (dismissedByPress) return;
		if (hasTrigger('focus')) void show();
	}

	function handleMouseDown() {
		if (hasTrigger('click') || hasTrigger('manual')) return;
		// Light dismiss before focus fires so the tooltip doesn't flash visible during the click.
		lightDismiss();
	}

	/** Hides the tooltip, or cancels a pending show, and keeps it hidden until re-armed. */
	function lightDismiss() {
		clearTimeout(hoverTimeout);
		dismissedByPress = true;
		void hide();
	}

	function handleDocumentKeyDown(event: KeyboardEvent) {
		if (hasTrigger('manual')) return;
		// Pressing escape when a tooltip is open should dismiss it
		if (event.key === 'Escape' && open && isTopDismissible(dismissHandle)) {
			event.preventDefault();
			event.stopPropagation();
			void hide();
		}
	}

	function handleDocumentClick(event: MouseEvent) {
		if (hasTrigger('manual')) return;
		// Clicks on the anchor are handled by the anchor's own listeners
		if (anchorEl && event.composedPath().includes(anchorEl)) return;
		// Light dismiss. Clicking anywhere else, including the tooltip itself, hides it.
		void hide();
	}

	function handleMouseOver() {
		if (dismissedByPress) return;
		if (hasTrigger('hover')) {
			clearTimeout(hoverTimeout);
			hoverTimeout = setTimeout(() => void show(), showDelay);
		}
	}

	function handleMouseOut(event: MouseEvent) {
		const relatedTarget = event.relatedTarget as Node | null;
		// Use the event's relatedTarget (the element the pointer moved to) to determine whether the pointer
		// is still within the anchor or the tooltip itself.
		const movedIntoAnchor = Boolean(relatedTarget && anchorEl?.contains(relatedTarget));
		const movedIntoTooltip = Boolean(relatedTarget && rootEl?.contains(relatedTarget));
		if (movedIntoAnchor || movedIntoTooltip) return;
		// The pointer has fully left, so hovering can show the tooltip again after a light dismiss
		dismissedByPress = false;
		if (hasTrigger('hover')) {
			clearTimeout(hoverTimeout);
			hoverTimeout = setTimeout(() => void hide(), hideDelay);
		}
	}

	/** Adds the tooltip ID to the aria-labelledby attribute */
	function addToAriaLabelledBy(element: Element, id: string) {
		const currentLabel = element.getAttribute('aria-labelledby') || '';
		const labels = currentLabel.split(/\s+/).filter(Boolean);
		if (!labels.includes(id)) {
			labels.push(id);
			element.setAttribute('aria-labelledby', labels.join(' '));
		}
	}

	/** Removes the tooltip ID from the aria-labelledby attribute */
	function removeFromAriaLabelledBy(element: Element, id: string) {
		const currentLabel = element.getAttribute('aria-labelledby') || '';
		const labels = currentLabel.split(/\s+/).filter(Boolean);
		const filteredLabels = labels.filter(label => label !== id);
		if (filteredLabels.length > 0) {
			element.setAttribute('aria-labelledby', filteredLabels.join(' '));
		} else {
			element.removeAttribute('aria-labelledby');
		}
	}

	interface Coords {
		top: number;
		left: number;
	}

	function computeCoords(
		place: TooltipPlacement,
		anchor: DOMRect,
		tip: DOMRect,
		dist: number,
		skid: number
	): Coords {
		const centerX = anchor.left + anchor.width / 2 - tip.width / 2 + skid;
		const centerY = anchor.top + anchor.height / 2 - tip.height / 2 + skid;
		switch (place) {
			case 'top':
				return { top: anchor.top - tip.height - dist, left: centerX };
			case 'top-start':
				return { top: anchor.top - tip.height - dist, left: anchor.left + skid };
			case 'top-end':
				return { top: anchor.top - tip.height - dist, left: anchor.right - tip.width - skid };
			case 'bottom':
				return { top: anchor.bottom + dist, left: centerX };
			case 'bottom-start':
				return { top: anchor.bottom + dist, left: anchor.left + skid };
			case 'bottom-end':
				return { top: anchor.bottom + dist, left: anchor.right - tip.width - skid };
			case 'left':
				return { top: centerY, left: anchor.left - tip.width - dist };
			case 'left-start':
				return { top: anchor.top + skid, left: anchor.left - tip.width - dist };
			case 'left-end':
				return { top: anchor.bottom - tip.height - skid, left: anchor.left - tip.width - dist };
			case 'right':
				return { top: centerY, left: anchor.right + dist };
			case 'right-start':
				return { top: anchor.top + skid, left: anchor.right + dist };
			case 'right-end':
				return { top: anchor.bottom - tip.height - skid, left: anchor.right + dist };
		}
	}

	/**
	 * Positions the popup next to the anchor. Standalone replacement for
	 * `wa-popup`'s floating-ui pipeline: preferred placement first, a single
	 * primary-axis flip fallback, then clamping to the viewport. Exported so
	 * consumers can re-sync after content changes (mirrors `popup.reposition()`).
	 */
	export function reposition() {
		const anchor = anchorEl;
		const popup = popupEl;
		if (!anchor || !popup) return;
		const anchorRect = anchor.getBoundingClientRect();
		const tipRect = popup.getBoundingClientRect();
		const margin = 8;
		const vw = window.innerWidth;
		const vh = window.innerHeight;
		const fits = (c: Coords) =>
			c.top >= margin &&
			c.left >= margin &&
			c.top + tipRect.height <= vh - margin &&
			c.left + tipRect.width <= vw - margin;

		let place = placement;
		let coords = computeCoords(place, anchorRect, tipRect, distance, skidding);
		if (!fits(coords)) {
			const primary = place.split('-')[0];
			const opposite: Record<string, TooltipPlacement> = {
				top: 'bottom',
				bottom: 'top',
				left: 'right',
				right: 'left'
			};
			const flippedBase = opposite[primary];
			if (flippedBase) {
				const flipped = (
					place.includes('-') ? `${flippedBase}${place.slice(primary.length)}` : flippedBase
				) as TooltipPlacement;
				const alt = computeCoords(flipped, anchorRect, tipRect, distance, skidding);
				if (fits(alt)) {
					place = flipped;
					coords = alt;
				}
			}
		}
		dynamicPlacement = place;
		popupTop = Math.min(
			Math.max(coords.top, margin),
			Math.max(margin, vh - tipRect.height - margin)
		);
		popupLeft = Math.min(
			Math.max(coords.left, margin),
			Math.max(margin, vw - tipRect.width - margin)
		);
	}

	async function doShow() {
		if (disabled) {
			open = false;
			flushResolvers(showResolvers);
			return;
		}
		// Cancelable, like WA's `wa-show`: returning `false` vetoes.
		if (onshow?.() === false) {
			open = false;
			// Micro-divergence: WA's `show()` promise hangs when canceled because
			// no `wa-after-show` is ever dispatched. Resolve instead so callers
			// can't leak a forever-pending promise.
			flushResolvers(showResolvers);
			return;
		}
		rendered = true;
		await tick();
		reposition();
		if (popupEl) await animateWithClass(popupEl, 'show-with-scale');
		onaftershow?.();
		flushResolvers(showResolvers);
	}

	async function doHide() {
		// Cancelable, like WA's `wa-hide`: returning `false` vetoes and reopens.
		if (onhide?.() === false) {
			open = true;
			flushResolvers(hideResolvers);
			return;
		}
		if (popupEl) await animateWithClass(popupEl, 'hide-with-scale');
		rendered = false;
		onafterhide?.();
		flushResolvers(hideResolvers);
	}

	/** Shows the tooltip. Resolves after the after-show step (or immediately if already open). */
	export async function show(): Promise<void> {
		if (open) return;
		open = true;
		return new Promise<void>(resolve => {
			showResolvers.push(resolve);
		});
	}

	/** Hides the tooltip. Resolves after the after-hide step (or immediately if already closed). */
	export async function hide(): Promise<void> {
		if (!open) return;
		open = false;
		return new Promise<void>(resolve => {
			hideResolvers.push(resolve);
		});
	}

	// Port of `@watch('open')` + `firstUpdated()`: the first run only activates
	// an initially-open tooltip (no events); later runs animate with events.
	// Cancel paths (`open = false` inside doShow and vice versa) re-enter here,
	// exactly like WA's watcher re-firing — so a canceled show still runs the
	// hide branch, and a canceled hide still runs the show branch.
	$effect(() => {
		const shouldOpen = open;
		if (firstOpenRun) {
			firstOpenRun = false;
			if (shouldOpen) {
				rendered = true;
				void tick().then(() => reposition());
			}
			return;
		}
		if (shouldOpen) void doShow();
		else void doHide();
	});

	// Port of `@watch('disabled')`: disabling an open tooltip hides it.
	$effect(() => {
		if (disabled && open) void hide();
	});

	// Port of `@watch(['distance', 'placement', 'skidding'])`: reposition an
	// open tooltip when its geometry inputs change.
	$effect(() => {
		placement;
		distance;
		skidding;
		if (open) reposition();
	});

	// Document listeners + dismissible-stack registration. Manual tooltips
	// never light dismiss, so they skip both (joining the stack without
	// handling Escape would block dismissibles beneath them).
	$effect(() => {
		if (!open || hasTrigger('manual')) return;
		document.addEventListener('keydown', handleDocumentKeyDown);
		document.addEventListener('click', handleDocumentClick);
		registerDismissible(dismissHandle);
		return () => {
			document.removeEventListener('keydown', handleDocumentKeyDown);
			document.removeEventListener('click', handleDocumentClick);
			unregisterDismissible(dismissHandle);
		};
	});

	// Standalone substitute for floating-ui `autoUpdate`: keep an open tooltip
	// glued to its anchor across scroll/resize. (GAP: no ancestor-scroll or
	// layout-shift observation beyond window events.)
	$effect(() => {
		if (!open) return;
		const sync = () => reposition();
		window.addEventListener('resize', sync);
		window.addEventListener('scroll', sync, true);
		return () => {
			window.removeEventListener('resize', sync);
			window.removeEventListener('scroll', sync, true);
		};
	});

	// Port of `@watch('for')` + the connected-callback wiring: resolve the
	// anchor by id, manage `aria-labelledby`, and attach trigger listeners.
	// The returned cleanup runs on `for` change and on unmount.
	$effect(() => {
		if (!forId) {
			anchorEl = null;
			return;
		}
		const next = document.getElementById(forId);
		if (!next) {
			anchorEl = null;
			return;
		}
		// A new anchor must not inherit press dismissal state from the old one.
		dismissedByPress = false;
		// WA uses `aria-labelledby` (not `describedby`) because it has the most
		// consistent screen-reader experience on first focus.
		addToAriaLabelledBy(next, uid);
		next.addEventListener('blur', handleBlur, true);
		next.addEventListener('focus', handleFocus, true);
		next.addEventListener('click', handleClick);
		next.addEventListener('mousedown', handleMouseDown);
		next.addEventListener('mouseover', handleMouseOver);
		next.addEventListener('mouseout', handleMouseOut);
		anchorEl = next;
		return () => {
			next.removeEventListener('blur', handleBlur, true);
			next.removeEventListener('focus', handleFocus, true);
			next.removeEventListener('click', handleClick);
			next.removeEventListener('mousedown', handleMouseDown);
			next.removeEventListener('mouseover', handleMouseOver);
			next.removeEventListener('mouseout', handleMouseOut);
			removeFromAriaLabelledBy(next, uid);
			if (anchorEl === next) anchorEl = null;
		};
	});

	// Safety net for unmount while a delayed show/hide is pending or the
	// tooltip is still on the dismissible stack.
	$effect(() => {
		return () => {
			clearTimeout(hoverTimeout);
			unregisterDismissible(dismissHandle);
		};
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_mouse_events_have_key_events -->
<div
	bind:this={rootEl}
	class="wa-tooltip"
	part="base tooltip"
	id={uid}
	role="presentation"
	data-open={open ? '' : undefined}
	data-disabled={disabled ? '' : undefined}
	data-without-arrow={withoutArrow ? '' : undefined}
	onmouseout={handleMouseOut}
>
	<div
		bind:this={popupEl}
		class="tooltip"
		class:tooltip-open={open}
		part="popup base__popup"
		data-placement={currentPlacement}
		style:top="{popupTop}px"
		style:left="{popupLeft}px"
		hidden={!rendered}
		role="tooltip"
	>
		<div part="body" class="body">
			{#if children}
				{@render children()}
			{:else}
				{content}
			{/if}
		</div>
		{#if !withoutArrow}
			<div part="arrow base__arrow" class="arrow" aria-hidden="true"></div>
		{/if}
	</div>
</div>
