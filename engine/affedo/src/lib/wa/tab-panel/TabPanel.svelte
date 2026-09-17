<script lang="ts">
	import { getContext, type Snippet } from 'svelte';
	import { TAB_GROUP_KEY, type TabGroupContext, type TabPanelHandle } from '../tab/context.svelte.js';
	import './tab-panel.css';

	interface Props {
		/** The tab panel's name. */
		name?: string;
		/** When true, the tab panel will be shown. */
		active?: boolean;
		/** The tab panel's content. */
		children?: Snippet;
	}

	let { name = '', active = $bindable(false), children }: Props = $props();

	const ctx = getContext<TabGroupContext | undefined>(TAB_GROUP_KEY);
	const uid = $props.id();

	const handle: TabPanelHandle = {
		el: undefined as unknown as HTMLElement,
		get name() {
			return name;
		},
		get active() {
			return active;
		},
		setActive(next: boolean) {
			active = next;
		}
	};

	function join(node: HTMLElement) {
		handle.el = node;
		return ctx?.registerPanel(handle);
	}
</script>

<div
	class="wa-tab-panel"
	id={uid}
	role="tabpanel"
	aria-hidden={!active}
	inert={!active}
	data-active={active ? '' : undefined}
	data-name={name || undefined}
	{@attach join}
>
	<div class="tab-panel" class:tab-panel-active={active} part="base">
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>
