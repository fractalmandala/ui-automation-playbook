<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import Tooltip from '../tooltip/Tooltip.svelte';
	import { announce } from '../_shared/live-announcer.js';
	import './copy-button.css';

	export type CopyButtonTooltipMode = 'full' | 'copy' | 'none';
	export type CopyButtonStatus = 'rest' | 'success' | 'error';

	interface Props {
		/** The text value to copy. */
		value?: string;
		/** ID of element to copy from, optionally with [attr] or .prop. */
		from?: string;
		/** Disables the button. */
		disabled?: boolean;
		/** Label for the default state. */
		copyLabel?: string;
		/** Label shown when copy succeeds. */
		successLabel?: string;
		/** Label shown when copy fails. */
		errorLabel?: string;
		/** Length of time to show feedback in ms. */
		feedbackDuration?: number;
		/** Placement of the tooltip. */
		tooltipPlacement?: 'top' | 'right' | 'bottom' | 'left';
		/** Tooltip display mode. */
		tooltip?: CopyButtonTooltipMode;
		/** Optional element id. */
		id?: string;
		/** Additional CSS classes. */
		class?: string;
		/** Custom trigger element. */
		children?: Snippet;
		/** Custom copy icon. */
		copyIcon?: Snippet;
		/** Custom success icon. */
		successIcon?: Snippet;
		/** Custom error icon. */
		errorIcon?: Snippet;
		/** Emitted when data has been copied. */
		oncopy?: (detail: { value: string }) => void;
		/** Emitted when data could not be copied. */
		onerror?: () => void;
	}

	let {
		value = '',
		from = '',
		disabled = false,
		copyLabel = 'Copy',
		successLabel = 'Copied',
		errorLabel = 'Error',
		feedbackDuration = 1000,
		tooltipPlacement = 'top',
		tooltip = 'full',
		id = undefined,
		class: className = '',
		children,
		copyIcon,
		successIcon,
		errorIcon,
		oncopy,
		onerror
	}: Props = $props();

	const uid = $props.id();
	const triggerId = `${uid}-trigger`;

	let isCopying = $state(false);
	let status = $state<CopyButtonStatus>('rest');
	let tooltipOpen = $state(false);
	let feedbackTimeout: ReturnType<typeof setTimeout> | null = null;

	const currentLabel = $derived(
		status === 'success' ? successLabel : status === 'error' ? errorLabel : copyLabel
	);

	const tooltipTrigger = $derived(tooltip === 'copy' ? 'manual' : 'hover focus');

	async function handleCopy() {
		if (disabled || isCopying) return;
		isCopying = true;

		let valueToCopy = value;

		if (from && typeof document !== 'undefined') {
			const isProperty = from.includes('.');
			const isAttribute = from.includes('[') && from.includes(']');
			let targetId = from;
			let field = '';

			if (isProperty) {
				[targetId, field] = from.trim().split('.');
			} else if (isAttribute) {
				[targetId, field] = from.trim().replace(/\]$/, '').split('[');
			}

			const target = document.getElementById(targetId);
			if (target) {
				if (isAttribute) {
					valueToCopy = target.getAttribute(field) || '';
				} else if (isProperty) {
					valueToCopy = (target as Record<string, any>)[field] || '';
				} else {
					valueToCopy = target.textContent || '';
				}
			} else {
				showFeedback('error');
				onerror?.();
				isCopying = false;
				return;
			}
		}

		if (!valueToCopy) {
			showFeedback('error');
			onerror?.();
		} else {
			try {
				if (navigator.clipboard && navigator.clipboard.writeText) {
					await navigator.clipboard.writeText(valueToCopy);
				}
				showFeedback('success');
				oncopy?.({ value: valueToCopy });
			} catch {
				showFeedback('error');
				onerror?.();
			}
		}

		isCopying = false;
	}

	function showFeedback(newStatus: 'success' | 'error') {
		status = newStatus;
		announce(currentLabel, 'polite');

		if (tooltip !== 'none') {
			tooltipOpen = true;
		}

		if (feedbackTimeout) clearTimeout(feedbackTimeout);
		feedbackTimeout = setTimeout(() => {
			status = 'rest';
			tooltipOpen = false;
		}, feedbackDuration);
	}

	$effect(() => {
		return () => {
			if (feedbackTimeout) clearTimeout(feedbackTimeout);
		};
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="wa-copy-button {className}" {id} data-status={status}>
	{#if children}
		<div id={triggerId} onclick={handleCopy} onkeydown={(e) => e.key === 'Enter' && handleCopy()} role="button" tabindex={disabled ? -1 : 0}>
			{@render children()}
		</div>
	{:else}
		<button
			id={triggerId}
			type="button"
			class="button"
			part="button"
			{disabled}
			aria-label={currentLabel}
			onclick={handleCopy}
		>
			<span class="icon-container" part="icon">
				{#if status === 'success'}
					<span class="show" part="success-icon">
						{#if successIcon}
							{@render successIcon()}
						{:else}
							<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="20 6 9 17 4 12"></polyline>
							</svg>
						{/if}
					</span>
				{:else if status === 'error'}
					<span class="show" part="error-icon">
						{#if errorIcon}
							{@render errorIcon()}
						{:else}
							<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
								<line x1="18" y1="6" x2="6" y2="18"></line>
								<line x1="6" y1="6" x2="18" y2="18"></line>
							</svg>
						{/if}
					</span>
				{:else}
					<span part="copy-icon">
						{#if copyIcon}
							{@render copyIcon()}
						{:else}
							<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
								<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
							</svg>
						{/if}
					</span>
				{/if}
			</span>
		</button>
	{/if}

	{#if tooltip !== 'none'}
		<Tooltip
			for={triggerId}
			placement={tooltipPlacement}
			trigger={tooltipTrigger}
			bind:open={tooltipOpen}
			content={currentLabel}
			disabled={disabled}
		/>
	{/if}
</div>
