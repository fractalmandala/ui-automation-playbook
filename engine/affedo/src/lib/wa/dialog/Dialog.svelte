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
	import './dialog.css';

	interface Props {
		/** Indicates whether or not the dialog is open. */
		open?: boolean;
		/**
		 * The dialog's label as displayed in the header.
		 * If you need HTML markup, use `labelSnippet`.
		 */
		label?: string;
		/** Disables the header. This will also remove the default close button. */
		withoutHeader?: boolean;
		/** When enabled, the dialog will be closed when the user clicks outside of it. */
		lightDismiss?: boolean;
		/** Set to true if slotting in a footer so it displays correctly before hydration. */
		withFooter?: boolean;
		/** Optional element id. */
		id?: string;
		/** Additional CSS classes. */
		class?: string;
		/** The dialog's main content. */
		children?: Snippet;
		/** Custom label markup. */
		labelSnippet?: Snippet;
		/** Optional actions to add to the header. */
		headerActionsSnippet?: Snippet;
		/** The dialog's footer, usually one or more action buttons. */
		footer?: Snippet;
		/** Emitted when the dialog opens. */
		onshow?: () => void;
		/** Emitted after the dialog opens and all animations are complete. */
		onaftershow?: () => void;
		/** Emitted when the dialog is requested to close. */
		onhide?: (detail: {
			preventDefault: () => void;
			defaultPrevented: boolean;
			source?: Element | EventTarget | null;
		}) => void;
		/** Emitted after the dialog closes and all animations are complete. */
		onafterhide?: () => void;
	}

	let {
		open = $bindable(false),
		label = '',
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

	let dialogEl: HTMLDialogElement | null = $state(null);
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
		await requestClose(dialogEl);
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
			if (dialogEl) {
				await animateWithClass(dialogEl, 'pulse');
			}
			return;
		}

		removeOpenListeners();

		if (dialogEl && dialogEl.open) {
			await animateWithClass(dialogEl, 'hide');
			dialogEl.close();
		}

		open = false;
		if (dialogEl) unlockBodyScrolling(dialogEl);

		if (originalTrigger && typeof originalTrigger.focus === 'function') {
			setTimeout(() => originalTrigger?.focus());
		}

		onafterhide?.();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open && isTopDismissible(dismissKey)) {
			event.preventDefault();
			event.stopPropagation();
			requestClose(dialogEl);
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
		if (dialogEl && !dialogEl.classList.contains('hide') && isTopDismissible(dismissKey)) {
			requestClose(dialogEl);
		}
	}

	function handleClick(event: MouseEvent) {
		const target = event.target as HTMLElement | null;
		const closeButton = target?.closest?.('[data-dialog="close"]');
		if (closeButton) {
			event.stopPropagation();
			requestClose(closeButton);
		}
	}

	async function handlePointerDown(event: PointerEvent) {
		if (event.target === dialogEl) {
			if (lightDismiss) {
				requestClose(dialogEl);
			} else {
				if (dialogEl) {
					await animateWithClass(dialogEl, 'pulse');
				}
			}
		}
	}

	$effect(() => {
		const isOpen = open;
		untrack(() => {
			if (!dialogEl) return;
			if (isOpen && !dialogEl.open) {
				onshow?.();
				addOpenListeners();
				originalTrigger = (typeof document !== 'undefined' ? document.activeElement : null) as HTMLElement | null;
				dialogEl.showModal();
				lockBodyScrolling(dialogEl);

				requestAnimationFrame(() => {
					const elementToFocus = dialogEl?.querySelector<HTMLElement>('[autofocus]');
					if (elementToFocus && typeof elementToFocus.focus === 'function') {
						elementToFocus.focus();
					} else {
						dialogEl?.focus();
					}
				});

				animateWithClass(dialogEl, 'show').then(() => {
					onaftershow?.();
				});
			} else if (!isOpen && dialogEl.open) {
				requestClose(dialogEl);
			}
		});

		return () => {
			removeOpenListeners();
			if (dialogEl) {
				unlockBodyScrolling(dialogEl);
				if (dialogEl.open) dialogEl.close();
			}
		};
	});
</script>

<dialog
	bind:this={dialogEl}
	{id}
	class="wa-dialog {className}"
	class:open
	part="dialog"
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
					onclick={() => requestClose(dialogEl)}
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
