<script lang="ts">
	import { getContext, type Snippet } from 'svelte';
	import { DROPDOWN_KEY, DropdownContext } from '../dropdown/context.svelte.js';
	import './dropdown-item.css';

	interface Props {
		/** An optional value for the menu item. */
		value?: string;
		/** Visual variant. */
		variant?: 'default' | 'danger';
		/** Type of menu item. */
		type?: 'normal' | 'checkbox';
		/** Whether item is checked (for checkbox type). */
		checked?: boolean;
		/** Disables the item. */
		disabled?: boolean;
		/** Draws item in active state. */
		active?: boolean;
		/** Optional link URL. */
		href?: string;
		/** Where to open link. */
		target?: '_blank' | '_parent' | '_self' | '_top';
		/** Link relationship. */
		rel?: string;
		/** File download name. */
		download?: string;
		/** Optional ID. */
		id?: string;
		/** Additional CSS classes. */
		class?: string;
		/** Item label / content. */
		children?: Snippet;
		/** Icon before label. */
		icon?: Snippet;
		/** Content after label. */
		details?: Snippet;
		/** Emitted when clicked. */
		onclick?: (event: MouseEvent) => void;
		/** Emitted on blur. */
		onblur?: (event: FocusEvent) => void;
		/** Emitted on focus. */
		onfocus?: (event: FocusEvent) => void;
	}

	let {
		value = undefined,
		variant = 'default',
		type = 'normal',
		checked = $bindable(false),
		disabled = false,
		active = false,
		href = undefined,
		target = undefined,
		rel = undefined,
		download = undefined,
		id = undefined,
		class: className = '',
		children,
		icon,
		details,
		onclick,
		onblur,
		onfocus
	}: Props = $props();

	const dropdown = getContext<DropdownContext | undefined>(DROPDOWN_KEY);

	let rootEl: HTMLElement | null = $state(null);

	export function focus() {
		rootEl?.focus();
	}

	function handleClick(event: MouseEvent) {
		if (disabled) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}

		if (type === 'checkbox') {
			checked = !checked;
		}

		onclick?.(event);

		if (dropdown) {
			const text = rootEl?.textContent?.trim() || '';
			dropdown.selectItem({ value, text });
			dropdown.close();
		}
	}
</script>

{#if href}
	<a
		bind:this={rootEl}
		{id}
		{href}
		{target}
		{rel}
		{download}
		class="wa-dropdown-item {className}"
		data-variant={variant}
		data-active={active ? '' : undefined}
		data-disabled={disabled ? '' : undefined}
		data-checked={checked ? '' : undefined}
		role="menuitem"
		tabindex={disabled ? -1 : 0}
		onclick={handleClick}
		onblur={onblur}
		onfocus={onfocus}
	>
		{#if type === 'checkbox'}
			<span class="check" aria-hidden="true">
				<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="20 6 9 17 4 12"></polyline>
				</svg>
			</span>
		{/if}

		{#if icon}
			<span class="icon" part="icon">
				{@render icon()}
			</span>
		{/if}

		<span class="label" part="label">
			{#if children}
				{@render children()}
			{/if}
		</span>

		{#if details}
			<span class="details" part="details">
				{@render details()}
			</span>
		{/if}
	</a>
{:else}
	<button
		bind:this={rootEl}
		type="button"
		{id}
		class="wa-dropdown-item {className}"
		data-variant={variant}
		data-active={active ? '' : undefined}
		data-disabled={disabled ? '' : undefined}
		data-checked={checked ? '' : undefined}
		role={type === 'checkbox' ? 'menuitemcheckbox' : 'menuitem'}
		aria-checked={type === 'checkbox' ? checked : undefined}
		aria-disabled={disabled ? 'true' : undefined}
		tabindex={disabled ? -1 : 0}
		onclick={handleClick}
		onblur={onblur}
		onfocus={onfocus}
	>
		{#if type === 'checkbox'}
			<span class="check" aria-hidden="true">
				<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="20 6 9 17 4 12"></polyline>
				</svg>
			</span>
		{/if}

		{#if icon}
			<span class="icon" part="icon">
				{@render icon()}
			</span>
		{/if}

		<span class="label" part="label">
			{#if children}
				{@render children()}
			{/if}
		</span>

		{#if details}
			<span class="details" part="details">
				{@render details()}
			</span>
		{/if}
	</button>
{/if}
