<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import Button from '../button/Button.svelte';
	import { animateWithClass } from '../_shared/animate.js';
	import {
		isTopDismissible,
		registerDismissible,
		unregisterDismissible
	} from '../_shared/dismissible-stack.js';
	import { lockBodyScrolling, unlockBodyScrolling } from '../_shared/scroll.js';
	import './drawer.css';

	export type DrawerPlacement = 'top' | 'end' | 'bottom' | 'start';

	interface Props {
		/** Indicates whether or not the drawer is open. */
		open?: boolean;
		/**
		 * The drawer's label as displayed in the header.
		 * If you need HTML markup, use `labelSnippet`.
		 */
		label?: string;
		/** The direction from which the drawer will open. */
		placement?: DrawerPlacement;
		/** Disables the header. This will also remove the default close button. */
		withoutHeader?: boolean;
		/** When enabled, the drawer will be closed when the user clicks outside of it. */
		lightDismiss?: boolean;
		/** Set to true if slotting in a footer so it displays correctly before hydration. */
		withFooter?: boolean;
		/** Optional element id. */
		id?: string;
		/** Additional CSS classes. */
		class?: string;
		/** The drawer's main content. */
		children?: Snippet;
		/** Custom label markup. */
		labelSnippet?: Snippet;
		/** Optional actions to add to the header. */
		headerActionsSnippet?: Snippet;
		/** The drawer's footer, usually one or more action buttons. */
		footer?: Snippet;
		/** Emitted when the drawer opens. */
		onshow?: () => void;
		/** Emitted after the drawer opens and all animations are complete. */
		onaftershow?: () => void;
		/** Emitted when the drawer is requested to close. */
		onhide?: (detail: {
			preventDefault: () => void;
			defaultPrevented: boolean;
			source?: Element | EventTarget | null;
		}) => void;
		/** Emitted after the drawer closes and all animations are complete. */
		onafterhide?: () => void;
	}

	let {
		open = $bindable(false),
		label = '',
		placement = 'end',
		withoutHeader = false,
		lightDismiss = false,
		withFooter = false,
		id = undefined,
		class: className = '',
		children,
		labelSnippet,
		headerActionsSnippet,
		footer,
		onshow,
		onaftershow,
		onhide,
		onafterhide
	}: Props = $props();

	let drawerEl: HTMLDialogElement | null = $state(null);
	let originalTrigger: HTMLElement | null = null;
	const dismissKey = {};

	const hasHeader = $derived(!withoutHeader);
	const hasFooter = $derived(Boolean(footer || withFooter));

	export async function show() {
		if (open) return;
		open = true;
	}

	export async function hide() {
		if (!open) return;
		await requestClose(drawerEl);
	}

	async function requestClose(source?: Element | EventTarget | null) {
		let prevented = false;
		onhide?.({
			get defaultPrevented() {
				return prevented;
			},
			preventDefault: () => {
				prevented = true;
			},
			source
		});

		if (prevented) {
			if (drawerEl) {
				await animateWithClass(drawerEl, 'pulse');
			}
			return;
		}

		removeOpenListeners();

		if (drawerEl && drawerEl.open) {
			await animateWithClass(drawerEl, 'hide');
			drawerEl.close();
		}

		open = false;
		if (drawerEl) unlockBodyScrolling(drawerEl);

		if (originalTrigger && typeof originalTrigger.focus === 'function') {
			setTimeout(() => originalTrigger?.focus());
		}

		onafterhide?.();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open && isTopDismissible(dismissKey)) {
			event.preventDefault();
			event.stopPropagation();
			requestClose(drawerEl);
		}
	}

	function addOpenListeners() {
		if (typeof document === 'undefined') return;
		document.addEventListener('keydown', handleKeyDown);
		registerDismissible(dismissKey);
	}

	function removeOpenListeners() {
		if (typeof document === 'undefined') return;
		document.removeEventListener('keydown', handleKeyDown);
		unregisterDismissible(dismissKey);
	}

	function handleCancel(event: Event) {
		event.preventDefault();
		if (drawerEl && !drawerEl.classList.contains('hide') && isTopDismissible(dismissKey)) {
			requestClose(drawerEl);
		}
	}

	function handleClick(event: MouseEvent) {
		const target = event.target as HTMLElement | null;
		const closeButton = target?.closest?.('[data-drawer="close"]');
		if (closeButton) {
			event.stopPropagation();
			requestClose(closeButton);
		}
	}

	async function handlePointerDown(event: PointerEvent) {
		if (event.target === drawerEl) {
			if (lightDismiss) {
				requestClose(drawerEl);
			} else {
				if (drawerEl) {
					await animateWithClass(drawerEl, 'pulse');
				}
			}
		}
	}

	$effect(() => {
		const isOpen = open;
		untrack(() => {
			if (!drawerEl) return;
			if (isOpen && !drawerEl.open) {
				onshow?.();
				addOpenListeners();
				originalTrigger = (typeof document !== 'undefined' ? document.activeElement : null) as HTMLElement | null;
				drawerEl.showModal();
				lockBodyScrolling(drawerEl);

				requestAnimationFrame(() => {
					const elementToFocus = drawerEl?.querySelector<HTMLElement>('[autofocus]');
					if (elementToFocus && typeof elementToFocus.focus === 'function') {
						elementToFocus.focus();
					} else {
						drawerEl?.focus();
					}
				});

				animateWithClass(drawerEl, 'show').then(() => {
					onaftershow?.();
				});
			} else if (!isOpen && drawerEl.open) {
				requestClose(drawerEl);
			}
		});

		return () => {
			removeOpenListeners();
			if (drawerEl) {
				unlockBodyScrolling(drawerEl);
				if (drawerEl.open) drawerEl.close();
			}
		};
	});
</script>

<dialog
	bind:this={drawerEl}
	{id}
	class="wa-drawer {placement} {className}"
	class:open
	part="dialog drawer"
	data-placement={placement}
	oncancel={handleCancel}
	onclick={handleClick}
	onpointerdown={handlePointerDown}
>
	{#if hasHeader}
		<div part="header" class="header">
			<h2 part="title" class="title" id="{id ? `${id}-title` : undefined}">
				{#if labelSnippet}
					{@render labelSnippet()}
				{:else if label}
					{label}
				{:else}
					&#8203;
				{/if}
			</h2>
			<div part="header-actions" class="header-actions">
				{#if headerActionsSnippet}
					{@render headerActionsSnippet()}
				{/if}
				<Button
					part="close-button"
					class="close"
					appearance="plain"
					size="m"
					onclick={() => requestClose(drawerEl)}
					aria-label="Close"
				>
					<svg
						viewBox="0 0 24 24"
						width="16"
						height="16"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</Button>
			</div>
		</div>
	{/if}

	<div part="body" class="body">
		{#if children}
			{@render children()}
		{/if}
	</div>

	{#if hasFooter}
		<div part="footer" class="footer">
			{#if footer}
				{@render footer()}
			{/if}
		</div>
	{/if}
</dialog>
