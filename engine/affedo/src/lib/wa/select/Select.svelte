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
	import {
		SELECT_KEY,
		SelectContext,
		type OptionHandle,
		type SelectSize
	} from './context.svelte.js';
	import './select.css';
	import '../_shared/wa-styles/component/form-control.css';

	interface Props {
		/** The name of the select, submitted with form data. */
		name?: string;
		/** The select's value. String for single, array of strings for multiple. */
		value?: string | string[] | null;
		/** Default value. */
		defaultValue?: string | string[] | null;
		/** The select's size. */
		size?: SelectSize;
		/** Placeholder text when empty. */
		placeholder?: string;
		/** Allows more than one option to be selected. */
		multiple?: boolean;
		/** Maximum tags shown before +n badge. 0 for unlimited. */
		maxOptionsVisible?: number;
		/** Disables the select. */
		disabled?: boolean;
		/** Adds a clear button when select is not empty. */
		withClear?: boolean;
		/** Indicates whether select menu is open. */
		open?: boolean;
		/** Visual appearance. */
		appearance?: 'filled' | 'outlined' | 'filled-outlined';
		/** Draws a pill-style select. */
		pill?: boolean;
		/** Select label. */
		label?: string;
		/** Preferred placement. */
		placement?: Placement;
		/** Distance from combobox in px. */
		distance?: number;
		/** Skidding along combobox in px. */
		skidding?: number;
		/** Helper hint text. */
		hint?: string;
		/** Form required constraint. */
		required?: boolean;
		/** Optional ID. */
		id?: string;
		/** Additional CSS classes. */
		class?: string;
		/** Label snippet. */
		labelSnippet?: Snippet;
		/** Hint snippet. */
		hintSnippet?: Snippet;
		/** Start slot snippet. */
		start?: Snippet;
		/** End slot snippet. */
		end?: Snippet;
		/** Clear icon snippet. */
		clearIcon?: Snippet;
		/** Expand icon snippet. */
		expandIcon?: Snippet;
		/** Options. */
		children?: Snippet;
		/** Value change handler. */
		onchange?: (detail: { value: string | string[] | null }) => void;
		/** Input handler. */
		oninput?: (detail: { value: string | string[] | null }) => void;
		/** Clear handler. */
		onclear?: () => void;
		/** Emitted when select begins to show. */
		onshow?: () => void;
		/** Emitted after select has shown. */
		onaftershow?: () => void;
		/** Emitted when select begins to hide. */
		onhide?: () => void;
		/** Emitted after select has hidden. */
		onafterhide?: () => void;
		/** Focus handler. */
		onfocus?: (event: FocusEvent) => void;
		/** Blur handler. */
		onblur?: (event: FocusEvent) => void;
	}

	let {
		name = '',
		defaultValue = null,
		value = $bindable(defaultValue),
		size = 'm',
		placeholder = '',
		multiple = false,
		maxOptionsVisible = 3,
		disabled = false,
		withClear = false,
		open = $bindable(false),
		appearance = 'outlined',
		pill = false,
		label = '',
		placement = 'bottom-start',
		distance = 4,
		skidding = 0,
		hint = '',
		required = false,
		id = undefined,
		class: className = '',
		labelSnippet,
		hintSnippet,
		start,
		end,
		clearIcon,
		expandIcon,
		children,
		onchange,
		oninput,
		onclear,
		onshow,
		onaftershow,
		onhide,
		onafterhide,
		onfocus,
		onblur
	}: Props = $props();

	const listboxId = `wa-select-listbox-${Math.random().toString(36).substring(2, 9)}`;

	let comboboxEl: HTMLElement | null = $state(null);
	let listboxEl: HTMLElement | null = $state(null);
	let displayInputEl: HTMLInputElement | null = $state(null);
	let rendered = $state(open);
	let dynamicPlacement = $state<Placement | undefined>(undefined);
	const currentPlacement = $derived(dynamicPlacement ?? placement);
	const dismissKey = {};

	let currentOptionValue = $state<string | null>(null);
	let optionsMap = $state<Map<string, OptionHandle>>(new Map());
	let cleanupAutoUpdate: (() => void) | null = null;
	let pressStartedInside = false;

	function isSelected(optVal: string): boolean {
		if (multiple) {
			return Array.isArray(value) && value.includes(optVal);
		}
		return value === optVal;
	}

	function isCurrent(optVal: string): boolean {
		return currentOptionValue === optVal;
	}

	function selectOption(optVal: string) {
		if (disabled) return;

		if (multiple) {
			const currentList = Array.isArray(value) ? [...value] : value ? [value] : [];
			const idx = currentList.indexOf(optVal);
			if (idx >= 0) {
				currentList.splice(idx, 1);
			} else {
				currentList.push(optVal);
			}
			value = currentList;
			oninput?.({ value });
			onchange?.({ value });
		} else {
			value = optVal;
			open = false;
			oninput?.({ value });
			onchange?.({ value });
		}
	}

	function registerOption(handle: OptionHandle) {
		optionsMap.set(handle.id, handle);
		optionsMap = new Map(optionsMap);
	}

	function unregisterOption(id: string) {
		optionsMap.delete(id);
		optionsMap = new Map(optionsMap);
	}

	const ctx = new SelectContext(() => ({
		size,
		multiple,
		disabled,
		isSelected,
		isCurrent,
		selectOption,
		registerOption,
		unregisterOption
	}));
	setContext(SELECT_KEY, ctx);

	const allOptions = $derived(Array.from(optionsMap.values()));

	const displayLabel = $derived.by(() => {
		if (multiple) {
			return '';
		}
		if (value == null || value === '') {
			return '';
		}
		const opt = allOptions.find((o) => o.value === value);
		return opt ? opt.label : String(value);
	});

	const selectedTags = $derived.by(() => {
		if (!multiple || !Array.isArray(value)) return [];
		return value.map((v) => {
			const opt = allOptions.find((o) => o.value === v);
			return { value: v, label: opt ? opt.label : v };
		});
	});

	const visibleTags = $derived.by(() => {
		if (maxOptionsVisible <= 0 || selectedTags.length <= maxOptionsVisible) {
			return selectedTags;
		}
		return selectedTags.slice(0, maxOptionsVisible);
	});

	const hiddenTagsCount = $derived(
		maxOptionsVisible > 0 && selectedTags.length > maxOptionsVisible
			? selectedTags.length - maxOptionsVisible
			: 0
	);

	const hasValue = $derived(
		multiple
			? Array.isArray(value) && value.length > 0
			: value !== null && value !== undefined && value !== ''
	);

	export function show() {
		if (open || disabled) return;
		open = true;
	}

	export function hide() {
		if (!open) return;
		open = false;
	}

	export function focus() {
		displayInputEl?.focus();
	}

	export function blur() {
		displayInputEl?.blur();
	}

	export function reposition() {
		if (!comboboxEl || !listboxEl) return;
		const result = positionFloatingElements(comboboxEl, listboxEl, null, {
			placement,
			distance,
			skidding,
			boundary: 'viewport'
		});
		if (result) {
			dynamicPlacement = result.placement;
		}
		if (comboboxEl && listboxEl) {
			listboxEl.style.minWidth = `${comboboxEl.offsetWidth}px`;
		}
	}

	function handleComboboxClick(event: MouseEvent) {
		if (disabled) return;
		event.stopPropagation();
		open = !open;
	}

	function handleClear(event: MouseEvent) {
		event.stopPropagation();
		event.preventDefault();
		value = multiple ? [] : null;
		onclear?.();
		oninput?.({ value });
		onchange?.({ value });
		displayInputEl?.focus();
	}

	function handleRemoveTag(tagValue: string, event: MouseEvent) {
		event.stopPropagation();
		if (disabled) return;
		if (Array.isArray(value)) {
			value = value.filter((v) => v !== tagValue);
			oninput?.({ value });
			onchange?.({ value });
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (disabled) return;

		if (event.key === 'Escape' && open && isTopDismissible(dismissKey)) {
			event.preventDefault();
			event.stopPropagation();
			open = false;
			displayInputEl?.focus();
			return;
		}

		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			if (!open) {
				open = true;
				return;
			}

			const enabledOpts = allOptions.filter((o) => !o.disabled);
			if (enabledOpts.length === 0) return;

			const currentIdx = enabledOpts.findIndex((o) => o.value === currentOptionValue);
			let nextIdx = 0;
			if (event.key === 'ArrowDown') {
				nextIdx = currentIdx < enabledOpts.length - 1 ? currentIdx + 1 : 0;
			} else {
				nextIdx = currentIdx > 0 ? currentIdx - 1 : enabledOpts.length - 1;
			}
			currentOptionValue = enabledOpts[nextIdx].value;
			return;
		}

		if (event.key === 'Enter' || (event.key === ' ' && !open)) {
			event.preventDefault();
			if (!open) {
				open = true;
			} else if (currentOptionValue) {
				selectOption(currentOptionValue);
			}
		}
	}

	function handlePointerDown(event: PointerEvent) {
		const path = event.composedPath();
		pressStartedInside = listboxEl ? path.includes(listboxEl) : false;
	}

	function handleClickOutside(event: MouseEvent) {
		const startedInside = pressStartedInside;
		pressStartedInside = false;
		if (startedInside) return;

		const path = event.composedPath();
		if (comboboxEl && path.includes(comboboxEl)) return;
		if (listboxEl && path.includes(listboxEl)) return;

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

				if (comboboxEl && listboxEl) {
					cleanupAutoUpdate = autoUpdatePosition(comboboxEl, listboxEl, reposition);
				}

				if (listboxEl) {
					animateWithClass(listboxEl, 'show').then(() => {
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

				if (listboxEl && rendered) {
					animateWithClass(listboxEl, 'hide').then(() => {
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

<div
	class="wa-form-control wa-select {className}"
	{id}
	data-size={size}
	data-appearance={appearance}
	data-pill={pill ? '' : undefined}
	data-disabled={disabled ? '' : undefined}
	data-open={open ? '' : undefined}
	data-multiple={multiple ? '' : undefined}
	data-has-value={hasValue ? '' : undefined}
	part="form-control"
>
	{#if label || labelSnippet}
		<label class="form-control-label" part="form-control-label" for={id}>
			{#if labelSnippet}
				{@render labelSnippet()}
			{:else}
				{label}
			{/if}
		</label>
	{/if}

	<div class="form-control-input" part="form-control-input">
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			bind:this={comboboxEl}
			class="combobox"
			part="combobox"
			onclick={handleComboboxClick}
			onkeydown={handleKeyDown}
		>
			{#if start}
				<span class="start" part="start">
					{@render start()}
				</span>
			{/if}

			{#if multiple && selectedTags.length > 0}
				<div class="tags" part="tags">
					{#each visibleTags as tag (tag.value)}
						<span class="wa-select-tag" part="tag">
							<span class="wa-select-tag-content" part="tag__content">{tag.label}</span>
							{#if !disabled}
								<button
									type="button"
									class="wa-select-tag-remove"
									part="tag__remove-button"
									aria-label="Remove {tag.label}"
									onclick={(e) => handleRemoveTag(tag.value, e)}
								>
									&times;
								</button>
							{/if}
						</span>
					{/each}
					{#if hiddenTagsCount > 0}
						<span class="wa-select-tag" part="tag">
							<span class="wa-select-tag-content" part="tag__content">+{hiddenTagsCount}</span>
						</span>
					{/if}
				</div>
			{/if}

			<input
				bind:this={displayInputEl}
				class="display-input"
				part="display-input"
				type="text"
				role="combobox"
				aria-expanded={open ? 'true' : 'false'}
				aria-controls={listboxId}
				aria-haspopup="listbox"
				aria-disabled={disabled}
				{placeholder}
				readonly
				value={displayLabel}
				{disabled}
				tabindex={disabled ? -1 : 0}
				onfocus={onfocus}
				onblur={onblur}
			/>

			{#if withClear && hasValue && !disabled}
				<button
					type="button"
					class="clear-button"
					part="clear-button"
					aria-label="Clear selection"
					onclick={handleClear}
					tabindex="-1"
				>
					{#if clearIcon}
						{@render clearIcon()}
					{:else}
						<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
							<path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
						</svg>
					{/if}
				</button>
			{/if}

			{#if end}
				<span class="end" part="end">
					{@render end()}
				</span>
			{/if}

			<span class="expand-icon" part="expand-icon" aria-hidden="true">
				{#if expandIcon}
					{@render expandIcon()}
				{:else}
					<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="6 9 12 15 18 9"></polyline>
					</svg>
				{/if}
			</span>
		</div>

		{#if rendered}
			<div
				bind:this={listboxEl}
				id={listboxId}
				class="wa-select-listbox"
				role="listbox"
				aria-multiselectable={multiple}
				tabindex="-1"
				part="listbox"
				data-placement={currentPlacement}
			>
				{#if children}
					{@render children()}
				{/if}
			</div>
		{/if}
	</div>

	{#if hint || hintSnippet}
		<div class="form-control-hint" part="form-control-hint">
			{#if hintSnippet}
				{@render hintSnippet()}
			{:else}
				{hint}
			{/if}
		</div>
	{/if}

	<!-- Mirrored hidden inputs for form submission -->
	{#if name}
		{#if multiple && Array.isArray(value)}
			{#each value as itemVal}
				<input type="hidden" {name} value={itemVal} />
			{/each}
		{:else}
			<input type="hidden" {name} value={value ?? ''} />
		{/if}
	{/if}
</div>
