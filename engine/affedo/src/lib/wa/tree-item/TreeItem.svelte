<script lang="ts">
	import { getContext, onDestroy, onMount, setContext, type Snippet } from 'svelte';
	import {
		TREE_DEPTH_KEY,
		TREE_KEY,
		TreeContext,
		type TreeItemHandle
	} from '../tree/context.svelte.js';
	import './tree-item.css';

	interface Props {
		/** Expands or collapses item. */
		expanded?: boolean;
		/** Whether item is selected. */
		selected?: boolean;
		/** Disables item. */
		disabled?: boolean;
		/** Value associated with item. */
		value?: string;
		/** Optional ID. */
		id?: string;
		/** Additional CSS classes. */
		class?: string;
		/** Plain text label for item. */
		text?: string;
		/** Item label snippet. */
		label?: Snippet;
		/** Expand icon snippet. */
		expandIcon?: Snippet;
		/** Children items. */
		children?: Snippet;
		/** Emitted when expanded. */
		onexpand?: () => void;
		/** Emitted when collapsed. */
		oncollapse?: () => void;
		/** Emitted when selected. */
		onselect?: () => void;
	}

	let {
		expanded = $bindable(false),
		selected = $bindable(false),
		disabled = false,
		value = '',
		id = undefined,
		class: className = '',
		text = '',
		label,
		expandIcon,
		children,
		onexpand,
		oncollapse,
		onselect
	}: Props = $props();

	const tree = getContext<TreeContext | undefined>(TREE_KEY);
	const depth = getContext<number | undefined>(TREE_DEPTH_KEY) ?? 0;
	setContext(TREE_DEPTH_KEY, depth + 1);

	const generatedId = `wa-tree-item-${Math.random().toString(36).substring(2, 9)}`;
	const itemId = $derived(id || generatedId);

	let hasChildren = $derived(Boolean(children));

	const isItemSelected = $derived(tree ? tree.isSelected(value, itemId) : selected);

	function toggleExpand(event: MouseEvent) {
		event.stopPropagation();
		if (disabled) return;
		expanded = !expanded;
		if (expanded) {
			onexpand?.();
		} else {
			oncollapse?.();
		}
	}

	function handleItemClick(event: MouseEvent) {
		if (disabled) return;
		if (tree) {
			tree.selectItem({
				id: itemId,
				value,
				disabled,
				expanded,
				selected,
				depth,
				setExpanded: (exp) => { expanded = exp; },
				setSelected: (sel) => { selected = sel; }
			});
		} else {
			selected = !selected;
		}
		onselect?.();
	}

	onMount(() => {
		if (tree) {
			tree.registerItem({
				id: itemId,
				value,
				disabled,
				get expanded() { return expanded; },
				get selected() { return selected; },
				depth,
				setExpanded: (exp) => { expanded = exp; },
				setSelected: (sel) => { selected = sel; }
			});
		}
	});

	onDestroy(() => {
		if (tree) {
			tree.unregisterItem(itemId);
		}
	});
</script>

<div
	id={itemId}
	class="wa-tree-item {className}"
	style="--indent: {depth * 1.25}em;"
	data-expanded={expanded ? '' : undefined}
	data-selected={isItemSelected ? '' : undefined}
	data-disabled={disabled ? '' : undefined}
	role="treeitem"
	aria-expanded={hasChildren ? (expanded ? 'true' : 'false') : undefined}
	aria-selected={isItemSelected ? 'true' : 'false'}
	aria-disabled={disabled ? 'true' : 'false'}
	part="base"
>
	<div class="tree-item-inner">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="item" part="item" onclick={handleItemClick}>
			<span class="indentation" aria-hidden="true"></span>

			{#if hasChildren}
				<button
					type="button"
					class="expand-button"
					part="expand-button"
					aria-label={expanded ? 'Collapse' : 'Expand'}
					onclick={toggleExpand}
				>
					{#if expandIcon}
						{@render expandIcon()}
					{:else}
						<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="9 18 15 12 9 6"></polyline>
						</svg>
					{/if}
				</button>
			{:else}
				<span class="expand-button-placeholder" aria-hidden="true"></span>
			{/if}

			<div class="label" part="label">
				{#if label}
					{@render label()}
				{:else if text}
					{text}
				{:else if value}
					{value}
				{/if}
			</div>
		</div>

		{#if hasChildren && expanded}
			<div class="children" role="group" part="children">
				{#if children}
					{@render children()}
				{/if}
			</div>
		{/if}
	</div>
</div>
