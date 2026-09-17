<script lang="ts">
	import { getContext, type Snippet } from 'svelte';
	import { TAB_GROUP_KEY, type TabGroupContext, type TabHandle } from './context.svelte.js';
	import './tab.css';

	interface Props {
		/** The name of the tab panel this tab is associated with. The panel must be located in the same tab group. */
		panel?: string;
		/**
		 * Draws the tab in an active state. Owned by the leaf; the future
		 * tab-group mutates it via the handle (`setActiveTab()` / `syncActive()`).
		 * `@internal` in WA (the group drives it) but `$bindable` here so
		 * standalone use and `bind:active` keep working (lit-to-svelte §2).
		 */
		active?: boolean;
		/** Disables the tab and prevents selection. */
		disabled?: boolean;
		/** The tab's label. Maps to WA's default slot (the source has no named slots — closable tabs are an external `wa-button` in the `nav` slot per the tab-group docs, not a tab prop). */
		children?: Snippet;
	}

	let { panel = '', active = $bindable(false), disabled = false, children }: Props = $props();

	// Outside a group the leaf governs itself; inside, the group drives it
	// through the handle (accordion pattern). Standalone tabs activate on
	// click/Enter/Space rather than crashing on a missing context.
	const ctx = getContext<TabGroupContext | undefined>(TAB_GROUP_KEY);

	const uid = $props.id();

	// Port of WA's `@watch('disabled') handleDisabledChange()` + the tabIndex
	// half of the group's `setActiveTab()` sync. Standalone keeps WA's exact
	// rule (disabled + inactive → -1, otherwise 0); grouped roves (active 0,
	// the rest -1, disabled always -1 — radio precedent). The future group also
	// writes `el.tabIndex` imperatively for manual-activation focus moves, where
	// `active` does not change; Svelte only rewrites the attribute when this
	// derivation changes, so that fix-up sticks.
	const tabindex = $derived(ctx ? (disabled ? -1 : active ? 0 : -1) : disabled && !active ? -1 : 0);

	function activate() {
		if (disabled) return;
		if (ctx) ctx.setActiveTab(handle);
		else active = true;
	}

	function handleClick() {
		activate();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (disabled) return;
		if (ctx) {
			ctx.keydown(event, handle);
			return;
		}
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			activate();
		}
	}

	const handle: TabHandle = {
		el: undefined as unknown as HTMLElement,
		get panel() {
			return panel;
		},
		get disabled() {
			return disabled;
		},
		get active() {
			return active;
		},
		setActive(next: boolean) {
			active = next;
		},
		focus: (options?: FocusOptions) => handle.el?.focus(options)
	};

	function join(node: HTMLElement) {
		handle.el = node;
		return ctx?.registerTab(handle);
	}

	/** Sets focus on the tab. */
	export function focus(options?: FocusOptions) {
		handle.el?.focus(options);
	}
</script>

<!--
  WA structure is host (`wa-tab`, focusable `role=tab`) + inner `.tab`
  (`part="base tab"`). The root replaces `:host` (`.wa-tab` in tab.css);
  `aria-selected` / `aria-disabled` are the `@watch` ports. `aria-controls`
  is left for the future group, which stamps it imperatively in
  `setAriaLabels()` once both sides have ids (WA's IntersectionObserver pass).
-->
<div
	class="wa-tab"
	id={uid}
	role="tab"
	tabindex={tabindex}
	aria-selected={active}
	aria-disabled={disabled}
	data-active={active ? '' : undefined}
	data-disabled={disabled ? '' : undefined}
	data-panel={panel || undefined}
	{@attach join}
	onclick={handleClick}
	onkeydown={handleKeyDown}
>
	<div class="tab" class:tab-active={active} part="base tab">
		{#if children}{@render children()}{/if}
	</div>
</div>
