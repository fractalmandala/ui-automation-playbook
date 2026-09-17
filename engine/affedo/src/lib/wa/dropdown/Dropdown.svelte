<script lang="ts">
	import { setContext, untrack, type Snippet } from 'svelte';
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
	import { DROPDOWN_KEY, DropdownContext, type DropdownSize } from './context.svelte.js';
	import './dropdown.css';

	interface Props {
		/** Indicates whether or not the dropdown is open. */
		open?: boolean;
		/** The dropdown's size. */
		size?: DropdownSize;
		/** Placement of dropdown menu relative to trigger. */
		placement?: Placement;
		/** Distance in pixels away from trigger. */
		distance?: number;
		/** Distance in pixels along trigger. */
		skidding?: number;
		/** Disables the dropdown. */
		disabled?: boolean;
		/** Keeps dropdown open when an item is selected. */
		stayOpenOnSelect?: boolean;
		/** Optional element id. */
		id?: string;
		/** Additional CSS classes. */
		class?: string;
		/** Trigger element. */
		trigger?: Snippet;
		/** Dropdown menu items. */
		children?: Snippet;
		/** Emitted when the dropdown begins to show. */
		onshow?: () => void;
		/** Emitted after the dropdown has shown. */
		onaftershow?: () => void;
		/** Emitted when the dropdown begins to hide. */
		onhide?: () => void;
		/** Emitted after the dropdown has hidden. */
		onafterhide?: () => void;
		/** Emitted when an item is selected. */
		onselect?: (detail: { item: { value?: string; text: string } }) => void;
	}

	let {
		open = $bindable(false),
		size = 'm',
		placement = 'bottom-start',
		distance = 0,
		skidding = 0,
		disabled = false,
		stayOpenOnSelect = false,
		id = undefined,
		class: className = '',
		trigger,
		children,
		onshow,
		onaftershow,
		onhide,
		onafterhide,
		onselect
	}: Props = $props();

	let triggerEl: HTMLElement | null = $state(null);
	let menuEl: HTMLElement | null = $state(null);
	let rendered = $state(open);
	let dynamicPlacement = $state<Placement | undefined>(undefined);
	const currentPlacement = $derived(dynamicPlacement ?? placement);
	const dismissKey = {};

	let cleanupAutoUpdate: (() => void) | null = null;
	let pressStartedInside = false;

	const ctx = new DropdownContext(() => ({
		size,
		selectItem: (item) => {
			onselect?.({ item });
			if (!stayOpenOnSelect) {
				open = false;
			}
		},
		close: () => {
			if (!stayOpenOnSelect) {
				open = false;
			}
		}
	}));
	setContext(DROPDOWN_KEY, ctx);

	export async function show() {
		if (open || disabled) return;
		open = true;
	}

	export async function hide() {
		if (!open) return;
		open = false;
	}

	export function reposition() {
		if (!triggerEl || !menuEl) return;
		const result = positionFloatingElements(triggerEl, menuEl, null, {
			placement,
			distance,
			skidding,
			boundary: 'viewport'
		});
		if (result) {
			dynamicPlacement = result.placement;
		}
	}

	function handleTriggerClick(event: MouseEvent) {
		if (disabled) return;
		event.stopPropagation();
		open = !open;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open && isTopDismissible(dismissKey)) {
			event.preventDefault();
			event.stopPropagation();
			open = false;
			triggerEl?.focus();
		}
	}

	function handlePointerDown(event: PointerEvent) {
		const path = event.composedPath();
		pressStartedInside = menuEl ? path.includes(menuEl) : false;
	}

	function handleClickOutside(event: MouseEvent) {
		const startedInside = pressStartedInside;
		pressStartedInside = false;
		if (startedInside) return;

		const path = event.composedPath();
		if (triggerEl && path.includes(triggerEl)) return;
		if (menuEl && path.includes(menuEl)) return;

		open = false;
	}

	$effect(() => {
		const isOpen = open;
		untrack(() => {
			if (typeof document === 'undefined') return;

			if (isOpen) {
				onshow?.();
				rendered = true;
				registerDismissible(dismissKey);

				document.addEventListener('keydown', handleKeyDown);
				document.addEventListener('pointerdown', handlePointerDown, true);
				document.addEventListener('click', handleClickOutside);

				if (triggerEl && menuEl) {
					cleanupAutoUpdate = autoUpdatePosition(triggerEl, menuEl, reposition);
				}

				if (menuEl) {
					animateWithClass(menuEl, 'show').then(() => {
						onaftershow?.();
					});
				}
			} else {
				onhide?.();
				unregisterDismissible(dismissKey);

				document.removeEventListener('keydown', handleKeyDown);
				document.removeEventListener('pointerdown', handlePointerDown, true);
				document.removeEventListener('click', handleClickOutside);

				if (cleanupAutoUpdate) {
					cleanupAutoUpdate();
					cleanupAutoUpdate = null;
				}

				if (menuEl && rendered) {
					animateWithClass(menuEl, 'hide').then(() => {
						rendered = false;
						onafterhide?.();
					});
				} else {
					rendered = false;
				}
			}
		});

		return () => {
			if (typeof document !== 'undefined') {
				document.removeEventListener('keydown', handleKeyDown);
				document.removeEventListener('pointerdown', handlePointerDown, true);
				document.removeEventListener('click', handleClickOutside);
			}
			unregisterDismissible(dismissKey);
			if (cleanupAutoUpdate) {
				cleanupAutoUpdate();
				cleanupAutoUpdate = null;
			}
		};
	});
</script>

<div class="wa-dropdown {className}" {id} data-open={open ? '' : undefined} data-size={size}>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		bind:this={triggerEl}
		class="wa-dropdown-trigger"
		part="trigger"
		aria-haspopup="true"
		aria-expanded={open}
		onclick={handleTriggerClick}
	>
		{#if trigger}
			{@render trigger()}
		{/if}
	</div>

	{#if rendered}
		<div
			bind:this={menuEl}
			class="wa-dropdown-menu"
			data-placement={currentPlacement}
			role="menu"
			part="menu"
			tabindex="-1"
		>
			{#if children}
				{@render children()}
			{/if}
		</div>
	{/if}
</div>
