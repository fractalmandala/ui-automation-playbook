<script lang="ts">
	import { getContext, onDestroy, onMount, type Snippet } from 'svelte';
	import { SELECT_KEY, SelectContext } from '../select/context.svelte.js';
	import './option.css';

	interface Props {
		/** The option's value. */
		value?: string;
		/** Draws the option in a disabled state. */
		disabled?: boolean;
		/** Whether the option is selected. */
		selected?: boolean;
		/** Selects an option initially. */
		defaultSelected?: boolean;
		/** The user has keyed into the option (shows a highlight). */
		current?: boolean;
		/** Optional plain text label. */
		label?: string;
		/** Optional ID. */
		id?: string;
		/** Additional CSS classes. */
		class?: string;
		/** Start slot content (icon/element placed before label). */
		start?: Snippet;
		/** Label content. */
		children?: Snippet;
		/** End slot content (icon/element placed after label). */
		end?: Snippet;
		/** Click handler. */
		onclick?: (event: MouseEvent) => void;
	}

	let {
		value = '',
		disabled = false,
		selected = $bindable(false),
		defaultSelected = false,
		current = false,
		label: labelProp = '',
		id = undefined,
		class: className = '',
		start,
		children,
		end,
		onclick
	}: Props = $props();

	const select = getContext<SelectContext | undefined>(SELECT_KEY);
	const generatedId = `wa-option-${Math.random().toString(36).substring(2, 9)}`;
	const optionId = $derived(id || generatedId);

	let rootEl: HTMLElement | null = $state(null);
	let localSelected = $state<boolean | null>(null);

	const isOptionSelected = $derived(
		select ? select.isSelected(value) : (localSelected !== null ? localSelected : (defaultSelected || selected))
	);
	const isOptionCurrent = $derived(select ? select.isCurrent(value) : current);

	function getLabelText(): string {
		if (labelProp) return labelProp;
		return rootEl?.querySelector('.label')?.textContent?.trim() || rootEl?.textContent?.trim() || value;
	}

	export function focus() {
		rootEl?.focus();
	}

	function handleClick(event: MouseEvent) {
		if (disabled) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}

		if (select) {
			select.selectOption(value, getLabelText());
		} else {
			localSelected = !isOptionSelected;
			selected = localSelected;
		}

		onclick?.(event);
	}

	onMount(() => {
		if (select) {
			select.registerOption({
				id: optionId,
				value,
				get label() {
					return getLabelText();
				},
				get disabled() {
					return disabled;
				},
				getLabel: getLabelText,
				focus
			});
		}
	});

	onDestroy(() => {
		if (select) {
			select.unregisterOption(optionId);
		}
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	bind:this={rootEl}
	id={optionId}
	class="wa-option {className}"
	role="option"
	tabindex="-1"
	aria-selected={isOptionSelected ? 'true' : 'false'}
	aria-disabled={disabled ? 'true' : 'false'}
	data-value={value}
	data-selected={isOptionSelected ? '' : undefined}
	data-current={isOptionCurrent ? '' : undefined}
	data-disabled={disabled ? '' : undefined}
	onclick={handleClick}
>
	<span part="checked-icon" class="check" aria-hidden="true">
		<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
			<polyline points="20 6 9 17 4 12"></polyline>
		</svg>
	</span>

	{#if start}
		<span part="start" class="start">
			{@render start()}
		</span>
	{/if}

	<span part="label" class="label">
		{#if children}
			{@render children()}
		{:else}
			{labelProp || value}
		{/if}
	</span>

	{#if end}
		<span part="end" class="end">
			{@render end()}
		</span>
	{/if}
</div>
