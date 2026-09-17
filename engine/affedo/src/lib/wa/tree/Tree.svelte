<script lang="ts">
	import { setContext, type Snippet } from 'svelte';
	import {
		TREE_DEPTH_KEY,
		TREE_KEY,
		TreeContext,
		type TreeItemHandle,
		type TreeSelection
	} from './context.svelte.js';
	import './tree.css';

	interface Props {
		/** Selection behavior mode. */
		selection?: TreeSelection;
		/** Optional ID. */
		id?: string;
		/** Additional CSS classes. */
		class?: string;
		/** Tree items. */
		children?: Snippet;
		/** Emitted when tree selection changes. */
		onselectionchange?: (detail: { selection: string[] }) => void;
	}

	let {
		selection = 'single',
		id = undefined,
		class: className = '',
		children,
		onselectionchange
	}: Props = $props();

	let itemsMap = $state<Map<string, TreeItemHandle>>(new Map());
	let selectedIds = $state<Set<string>>(new Set());

	function isSelected(value?: string, id?: string): boolean {
		if (value && selectedIds.has(value)) return true;
		if (id && selectedIds.has(id)) return true;
		return false;
	}

	function selectItem(handle: TreeItemHandle) {
		const key = handle.value || handle.id;

		if (selection === 'single' || selection === 'leaf') {
			selectedIds.clear();
			selectedIds.add(key);
			selectedIds = new Set(selectedIds);
		} else {
			// multiple
			if (selectedIds.has(key)) {
				selectedIds.delete(key);
			} else {
				selectedIds.add(key);
			}
			selectedIds = new Set(selectedIds);
		}

		onselectionchange?.({ selection: Array.from(selectedIds) });
	}

	function registerItem(handle: TreeItemHandle) {
		itemsMap.set(handle.id, handle);
		itemsMap = new Map(itemsMap);
	}

	function unregisterItem(id: string) {
		itemsMap.delete(id);
		itemsMap = new Map(itemsMap);
		selectedIds.delete(id);
		selectedIds = new Set(selectedIds);
	}

	const ctx = new TreeContext(() => ({
		selection,
		selectItem,
		registerItem,
		unregisterItem,
		isSelected
	}));

	setContext(TREE_KEY, ctx);
	setContext(TREE_DEPTH_KEY, 0);
</script>

<div
	{id}
	class="wa-tree {className}"
	role="tree"
	aria-multiselectable={selection === 'multiple' || selection === 'leaf-multiple'}
	tabindex="0"
	part="tree base"
>
	{#if children}
		{@render children()}
	{/if}
</div>
