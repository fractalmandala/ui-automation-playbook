<script lang="ts">
	import type { Snippet } from 'svelte';
	import './details.css';

	export type DetailsAppearance = 'default' | 'plain' | 'outlined' | 'filled' | 'filled-outlined';
	export type DetailsIconPlacement = 'start' | 'end';

	interface Props {
		/** Indicates whether or not the details is open. */
		open?: boolean;
		/** The summary to show in the header. */
		summary?: string;
		/** Groups related details elements. When one opens, others with the same name close. */
		name?: string;
		/** Disables the details so it cannot be toggled. */
		disabled?: boolean;
		/** Visual appearance variant. */
		appearance?: DetailsAppearance;
		/** Placement of the expand/collapse chevron icon. */
		iconPlacement?: DetailsIconPlacement;
		/** The details main content. */
		children?: Snippet;
		/** Optional custom summary snippet (takes precedence over summary string). */
		summarySnippet?: Snippet;
		/** Optional custom expand icon. */
		expandIcon?: Snippet;
		/** Optional custom collapse icon. */
		collapseIcon?: Snippet;
		/** Called when the details opens. */
		onshow?: () => void;
		/** Called after opening animations complete. */
		onaftershow?: () => void;
		/** Called when the details closes. */
		onhide?: () => void;
		/** Called after closing animations complete. */
		onafterhide?: () => void;
	}

	let {
		open = $bindable(false),
		summary = '',
		name = '',
		disabled = false,
		appearance = 'default',
		iconPlacement = 'end',
		children,
		summarySnippet,
		expandIcon,
		collapseIcon,
		onshow,
		onaftershow,
		onhide,
		onafterhide
	}: Props = $props();

	let bodyEl = $state<HTMLElement>();
	let isAnimating = $state(false);

	// Listen for name group closes
	$effect(() => {
		if (!name) return;
		function handleGroupClose(e: CustomEvent<{ name: string; source: any }>) {
			if (e.detail.name === name && e.detail.source !== handleToggle && open) {
				hide();
			}
		}
		window.addEventListener('wa-details-group-close' as any, handleGroupClose);
		return () => window.removeEventListener('wa-details-group-close' as any, handleGroupClose);
	});

	export function show() {
		if (open || disabled) return;
		open = true;
		onshow?.();
		if (name && typeof window !== 'undefined') {
			window.dispatchEvent(
				new CustomEvent('wa-details-group-close', { detail: { name, source: handleToggle } })
			);
		}
		animateOpen();
	}

	export function hide() {
		if (!open || disabled) return;
		animateClose();
	}

	function handleToggle(event: MouseEvent) {
		event.preventDefault();
		if (disabled) return;
		if (open) {
			hide();
		} else {
			show();
		}
	}

	function animateOpen() {
		if (!bodyEl) {
			onaftershow?.();
			return;
		}
		isAnimating = true;
		const height = bodyEl.scrollHeight;
		const anim = bodyEl.animate(
			[
				{ height: '0px', opacity: '0' },
				{ height: `${height}px`, opacity: '1' }
			],
			{ duration: 250, easing: 'ease' }
		);
		anim.onfinish = () => {
			isAnimating = false;
			onaftershow?.();
		};
	}

	function animateClose() {
		if (!bodyEl) {
			open = false;
			onhide?.();
			onafterhide?.();
			return;
		}
		isAnimating = true;
		onhide?.();
		const height = bodyEl.scrollHeight;
		const anim = bodyEl.animate(
			[
				{ height: `${height}px`, opacity: '1' },
				{ height: '0px', opacity: '0' }
			],
			{ duration: 200, easing: 'ease' }
		);
		anim.onfinish = () => {
			open = false;
			isAnimating = false;
			onafterhide?.();
		};
	}
</script>

<div
	class="wa-details"
	data-open={open ? '' : undefined}
	data-disabled={disabled ? '' : undefined}
	data-appearance={appearance !== 'default' ? appearance : undefined}
	data-icon-placement={iconPlacement !== 'end' ? iconPlacement : undefined}
>
	<details part="base details" {open}>
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
		<summary
			part="header"
			aria-expanded={open}
			aria-disabled={disabled}
			onclick={handleToggle}
		>
			<span part="summary" class="summary-text">
				{#if summarySnippet}
					{@render summarySnippet()}
				{:else}
					{summary}
				{/if}
			</span>

			<span part="icon" class="icon" aria-hidden="true">
				{#if open && collapseIcon}
					{@render collapseIcon()}
				{:else if !open && expandIcon}
					{@render expandIcon()}
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512" width="1em" height="1em" fill="currentColor">
						<path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L194.7 256 41.4 409.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/>
					</svg>
				{/if}
			</span>
		</summary>

		<div
			part="content"
			class="body"
			class:animating={isAnimating}
			bind:this={bodyEl}
		>
			<div class="content">
				{@render children?.()}
			</div>
		</div>
	</details>
</div>
