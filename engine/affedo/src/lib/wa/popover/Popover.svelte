<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { animateWithClass } from '../_shared/animate.js';
	import {
		isTopDismissible,
		registerDismissible,
		unregisterDismissible
	} from '../_shared/dismissible-stack.js';
	import {
		autoUpdatePosition,
		positionFloatingElements,
		type Placement
	} from '../_shared/floating.js';
	import './popover.css';

	interface Props {
		/** Preferred placement of the popover. */
		placement?: Placement;
		/** Distance in pixels away from the anchor. */
		distance?: number;
		/** Distance in pixels along the anchor. */
		skidding?: number;
		/** ID of the element the popover is anchored to. */
		for?: string | null;
		/** Removes the arrow. */
		withoutArrow?: boolean;
		/** Indicates whether or not the popover is open. */
		open?: boolean;
		/** Optional ID. */
		id?: string;
		/** Additional CSS classes. */
		class?: string;
		/** Main popover content. */
		children?: Snippet;
		/** Emitted when the popover begins to show. */
		onshow?: () => void;
		/** Emitted after the popover has shown and animations complete. */
		onaftershow?: () => void;
		/** Emitted when the popover begins to hide. */
		onhide?: () => void;
		/** Emitted after the popover has hidden and animations complete. */
		onafterhide?: () => void;
	}

	let {
		placement = 'top',
		distance = 8,
		skidding = 0,
		for: forId = null,
		withoutArrow = false,
		open = $bindable(false),
		id = undefined,
		class: className = '',
		children,
		onshow,
		onaftershow,
		onhide,
		onafterhide
	}: Props = $props();

	let dialogEl: HTMLDialogElement | null = $state(null);
	let popupEl: HTMLElement | null = $state(null);
	let arrowEl: HTMLElement | null = $state(null);
	let dynamicPlacement = $state<Placement | undefined>(undefined);
	const currentPlacement = $derived(dynamicPlacement ?? placement);
	let anchorEl: HTMLElement | null = $state(null);
	const dismissKey = {};

	let cleanupAutoUpdate: (() => void) | null = null;
	let pressStartedInside = false;

	export async function show() {
		if (open) return;
		open = true;
	}

	export async function hide() {
		if (!open) return;
		open = false;
	}

	function reposition() {
		if (!anchorEl || !popupEl) return;
		const result = positionFloatingElements(anchorEl, popupEl, null, {
			placement,
			distance,
			skidding,
			arrow: !withoutArrow,
			boundary: 'viewport'
		});

		if (result) {
			dynamicPlacement = result.placement;
			if (arrowEl && !withoutArrow) {
				if (result.arrowX != null) {
					arrowEl.style.left = `${result.arrowX}px`;
					arrowEl.style.top = '';
				} else if (result.arrowY != null) {
					arrowEl.style.top = `${result.arrowY}px`;
					arrowEl.style.left = '';
				}
			}
		}
	}

	function handleAnchorClick(e: MouseEvent) {
		e.stopPropagation();
		open = !open;
	}

	function handleBodyClick(event: MouseEvent) {
		const target = event.target as HTMLElement | null;
		const closeButton = target?.closest?.('[data-popover="close"]');
		if (closeButton) {
			event.stopPropagation();
			open = false;
		}
	}

	function handleDocumentKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open && isTopDismissible(dismissKey)) {
			event.preventDefault();
			event.stopPropagation();
			open = false;
			if (anchorEl && typeof anchorEl.focus === 'function') {
				anchorEl.focus({ preventScroll: true });
			}
		}
	}

	function handleDocumentPointerDown(event: PointerEvent) {
		const path = event.composedPath();
		pressStartedInside = popupEl ? path.includes(popupEl) : false;
	}

	function handleDocumentClick(event: MouseEvent) {
		const startedInside = pressStartedInside;
		pressStartedInside = false;
		if (startedInside) return;

		const path = event.composedPath();
		if (anchorEl && path.includes(anchorEl)) return;
		if (popupEl && path.includes(popupEl)) return;

		open = false;
	}

	// Anchor element resolution
	$effect(() => {
		const targetId = forId;
		if (typeof document === 'undefined') return;

		const found = targetId ? (document.getElementById(targetId) as HTMLElement | null) : null;
		if (found !== anchorEl) {
			if (anchorEl) {
				anchorEl.removeEventListener('click', handleAnchorClick);
			}
			anchorEl = found;
			if (found) {
				found.addEventListener('click', handleAnchorClick);
				if (open && popupEl) {
					reposition();
					if (!cleanupAutoUpdate) {
						cleanupAutoUpdate = autoUpdatePosition(found, popupEl, reposition);
					}
				}
			}
		}

		return () => {
			if (anchorEl) {
				anchorEl.removeEventListener('click', handleAnchorClick);
			}
		};
	});

	// Open / close lifecycle
	$effect(() => {
		const isOpen = open;
		untrack(() => {
			if (typeof document === 'undefined') return;

			if (isOpen) {
				onshow?.();
				registerDismissible(dismissKey);

				document.addEventListener('keydown', handleDocumentKeyDown);
				document.addEventListener('pointerdown', handleDocumentPointerDown, true);
				document.addEventListener('click', handleDocumentClick);

				if (dialogEl) {
					dialogEl.setAttribute('open', '');
				}

				if (anchorEl && popupEl) {
					reposition();
					if (cleanupAutoUpdate) cleanupAutoUpdate();
					cleanupAutoUpdate = autoUpdatePosition(anchorEl, popupEl, reposition);
				}

				requestAnimationFrame(() => {
					const autofocusEl = popupEl?.querySelector<HTMLElement>('[autofocus]');
					if (autofocusEl && typeof autofocusEl.focus === 'function') {
						autofocusEl.focus({ preventScroll: true });
					}
				});

				if (popupEl) {
					animateWithClass(popupEl, 'show-with-scale').then(() => {
						onaftershow?.();
					});
				}
			} else {
				onhide?.();
				unregisterDismissible(dismissKey);

				document.removeEventListener('keydown', handleDocumentKeyDown);
				document.removeEventListener('pointerdown', handleDocumentPointerDown, true);
				document.removeEventListener('click', handleDocumentClick);

				if (cleanupAutoUpdate) {
					cleanupAutoUpdate();
					cleanupAutoUpdate = null;
				}

				if (popupEl && dialogEl?.hasAttribute('open')) {
					animateWithClass(popupEl, 'hide-with-scale').then(() => {
						if (dialogEl && !open) {
							dialogEl.removeAttribute('open');
						}
						onafterhide?.();
					});
				} else if (dialogEl) {
					dialogEl.removeAttribute('open');
				}
			}
		});

		return () => {
			if (typeof document !== 'undefined') {
				document.removeEventListener('keydown', handleDocumentKeyDown);
				document.removeEventListener('pointerdown', handleDocumentPointerDown, true);
				document.removeEventListener('click', handleDocumentClick);
			}
			unregisterDismissible(dismissKey);
			if (cleanupAutoUpdate) {
				cleanupAutoUpdate();
				cleanupAutoUpdate = null;
			}
		};
	});
</script>

<div class="wa-popover {className}" {id} data-open={open ? '' : undefined}>
	<dialog bind:this={dialogEl} class="wa-popover-dialog" part="dialog">
		<div
			bind:this={popupEl}
			class="wa-popover-popup"
			data-placement={currentPlacement}
			part="popup"
		>
			<div
				class="wa-popover-body"
				part="body"
				onclick={handleBodyClick}
				role="presentation"
			>
				{#if children}
					{@render children()}
				{/if}
			</div>

			{#if !withoutArrow}
				<div
					bind:this={arrowEl}
					class="wa-popover-arrow"
					part="arrow"
					aria-hidden="true"
				></div>
			{/if}
		</div>
	</dialog>
</div>
