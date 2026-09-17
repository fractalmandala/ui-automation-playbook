<script lang="ts">
	import { onDestroy, onMount, untrack, type Snippet } from 'svelte';
	import { animateWithClass } from '../_shared/animate.js';
	import './toast-item.css';

	export type ToastVariant = 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
	export type ToastSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'small' | 'medium' | 'large';

	interface Props {
		/** Toast visual variant. */
		variant?: ToastVariant;
		/** Toast size. */
		size?: ToastSize;
		/** Auto-dismiss duration in ms. 0 for permanent. */
		duration?: number;
		/** Whether the toast is visible. */
		open?: boolean;
		/** Optional ID. */
		id?: string;
		/** Additional CSS classes. */
		class?: string;
		/** Icon snippet. */
		icon?: Snippet;
		/** Toast content. */
		children?: Snippet;
		/** Emitted when toast begins showing. */
		onshow?: () => void;
		/** Emitted after toast has shown. */
		onaftershow?: () => void;
		/** Emitted when toast begins hiding. */
		onhide?: () => void;
		/** Emitted after toast has hidden. */
		onafterhide?: () => void;
		/** Emitted when close button is clicked. */
		onclose?: () => void;
	}

	let {
		variant = 'neutral',
		size = 'm',
		duration = 5000,
		open = $bindable(true),
		id = undefined,
		class: className = '',
		icon,
		children,
		onshow,
		onaftershow,
		onhide,
		onafterhide,
		onclose
	}: Props = $props();

	let itemEl: HTMLElement | null = $state(null);
	let rendered = $state(open);
	let timerId: ReturnType<typeof setTimeout> | null = null;
	let startTime = 0;
	let remainingTime = 0;
	let isPaused = false;

	export async function show() {
		if (open) return;
		open = true;
	}

	export async function hide() {
		if (!open) return;
		open = false;
	}

	function startTimer() {
		if (duration <= 0 || typeof window === 'undefined') return;
		stopTimer();
		startTime = Date.now();
		timerId = setTimeout(() => {
			hide();
		}, remainingTime);
	}

	function stopTimer() {
		if (timerId !== null) {
			clearTimeout(timerId);
			timerId = null;
		}
	}

	function pauseTimer() {
		if (duration <= 0 || isPaused) return;
		isPaused = true;
		stopTimer();
		const elapsed = Date.now() - startTime;
		remainingTime = Math.max(0, remainingTime - elapsed);
	}

	function resumeTimer() {
		if (duration <= 0 || !isPaused) return;
		isPaused = false;
		if (remainingTime > 0) {
			startTimer();
		} else {
			hide();
		}
	}

	function handleCloseClick() {
		onclose?.();
		hide();
	}

	$effect(() => {
		const isOpen = open;
		untrack(() => {
			if (typeof document === 'undefined') return;

			if (isOpen) {
				onshow?.();
				rendered = true;
				remainingTime = duration;
				isPaused = false;
				startTimer();

				if (itemEl) {
					animateWithClass(itemEl, 'show').then(() => {
						onaftershow?.();
					});
				}
			} else {
				onhide?.();
				stopTimer();

				if (itemEl && rendered) {
					animateWithClass(itemEl, 'hide').then(() => {
						rendered = false;
						onafterhide?.();
					});
				} else {
					rendered = false;
				}
			}
		});

		return () => {
			stopTimer();
		};
	});

	onDestroy(() => {
		stopTimer();
	});
</script>

{#if rendered}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		{id}
		class="wa-toast-item {className}"
		data-variant={variant}
		data-size={size}
		role="status"
		aria-live={variant === 'danger' ? 'assertive' : 'polite'}
		aria-atomic="true"
		part="base"
		onmouseenter={pauseTimer}
		onmouseleave={resumeTimer}
	>
		<div
			bind:this={itemEl}
			class="toast-item"
			part="toast-item"
		>
			<div class="accent" part="accent"></div>

			{#if icon}
				<div class="icon" part="icon">
					{@render icon()}
				</div>
			{/if}

			<div class="content" part="content">
				{#if children}
					{@render children()}
				{/if}
			</div>

			<button
				type="button"
				class="close-button"
				part="close-button"
				aria-label="Close notification"
				onclick={handleCloseClick}
			>
				&times;
			</button>
		</div>
	</div>
{/if}
