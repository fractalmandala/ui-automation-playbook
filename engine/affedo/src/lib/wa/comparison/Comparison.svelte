<script lang="ts">
	import type { Snippet } from 'svelte';
	import './comparison.css';

	interface Props {
		/** The position of the divider as a percentage (0–100). Bindable: updates live while dragging. */
		position?: number;
		/** The before content, often an `<img>` or `<svg>` element. */
		before?: Snippet;
		/** The after content, often an `<img>` or `<svg>` element. */
		after?: Snippet;
		/** The icon shown inside the drag handle. Defaults to a grip affordance. */
		handle?: Snippet;
		/** Emitted when the position changes (drag or keyboard). The WA `change` event is not cancelable, so the return value is ignored. */
		onchange?: () => void;
	}

	let { position = $bindable(50), before, after, handle, onchange }: Props = $props();

	const uid = $props.id();

	let rootEl = $state<HTMLElement>();
	let isDragging = $state(false);
	// Direction the component renders in. Synced from the live DOM on mount so RTL
	// pages mirror the divider exactly like WA's LocalizeController did. WA uses
	// LocalizeController only for dir() here — there are no translated strings.
	let rtl = $state(false);

	$effect(() => {
		if (rootEl) {
			rtl = getComputedStyle(rootEl).direction === 'rtl';
		}
	});

	function clamp(value: number, min: number, max: number) {
		if (value < min) return min;
		if (value > max) return max;
		return Object.is(value, -0) ? 0 : value;
	}

	/** Live direction check so drag/keyboard stay correct even if `dir` flips after mount. */
	function currentRtl(): boolean {
		if (rootEl) {
			try {
				if (rootEl.matches(':dir(rtl)')) return true;
				if (rootEl.matches(':dir(ltr)')) return false;
			} catch {
				/* engines without :dir() support — fall through to tracked state */
			}
		}
		return rtl;
	}

	// Port of WA's `drag(this, …)` from internal/drag.ts: pointermove/pointerup
	// listeners on the document, coordinates resolved against the component's own
	// box, width + direction captured at drag start exactly like the source.
	function startDrag(event: MouseEvent | TouchEvent) {
		if (!rootEl) return;
		event.preventDefault();
		const { width } = rootEl.getBoundingClientRect();
		const dragRtl = currentRtl();

		const onMove = (pointerEvent: PointerEvent) => {
			if (!rootEl) return;
			const dims = rootEl.getBoundingClientRect();
			const defaultView = rootEl.ownerDocument.defaultView;
			const x = pointerEvent.pageX - (dims.left + (defaultView?.pageXOffset ?? 0));
			isDragging = true;
			let next = parseFloat(clamp((x / width) * 100, 0, 100).toFixed(2));
			if (dragRtl) next = 100 - next;
			position = next;
		};
		const onStop = () => {
			document.removeEventListener('pointermove', onMove);
			document.removeEventListener('pointerup', onStop);
			isDragging = false;
		};

		document.addEventListener('pointermove', onMove, { passive: true });
		document.addEventListener('pointerup', onStop);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
		const keyRtl = currentRtl();
		const keyLtr = !keyRtl;
		const incr = event.shiftKey ? 10 : 1;
		let next = position;

		event.preventDefault();

		if ((keyLtr && event.key === 'ArrowLeft') || (keyRtl && event.key === 'ArrowRight')) {
			next -= incr;
		}
		if ((keyLtr && event.key === 'ArrowRight') || (keyRtl && event.key === 'ArrowLeft')) {
			next += incr;
		}
		if (event.key === 'Home') {
			next = 0;
		}
		if (event.key === 'End') {
			next = 100;
		}

		position = clamp(next, 0, 100);
	}

	// Port of `@watch('position', { waitUntilFirstUpdate: true })`: notify on every
	// change after the initial render, never for the initial value.
	let firstPositionRun = true;
	$effect(() => {
		void position;
		if (firstPositionRun) {
			firstPositionRun = false;
			return;
		}
		onchange?.();
	});

	const afterClip = $derived(
		rtl ? `inset(0 0 0 ${100 - position}%)` : `inset(0 ${100 - position}% 0 0)`
	);
	const dividerLeft = $derived(rtl ? `${100 - position}%` : `${position}%`);
</script>

<div
	class="wa-comparison"
	class:dragging={isDragging}
	data-position={position}
	bind:this={rootEl}
>
	<!-- WA names this wrapper "image"; kept verbatim for fidelity. -->
	<div id="{uid}-comparison" part="base comparison" class="image">
		<div part="before" class="before">
			{#if before}{@render before()}{/if}
		</div>

		<div part="after" class="after" style:clip-path={afterClip}>
			{#if after}{@render after()}{/if}
		</div>
	</div>

	<!-- svelte-ignore a11y_no_static_element_interactions: WA puts the drag/keyboard handlers on the divider and the focus on the handle child (role="scrollbar", tabindex="0") — events reach the divider by bubbling. Kept verbatim for fidelity. -->
	<div
		part="divider"
		class="divider"
		style:left={dividerLeft}
		onkeydown={handleKeyDown}
		onmousedown={startDrag}
		ontouchstart={startDrag}
	>
		<div
			part="handle"
			class="handle"
			role="scrollbar"
			aria-valuenow={position}
			aria-valuemin="0"
			aria-valuemax="100"
			aria-controls="{uid}-comparison"
			tabindex="0"
		>
			{#if handle}
				{@render handle()}
			{:else}
				<!-- Default grip affordance: redrawn equivalent of wa-icon "grip-vertical"
				     (Font Awesome solid), inlined so comparison works standalone. -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 24"
					width="1em"
					height="1em"
					fill="currentColor"
					aria-hidden="true"
				>
					<circle cx="5" cy="4" r="2" />
					<circle cx="11" cy="4" r="2" />
					<circle cx="5" cy="12" r="2" />
					<circle cx="11" cy="12" r="2" />
					<circle cx="5" cy="20" r="2" />
					<circle cx="11" cy="20" r="2" />
				</svg>
			{/if}
		</div>
	</div>
</div>
