<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import './slider.css';
	import '../_shared/wa-styles/component/form-control.css';

	export type SliderSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'small' | 'medium' | 'large';
	export type SliderOrientation = 'horizontal' | 'vertical';

	interface Props {
		/** Current slider value in single-thumb mode. */
		value?: number;
		/** Default value. */
		defaultValue?: number;
		/** Range slider mode with two thumbs. */
		range?: boolean;
		/** Minimum value of range selection. */
		minValue?: number;
		/** Maximum value of range selection. */
		maxValue?: number;
		/** Minimum allowed value. */
		min?: number;
		/** Maximum allowed value. */
		max?: number;
		/** Granularity step. */
		step?: number;
		/** Disables the slider. */
		disabled?: boolean;
		/** Read-only state. */
		readonly?: boolean;
		/** Slider orientation. */
		orientation?: SliderOrientation;
		/** Slider size. */
		size?: SliderSize;
		/** Starting value for indicator fill. */
		indicatorOffset?: number;
		/** Draws markers at each step. */
		withMarkers?: boolean;
		/** Draws a tooltip above active thumb. */
		withTooltip?: boolean;
		/** Placement of tooltip. */
		tooltipPlacement?: 'top' | 'right' | 'bottom' | 'left';
		/** Form control label. */
		label?: string;
		/** Helper hint text. */
		hint?: string;
		/** Name for form submission. */
		name?: string;
		/** Optional ID. */
		id?: string;
		/** Additional CSS classes. */
		class?: string;
		/** Custom value formatter for tooltip and ARIA. */
		valueFormatter?: (val: number) => string;
		/** Label snippet. */
		labelSnippet?: Snippet;
		/** Hint snippet. */
		hintSnippet?: Snippet;
		/** Reference labels snippet (shown beneath track). */
		reference?: Snippet;
		/** Input event handler. */
		oninput?: (detail: { value: number | [number, number] }) => void;
		/** Change event handler. */
		onchange?: (detail: { value: number | [number, number] }) => void;
		/** Focus event handler. */
		onfocus?: (event: FocusEvent) => void;
		/** Blur event handler. */
		onblur?: (event: FocusEvent) => void;
	}

	let {
		defaultValue = 0,
		value = $bindable(defaultValue),
		range = false,
		minValue = $bindable(0),
		maxValue = $bindable(50),
		min = 0,
		max = 100,
		step = 1,
		disabled = false,
		readonly = false,
		orientation = 'horizontal',
		size = 'm',
		indicatorOffset = undefined,
		withMarkers = false,
		withTooltip = false,
		tooltipPlacement = 'top',
		label = '',
		hint = '',
		name = '',
		id = undefined,
		class: className = '',
		valueFormatter,
		labelSnippet,
		hintSnippet,
		reference,
		oninput,
		onchange,
		onfocus,
		onblur
	}: Props = $props();

	let trackEl: HTMLElement | null = $state(null);
	let isDragging = $state(false);
	let activeThumb = $state<'single' | 'min' | 'max' | null>(null);
	let isHoveringThumb = $state(false);

	function clamp(val: number, minVal: number, maxVal: number): number {
		return Math.min(Math.max(val, minVal), maxVal);
	}

	function getPercentage(val: number): number {
		if (max === min) return 0;
		return clamp(((val - min) / (max - min)) * 100, 0, 100);
	}

	function getValueFromCoord(clientX: number, clientY: number): number {
		if (!trackEl) return min;
		const rect = trackEl.getBoundingClientRect();
		let pct = 0;
		if (orientation === 'vertical') {
			const bottom = rect.bottom;
			const height = rect.height;
			pct = (bottom - clientY) / height;
		} else {
			const left = rect.left;
			const width = rect.width;
			pct = (clientX - left) / width;
		}
		pct = clamp(pct, 0, 1);
		const rawVal = min + pct * (max - min);
		const steppedVal = Math.round((rawVal - min) / step) * step + min;
		return clamp(steppedVal, min, max);
	}

	function format(val: number): string {
		if (valueFormatter) return valueFormatter(val);
		return String(val);
	}

	const singlePercentage = $derived(getPercentage(value));
	const minPercentage = $derived(getPercentage(minValue));
	const maxPercentage = $derived(getPercentage(maxValue));
	const offsetPercentage = $derived(indicatorOffset !== undefined ? getPercentage(indicatorOffset) : 0);

	const markerPositions = $derived.by(() => {
		if (!withMarkers || step <= 0) return [];
		const count = Math.floor((max - min) / step);
		if (count <= 1 || count > 50) return [];
		const list: number[] = [];
		for (let i = 0; i <= count; i++) {
			list.push(getPercentage(min + i * step));
		}
		return list;
	});

	function handlePointerDown(event: PointerEvent, thumbType?: 'single' | 'min' | 'max') {
		if (disabled || readonly) return;
		event.preventDefault();
		const target = event.currentTarget as HTMLElement;
		target.setPointerCapture(event.pointerId);

		isDragging = true;
		const clickVal = getValueFromCoord(event.clientX, event.clientY);

		if (range) {
			if (thumbType) {
				activeThumb = thumbType;
			} else {
				const distMin = Math.abs(clickVal - minValue);
				const distMax = Math.abs(clickVal - maxValue);
				activeThumb = distMin <= distMax ? 'min' : 'max';
			}

			if (activeThumb === 'min') {
				minValue = Math.min(clickVal, maxValue);
			} else {
				maxValue = Math.max(clickVal, minValue);
			}
			oninput?.({ value: [minValue, maxValue] });
		} else {
			activeThumb = 'single';
			value = clickVal;
			oninput?.({ value });
		}
	}

	function handlePointerMove(event: PointerEvent) {
		if (!isDragging || disabled || readonly) return;
		const currentVal = getValueFromCoord(event.clientX, event.clientY);

		if (range) {
			if (activeThumb === 'min') {
				minValue = Math.min(currentVal, maxValue);
			} else if (activeThumb === 'max') {
				maxValue = Math.max(currentVal, minValue);
			}
			oninput?.({ value: [minValue, maxValue] });
		} else {
			value = currentVal;
			oninput?.({ value });
		}
	}

	function handlePointerUp(event: PointerEvent) {
		if (!isDragging) return;
		isDragging = false;
		activeThumb = null;

		if (range) {
			onchange?.({ value: [minValue, maxValue] });
		} else {
			onchange?.({ value });
		}
	}

	function handleKeyDown(event: KeyboardEvent, thumbType: 'single' | 'min' | 'max') {
		if (disabled || readonly) return;

		let delta = 0;
		if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
			delta = step;
		} else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
			delta = -step;
		} else if (event.key === 'PageUp') {
			delta = step * 10;
		} else if (event.key === 'PageDown') {
			delta = -step * 10;
		} else if (event.key === 'Home') {
			delta = min - (thumbType === 'max' ? maxValue : thumbType === 'min' ? minValue : value);
		} else if (event.key === 'End') {
			delta = max - (thumbType === 'max' ? maxValue : thumbType === 'min' ? minValue : value);
		} else {
			return;
		}

		event.preventDefault();

		if (range) {
			if (thumbType === 'min') {
				minValue = clamp(minValue + delta, min, maxValue);
			} else {
				maxValue = clamp(maxValue + delta, minValue, max);
			}
			oninput?.({ value: [minValue, maxValue] });
			onchange?.({ value: [minValue, maxValue] });
		} else {
			value = clamp(value + delta, min, max);
			oninput?.({ value });
			onchange?.({ value });
		}
	}
</script>

<div
	class="wa-form-control wa-slider {className}"
	{id}
	data-orientation={orientation}
	data-size={size}
	data-range={range ? '' : undefined}
	data-disabled={disabled ? '' : undefined}
	data-readonly={readonly ? '' : undefined}
	part="form-control"
>
	{#if label || labelSnippet}
		<label class="wa-slider-label form-control-label" part="label form-control-label" for={id}>
			{#if labelSnippet}
				{@render labelSnippet()}
			{:else}
				{label}
			{/if}
		</label>
	{/if}

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="wa-slider-control"
		part="slider"
		class:disabled
		onpointerdown={(e) => handlePointerDown(e)}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerUp}
	>
		<!-- Track -->
		<div bind:this={trackEl} class="track" part="track">
			<!-- Indicator -->
			{#if range}
				<div
					class="indicator"
					part="indicator"
					style="--start: {Math.min(minPercentage, maxPercentage)}%; --end: {Math.max(minPercentage, maxPercentage)}%;"
				></div>
			{:else}
				<div
					class="indicator"
					part="indicator"
					style="--start: {offsetPercentage}%; --end: {singlePercentage}%;"
				></div>
			{/if}

			<!-- Markers -->
			{#if withMarkers && markerPositions.length > 0}
				<div class="markers" part="markers">
					{#each markerPositions as mPos}
						<span class="marker" part="marker" style="--position: {mPos}%;"></span>
					{/each}
				</div>
			{/if}

			<!-- Thumbs -->
			{#if range}
				<!-- Min Thumb -->
				<span
					class="thumb-min"
					part="thumb thumb-min"
					style="--position: {minPercentage}%;"
					role="slider"
					tabindex={disabled ? -1 : 0}
					aria-valuemin={min}
					aria-valuemax={max}
					aria-valuenow={minValue}
					aria-valuetext={format(minValue)}
					aria-label={label ? `${label} (minimum value)` : 'Minimum value'}
					aria-orientation={orientation}
					aria-disabled={disabled ? 'true' : 'false'}
					aria-readonly={readonly ? 'true' : 'false'}
					onpointerdown={(e) => { e.stopPropagation(); handlePointerDown(e, 'min'); }}
					onkeydown={(e) => handleKeyDown(e, 'min')}
					onfocus={onfocus}
					onblur={onblur}
					onmouseenter={() => (isHoveringThumb = true)}
					onmouseleave={() => (isHoveringThumb = false)}
				>
					{#if withTooltip && (isHoveringThumb || activeThumb === 'min')}
						<div class="wa-slider-tooltip">{format(minValue)}</div>
					{/if}
				</span>

				<!-- Max Thumb -->
				<span
					class="thumb-max"
					part="thumb thumb-max"
					style="--position: {maxPercentage}%;"
					role="slider"
					tabindex={disabled ? -1 : 0}
					aria-valuemin={min}
					aria-valuemax={max}
					aria-valuenow={maxValue}
					aria-valuetext={format(maxValue)}
					aria-label={label ? `${label} (maximum value)` : 'Maximum value'}
					aria-orientation={orientation}
					aria-disabled={disabled ? 'true' : 'false'}
					aria-readonly={readonly ? 'true' : 'false'}
					onpointerdown={(e) => { e.stopPropagation(); handlePointerDown(e, 'max'); }}
					onkeydown={(e) => handleKeyDown(e, 'max')}
					onfocus={onfocus}
					onblur={onblur}
					onmouseenter={() => (isHoveringThumb = true)}
					onmouseleave={() => (isHoveringThumb = false)}
				>
					{#if withTooltip && (isHoveringThumb || activeThumb === 'max')}
						<div class="wa-slider-tooltip">{format(maxValue)}</div>
					{/if}
				</span>
			{:else}
				<!-- Single Thumb -->
				<span
					class="thumb"
					part="thumb"
					style="--position: {singlePercentage}%;"
					role="slider"
					tabindex={disabled ? -1 : 0}
					aria-valuemin={min}
					aria-valuemax={max}
					aria-valuenow={value}
					aria-valuetext={format(value)}
					aria-label={label || 'Slider'}
					aria-orientation={orientation}
					aria-disabled={disabled ? 'true' : 'false'}
					aria-readonly={readonly ? 'true' : 'false'}
					onpointerdown={(e) => { e.stopPropagation(); handlePointerDown(e, 'single'); }}
					onkeydown={(e) => handleKeyDown(e, 'single')}
					onfocus={onfocus}
					onblur={onblur}
					onmouseenter={() => (isHoveringThumb = true)}
					onmouseleave={() => (isHoveringThumb = false)}
				>
					{#if withTooltip && (isHoveringThumb || activeThumb === 'single')}
						<div class="wa-slider-tooltip">{format(value)}</div>
					{/if}
				</span>
			{/if}
		</div>

		<!-- References / labels under track -->
		{#if reference}
			<div class="references" part="references">
				{@render reference()}
			</div>
		{/if}
	</div>

	{#if hint || hintSnippet}
		<div class="wa-slider-hint form-control-hint" part="hint form-control-hint">
			{#if hintSnippet}
				{@render hintSnippet()}
			{:else}
				{hint}
			{/if}
		</div>
	{/if}

	<!-- Form inputs -->
	{#if name}
		{#if range}
			<input type="hidden" name="{name}-min" value={minValue} />
			<input type="hidden" name="{name}-max" value={maxValue} />
		{:else}
			<input type="hidden" {name} value={value} />
		{/if}
	{/if}
</div>
