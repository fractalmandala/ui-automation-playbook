<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
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
	import './color-picker.css';
	import '../_shared/wa-styles/component/form-control.css';

	export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'hsv';
	export type ColorPickerSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'small' | 'medium' | 'large';

	export interface ColorSwatch {
		color: string;
		label?: string;
	}

	interface Props {
		/** Current color value. */
		value?: string;
		/** Default value. */
		defaultValue?: string;
		/** Color format. */
		format?: ColorFormat;
		/** Color picker trigger size. */
		size?: ColorPickerSize;
		/** Preferred placement. */
		placement?: Placement;
		/** Disables the color picker. */
		disabled?: boolean;
		/** Indicates whether popup is open. */
		open?: boolean;
		/** Renders inline instead of inside a popup. */
		inline?: boolean;
		/** Shows opacity slider. */
		opacity?: boolean;
		/** Uppercase output. */
		uppercase?: boolean;
		/** Removes format toggle button. */
		withoutFormatToggle?: boolean;
		/** Preset swatches. */
		swatches?: (string | ColorSwatch)[];
		/** Form control label. */
		label?: string;
		/** Helper hint text. */
		hint?: string;
		/** Form submission name. */
		name?: string;
		/** Optional ID. */
		id?: string;
		/** Additional CSS classes. */
		class?: string;
		/** Label snippet. */
		labelSnippet?: Snippet;
		/** Hint snippet. */
		hintSnippet?: Snippet;
		/** Input event handler. */
		oninput?: (detail: { value: string }) => void;
		/** Change event handler. */
		onchange?: (detail: { value: string }) => void;
	}

	const defaultSwatches = [
		'#d0021b', '#f5a623', '#f8e71c', '#8b572a', '#7ed321', '#417505',
		'#bd10e0', '#9013fe', '#4a90e2', '#50e3c2', '#b8e986', '#000000',
		'#4a4a4a', '#9b9b9b', '#ffffff'
	];

	let {
		defaultValue = '#4a90e2',
		value = $bindable(defaultValue),
		format = 'hex',
		size = 'm',
		placement = 'bottom-start',
		disabled = false,
		open = $bindable(false),
		inline = false,
		opacity = false,
		uppercase = false,
		withoutFormatToggle = false,
		swatches = defaultSwatches,
		label = '',
		hint = '',
		name = '',
		id = undefined,
		class: className = '',
		labelSnippet,
		hintSnippet,
		oninput,
		onchange
	}: Props = $props();

	let triggerEl: HTMLElement | null = $state(null);
	let popupEl: HTMLElement | null = $state(null);
	let gridEl: HTMLElement | null = $state(null);
	let rendered = $state(false);
	const shouldRender = $derived(inline || rendered || open);
	const dismissKey = {};

	let hue = $state(210);
	let saturation = $state(68);
	let brightness = $state(89);
	let alpha = $state(100);
	let localFormat = $state<ColorFormat | null>(null);
	const activeFormat = $derived(localFormat ?? format);
	let cleanupAutoUpdate: (() => void) | null = null;
	let pressStartedInside = false;

	function clamp(val: number, min: number, max: number): number {
		return Math.min(Math.max(val, min), max);
	}

	function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
		s /= 100;
		v /= 100;
		const i = Math.floor((h / 60) % 6);
		const f = h / 60 - i;
		const p = v * (1 - s);
		const q = v * (1 - f * s);
		const t = v * (1 - (1 - f) * s);
		let r = 0, g = 0, b = 0;
		switch (i % 6) {
			case 0: r = v; g = t; b = p; break;
			case 1: r = q; g = v; b = p; break;
			case 2: r = p; g = v; b = t; break;
			case 3: r = p; g = q; b = v; break;
			case 4: r = t; g = p; b = v; break;
			case 5: r = v; g = p; b = q; break;
		}
		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}

	function rgbToHex(r: number, g: number, b: number, a: number, withAlpha: boolean): string {
		const toHex = (n: number) => n.toString(16).padStart(2, '0');
		let res = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
		if (withAlpha) {
			res += toHex(Math.round((a / 100) * 255));
		}
		return res;
	}

	function parseColor(c: string) {
		if (!c) return;
		const trimmed = c.trim().toLowerCase();
		if (trimmed.startsWith('#')) {
			const hex = trimmed.substring(1);
			let r = 0, g = 0, b = 0, a = 100;
			if (hex.length === 3 || hex.length === 4) {
				r = parseInt(hex[0] + hex[0], 16);
				g = parseInt(hex[1] + hex[1], 16);
				b = parseInt(hex[2] + hex[2], 16);
				if (hex.length === 4) a = Math.round((parseInt(hex[3] + hex[3], 16) / 255) * 100);
			} else if (hex.length === 6 || hex.length === 8) {
				r = parseInt(hex.substring(0, 2), 16);
				g = parseInt(hex.substring(2, 4), 16);
				b = parseInt(hex.substring(4, 6), 16);
				if (hex.length === 8) a = Math.round((parseInt(hex.substring(6, 8), 16) / 255) * 100);
			}
			// RGB to HSV
			r /= 255; g /= 255; b /= 255;
			const maxVal = Math.max(r, g, b);
			const minVal = Math.min(r, g, b);
			const diff = maxVal - minVal;
			let h = 0;
			if (diff !== 0) {
				if (maxVal === r) h = ((g - b) / diff) % 6;
				else if (maxVal === g) h = (b - r) / diff + 2;
				else h = (r - g) / diff + 4;
				h = Math.round(h * 60);
				if (h < 0) h += 360;
			}
			const s = maxVal === 0 ? 0 : Math.round((diff / maxVal) * 100);
			const v = Math.round(maxVal * 100);

			hue = h;
			saturation = s;
			brightness = v;
			alpha = a;
		}
	}

	// Initialize from value once
	untrack(() => parseColor(value));

	const currentRgb = $derived(hsvToRgb(hue, saturation, brightness));
	const currentHex = $derived(rgbToHex(currentRgb[0], currentRgb[1], currentRgb[2], alpha, opacity));

	const formattedColor = $derived.by(() => {
		let res = '';
		if (activeFormat === 'hex') {
			res = currentHex;
		} else if (activeFormat === 'rgb') {
			res = opacity
				? `rgba(${currentRgb[0]}, ${currentRgb[1]}, ${currentRgb[2]}, ${(alpha / 100).toFixed(2)})`
				: `rgb(${currentRgb[0]}, ${currentRgb[1]}, ${currentRgb[2]})`;
		} else if (activeFormat === 'hsl') {
			const sL = (saturation / 100) * (brightness / 100);
			const l = (brightness / 100) - sL / 2;
			const s = l === 0 || l === 1 ? 0 : (sL / (1 - Math.abs(2 * l - 1))) * 100;
			res = opacity
				? `hsla(${Math.round(hue)}, ${Math.round(s)}%, ${Math.round(l * 100)}%, ${(alpha / 100).toFixed(2)})`
				: `hsl(${Math.round(hue)}, ${Math.round(s)}%, ${Math.round(l * 100)}%)`;
		} else {
			res = opacity
				? `hsva(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(brightness)}%, ${(alpha / 100).toFixed(2)})`
				: `hsv(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(brightness)}%)`;
		}
		return uppercase ? res.toUpperCase() : res.toLowerCase();
	});

	function updateCurrentColor() {
		value = formattedColor;
		oninput?.({ value });
		onchange?.({ value });
	}

	function handleGridPointer(event: PointerEvent) {
		if (disabled) return;
		const target = event.currentTarget as HTMLElement;
		target.setPointerCapture(event.pointerId);
		const rect = target.getBoundingClientRect();
		const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
		const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
		saturation = Math.round(x * 100);
		brightness = Math.round((1 - y) * 100);
		updateCurrentColor();
	}

	function handleHuePointer(event: PointerEvent) {
		if (disabled) return;
		const target = event.currentTarget as HTMLElement;
		target.setPointerCapture(event.pointerId);
		const rect = target.getBoundingClientRect();
		const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
		hue = Math.round(x * 360);
		updateCurrentColor();
	}

	function handleAlphaPointer(event: PointerEvent) {
		if (disabled) return;
		const target = event.currentTarget as HTMLElement;
		target.setPointerCapture(event.pointerId);
		const rect = target.getBoundingClientRect();
		const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
		alpha = Math.round(x * 100);
		updateCurrentColor();
	}

	function cycleFormat() {
		const order: ColorFormat[] = ['hex', 'rgb', 'hsl', 'hsv'];
		const idx = order.indexOf(activeFormat);
		localFormat = order[(idx + 1) % order.length];
		updateCurrentColor();
	}

	function handleSelectSwatch(swatchColor: string) {
		if (disabled) return;
		parseColor(swatchColor);
		updateCurrentColor();
	}

	export function reposition() {
		if (!triggerEl || !popupEl || inline) return;
		positionFloatingElements(triggerEl, popupEl, null, {
			placement,
			distance: 4,
			boundary: 'viewport'
		});
	}

	function handleTriggerClick() {
		if (disabled || inline) return;
		open = !open;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open && isTopDismissible(dismissKey)) {
			event.preventDefault();
			event.stopPropagation();
			open = false;
			triggerEl?.focus();
		}
	}

	function handlePointerDownDoc(event: PointerEvent) {
		const path = event.composedPath();
		pressStartedInside = popupEl ? path.includes(popupEl) : false;
	}

	function handleClickOutside(event: MouseEvent) {
		if (inline) return;
		const startedInside = pressStartedInside;
		pressStartedInside = false;
		if (startedInside) return;

		const path = event.composedPath();
		if (triggerEl && path.includes(triggerEl)) return;
		if (popupEl && path.includes(popupEl)) return;

		open = false;
	}

	$effect(() => {
		if (inline) {
			rendered = true;
			return;
		}

		const isOpen = open;
		untrack(() => {
			if (typeof document === 'undefined') return;

			if (isOpen) {
				rendered = true;
				registerDismissible(dismissKey);
				document.addEventListener('keydown', handleKeyDown);
				document.addEventListener('pointerdown', handlePointerDownDoc, true);
				document.addEventListener('click', handleClickOutside);

				if (triggerEl && popupEl) {
					cleanupAutoUpdate = autoUpdatePosition(triggerEl, popupEl, reposition);
				}

				if (popupEl) {
					animateWithClass(popupEl, 'show');
				}
			} else {
				unregisterDismissible(dismissKey);
				document.removeEventListener('keydown', handleKeyDown);
				document.removeEventListener('pointerdown', handlePointerDownDoc, true);
				document.removeEventListener('click', handleClickOutside);

				if (cleanupAutoUpdate) {
					cleanupAutoUpdate();
					cleanupAutoUpdate = null;
				}

				if (popupEl && rendered) {
					animateWithClass(popupEl, 'hide').then(() => {
						rendered = false;
					});
				} else {
					rendered = false;
				}
			}
		});

		return () => {
			if (typeof document !== 'undefined') {
				document.removeEventListener('keydown', handleKeyDown);
				document.removeEventListener('pointerdown', handlePointerDownDoc, true);
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
	class="wa-form-control wa-color-picker {className}"
	{id}
	data-size={size}
	data-disabled={disabled ? '' : undefined}
	data-inline={inline ? '' : undefined}
	data-open={open ? '' : undefined}
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

	{#if !inline}
		<button
			bind:this={triggerEl}
			type="button"
			class="trigger"
			part="trigger"
			style="--trigger-color: {currentHex};"
			aria-label={label || 'Select color'}
			aria-haspopup="dialog"
			aria-expanded={open ? 'true' : 'false'}
			{disabled}
			onclick={handleTriggerClick}
		></button>
	{/if}

	{#if shouldRender}
		<div
			bind:this={popupEl}
			class={inline ? 'color-picker-panel' : 'color-picker-panel wa-color-picker-popup'}
			part="color-picker"
		>
			<!-- 2D Saturation / Value Grid -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				bind:this={gridEl}
				class="grid"
				part="grid"
				style="background-color: hsl({hue}, 100%, 50%);"
				onpointerdown={handleGridPointer}
				onpointermove={(e) => { if (e.buttons === 1) handleGridPointer(e); }}
			>
				<span
					class="grid-handle"
					part="grid-handle"
					style="left: {saturation}%; top: {100 - brightness}%; background-color: {currentHex};"
				></span>
			</div>

			<!-- Controls: sliders + preview -->
			<div class="controls">
				<div class="sliders">
					<!-- Hue slider -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="slider hue"
						part="hue-slider"
						onpointerdown={handleHuePointer}
						onpointermove={(e) => { if (e.buttons === 1) handleHuePointer(e); }}
					>
						<span
							class="slider-handle"
							part="hue-slider-handle"
							style="left: {(hue / 360) * 100}%; background-color: hsl({hue}, 100%, 50%);"
						></span>
					</div>

					<!-- Alpha / Opacity slider -->
					{#if opacity}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="slider alpha"
							part="opacity-slider"
							onpointerdown={handleAlphaPointer}
							onpointermove={(e) => { if (e.buttons === 1) handleAlphaPointer(e); }}
						>
							<div
								class="alpha-gradient"
								style="background: linear-gradient(to right, transparent, hsl({hue}, 100%, 50%));"
							></div>
							<span
								class="slider-handle"
								part="opacity-slider-handle"
								style="left: {alpha}%; background-color: {currentHex};"
							></span>
						</div>
					{/if}
				</div>

				<!-- Preview swatch circle -->
				<button
					type="button"
					class="preview transparent-bg"
					part="preview"
					aria-label="Current color: {formattedColor}"
					title="Current color: {formattedColor}"
				>
					<span class="preview-color" style="background-color: {formattedColor};"></span>
				</button>
			</div>

			<!-- Input + Format toggle -->
			<div class="user-input">
				<input
					type="text"
					part="input"
					value={formattedColor}
					readonly
					aria-label="Color value"
				/>

				{#if !withoutFormatToggle}
					<button
						type="button"
						class="format-toggle"
						part="format-button"
						onclick={cycleFormat}
					>
						{activeFormat}
					</button>
				{/if}
			</div>

			<!-- Preset swatches -->
			{#if swatches && swatches.length > 0}
				<div class="swatches" part="swatches">
					{#each swatches as s}
						{@const swatchColor = typeof s === 'string' ? s : s.color}
						{@const swatchLabel = typeof s === 'string' ? s : s.label || s.color}
						<button
							type="button"
							class="swatch"
							part="swatch"
							style="background-color: {swatchColor};"
							aria-label={swatchLabel}
							title={swatchLabel}
							onclick={() => handleSelectSwatch(swatchColor)}
						></button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	{#if hint || hintSnippet}
		<div class="form-control-hint" part="form-control-hint">
			{#if hintSnippet}
				{@render hintSnippet()}
			{:else}
				{hint}
			{/if}
		</div>
	{/if}

	<!-- Mirrored hidden input -->
	{#if name}
		<input type="hidden" {name} value={value} />
	{/if}
</div>
