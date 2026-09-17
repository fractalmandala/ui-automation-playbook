<script lang="ts">
	import type { Snippet } from 'svelte';
	import './random-content.css';

	export type RandomContentMode = 'random' | 'unique' | 'sequence';
	export type RandomContentAnimation = 'none' | 'fade' | 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right';

	interface Props {
		/** Number of children to show simultaneously. */
		items?: number;
		/** Selection mode: unique, random, or sequence. */
		mode?: RandomContentMode;
		/** Rotate content automatically. */
		autoplay?: boolean;
		/** Autoplay cadence in milliseconds. */
		autoplayInterval?: number;
		/** Entrance animation for newly shown children. */
		animation?: RandomContentAnimation;
		/** Pool of elements to choose from. */
		children?: Snippet;
		/** Called when displayed items change. */
		oncontentchange?: (items: HTMLElement[]) => void;
	}

	let {
		items = 1,
		mode = 'unique',
		autoplay = false,
		autoplayInterval = 3000,
		animation = 'none',
		children,
		oncontentchange
	}: Props = $props();

	let containerEl = $state<HTMLElement>();
	let sequenceCursor = 0;
	let uniqueQueue: HTMLElement[] = [];
	let currentSelection = new Set<HTMLElement>();

	function getChildElements(): HTMLElement[] {
		if (!containerEl) return [];
		return Array.from(containerEl.children).filter(
			el => el instanceof HTMLElement && !el.hasAttribute('aria-live')
		) as HTMLElement[];
	}

	function shuffle<T>(array: T[]): T[] {
		const arr = [...array];
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	}

	export function randomize(): HTMLElement[] {
		const allChildren = getChildElements();
		if (!allChildren.length) return [];

		const count = Math.min(Math.max(1, items), allChildren.length);
		let selected: HTMLElement[] = [];

		if (mode === 'sequence') {
			for (let i = 0; i < count; i++) {
				selected.push(allChildren[(sequenceCursor + i) % allChildren.length]);
			}
			sequenceCursor = (sequenceCursor + count) % allChildren.length;
		} else if (mode === 'unique') {
			if (uniqueQueue.length < count) {
				const queued = new Set(uniqueQueue);
				const rest = allChildren.filter(c => !currentSelection.has(c) && !queued.has(c));
				uniqueQueue = [...uniqueQueue, ...shuffle(rest), ...shuffle(Array.from(currentSelection))];
			}
			selected = uniqueQueue.splice(0, count);
		} else {
			selected = shuffle(allChildren).slice(0, count);
		}

		currentSelection = new Set(selected);

		for (const child of allChildren) {
			const isSelected = currentSelection.has(child);
			child.hidden = !isSelected;
			if (isSelected && animation !== 'none') {
				child.setAttribute('data-wa-animation', animation);
			} else {
				child.removeAttribute('data-wa-animation');
			}
		}

		oncontentchange?.(selected);
		return selected;
	}

	$effect(() => {
		if (!containerEl) return;
		randomize();
	});

	$effect(() => {
		if (!autoplay) return;
		const timer = setInterval(() => {
			randomize();
		}, autoplayInterval);
		return () => clearInterval(timer);
	});
</script>

<div class="wa-random-content" bind:this={containerEl}>
	{@render children?.()}
</div>
