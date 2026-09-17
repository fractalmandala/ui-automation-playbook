<script lang="ts" module>
	const warnedSizes = new Set<string>();
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import './number-input.css';
	import '../_shared/wa-styles/component/form-control.css';

	export type NumberInputSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'small' | 'medium' | 'large';
	export type NumberInputAppearance = 'filled' | 'outlined' | 'filled-outlined';

	interface Props {
		/**
		 * The current value of the input, submitted as a name/value pair with form data.
		 * Source type is `string | null` (the native `<input type="number">` value is always
		 * a string; `"abc"` sanitizes to `""`); an empty string means blank.
		 */
		value?: string;
		/** The default value of the form control. Primarily used for resetting the form control. */
		defaultValue?: string | null;
		/** The input's size. `small` / `medium` / `large` are deprecated aliases for `s` / `m` / `l`. */
		size?: NumberInputSize;
		/** The input's visual appearance. */
		appearance?: NumberInputAppearance;
		/** Draws a pill-style input with rounded edges. */
		pill?: boolean;
		/** The input's label. If you need to display HTML, use the `labelSnippet` snippet instead. */
		label?: string;
		/** The input's hint. If you need to display HTML, use the `hintSnippet` snippet instead. */
		hint?: string;
		/** Placeholder text to show as a hint when the input is empty. */
		placeholder?: string;
		/** Makes the input readonly. */
		readonly?: boolean;
		/** Makes the input a required field. */
		required?: boolean;
		/** Disables the input. */
		disabled?: boolean;
		/** The name of the input, submitted as a name/value pair with form data. */
		name?: string | null;
		/** Associates the input with a `<form>` elsewhere in the document by id. Forwarded to the native control. */
		form?: string;
		/** The input's title. An empty title prevents browser validation tooltips from appearing on hover. */
		title?: string;
		/** The input's minimum value. */
		min?: number;
		/** The input's maximum value. */
		max?: number;
		/**
		 * Specifies the granularity that the value must adhere to, or the special value `any`
		 * which means no stepping is implied, allowing any numeric value.
		 */
		step?: number | 'any';
		/** Hides the increment/decrement stepper buttons. The arrow keys still step. */
		withoutSteppers?: boolean;
		/**
		 * Specifies what permission the browser has to provide assistance in filling out form field values. Refer to
		 * [this page on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) for available values.
		 */
		autocomplete?: HTMLInputAttributes['autocomplete'];
		/** Indicates that the input should receive focus on page load. */
		autofocus?: boolean;
		/** Used to customize the label or icon of the Enter key on virtual keyboards. */
		enterkeyhint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
		/**
		 * Tells the browser what type of data will be entered by the user, allowing it to display the appropriate virtual
		 * keyboard on supportive devices.
		 */
		inputmode?: 'numeric' | 'decimal';
		/** Convenience API for `setCustomValidity()`. Applied to the native control in an `$effect`. */
		customError?: string | null;
		/** The input's label as markup. Renders in place of the `label` slot; falls back to the `label` string. */
		labelSnippet?: Snippet;
		/** Hint text as markup. Renders in place of the `hint` slot; falls back to the `hint` string. */
		hintSnippet?: Snippet;
		/** An element placed at the start of the input control. Renders in place of the `start` slot. */
		start?: Snippet;
		/** An element placed at the end of the input control (before the increment stepper). Renders in place of the `end` slot. */
		end?: Snippet;
		/** An icon to use in lieu of the default increment icon. Renders in place of the `increment-icon` slot. */
		incrementIcon?: Snippet;
		/** An icon to use in lieu of the default decrement icon. Renders in place of the `decrement-icon` slot. */
		decrementIcon?: Snippet;
		/** Emitted when the control loses focus. */
		onblur?: (event: FocusEvent) => void;
		/** Emitted when an alteration to the control's value is committed by the user. */
		onchange?: (event: Event) => void;
		/** Emitted when the control gains focus. */
		onfocus?: (event: FocusEvent) => void;
		/** Emitted when the control receives input. */
		oninput?: (event: Event) => void;
		/**
		 * Emitted before the value changes (typing and stepper buttons). Return `false` to
		 * cancel — the stepper port checks the return value the way WA checked
		 * `defaultPrevented`, and native typing calls `preventDefault()` for you.
		 */
		onbeforeinput?: (event: InputEvent) => boolean | void;
		/** Emitted when the form control has been checked for validity and its constraints aren't satisfied. */
		oninvalid?: () => void;
	}

	let {
		value = $bindable(''),
		defaultValue = null,
		size = 'm',
		appearance = 'outlined',
		pill = false,
		label = '',
		hint = '',
		placeholder = '',
		readonly = false,
		required = false,
		disabled = false,
		name = null,
		form,
		title = '',
		min,
		max,
		step = 1,
		withoutSteppers = false,
		autocomplete,
		autofocus = false,
		enterkeyhint,
		inputmode = 'numeric',
		customError = null,
		labelSnippet,
		hintSnippet,
		start,
		end,
		incrementIcon,
		decrementIcon,
		onblur,
		onchange,
		onfocus,
		oninput,
		onbeforeinput,
		oninvalid
	}: Props = $props();

	const uid = $props.id();
	const inputId = `${uid}-input`;
	const hintId = `${uid}-hint`;

	// The native element IS the control (per form-association.md): it carries
	// name/value/validation directly, so no mirrored hidden input is needed. WA
	// only wrapped it in ElementInternals because shadow DOM hid it from the form.
	let inputEl = $state<HTMLInputElement>();

	// WA's `defaultValue` reflects the `value` attribute, so `<NumberInput value="1">`
	// resets back to it. Capture the initial value as the reset baseline when no
	// explicit defaultValue is given.
	const initialValue = value;

	// Port of HasSlotController.test('label') / .test('hint'): the snippet being
	// present is the whole answer — no slot introspection needed. (WA's `withLabel`
	// / `withHint` props are SSR-only scaffolding and are deleted per the pipeline.)
	const hasLabel = $derived(label !== '' || !!labelSnippet);
	const hasHint = $derived(hint !== '' || !!hintSnippet);

	// Port of WA's `isAtMin` / `isAtMax` getters verbatim: the stepper buttons
	// disable at the bounds. `min`/`max` are `undefined` when unset.
	const isAtMin = $derived.by(() => {
		if (min === undefined) return false;
		const numValue = parseFloat(value || '');
		return !isNaN(numValue) && numValue <= min;
	});
	const isAtMax = $derived.by(() => {
		if (max === undefined) return false;
		const numValue = parseFloat(value || '');
		return !isNaN(numValue) && numValue >= max;
	});

	// Port of WA's `@watch('size')` + `warnDeprecatedSize` (see Callout.svelte for
	// the same pattern): a genuine side effect, so `$effect` is correct here.
	$effect(() => {
		if (
			(size === 'small' || size === 'medium' || size === 'large') &&
			!warnedSizes.has(size)
		) {
			warnedSizes.add(size);
			const canonical = size === 'small' ? 's' : size === 'medium' ? 'm' : 'l';
			console.warn(
				`[wa-number-input] size="${size}" is deprecated. Use size="${canonical}" instead. The long-form value will be removed in the next major version.`
			);
		}
	});

	// setCustomValidity is imperative, so it is a genuine side effect. The native
	// control is the validation target (WA's MirrorValidator logic), so validity,
	// messages, and popups all come from it directly.
	$effect(() => {
		inputEl?.setCustomValidity(customError ?? '');
	});

	// Port of WA's `updated()` sanitization: the browser coerces invalid numeric
	// input to an empty string, so mirror that back so `value` stays consistent
	// with the native control (e.g. `"abc"` resolves to `""`).
	$effect(() => {
		const el = inputEl;
		if (!el) return;
		const currentValue = value;
		if (currentValue && el.value !== currentValue) {
			value = el.value;
		}
	});

	// Port of WA's `@watch('step', { waitUntilFirstUpdate: true }) handleStepChange`:
	// when step changes the value may become invalid, so re-assert it imperatively
	// instead of waiting for the next render. (Svelte's `step={step}` binding covers
	// the attribute itself; native validity re-evaluates automatically.)
	$effect(() => {
		if (inputEl && step !== undefined) {
			inputEl.step = String(step);
		}
	});

	// Native reset restores the input's *default value* (its `value` content
	// attribute, which Svelte never sets), so re-assert component state on the
	// next microtask — after the browser has finished resetting.
	$effect(() => {
		void form;
		const formEl = inputEl?.form;
		if (!formEl) return;
		const onReset = () => {
			queueMicrotask(() => {
				value = defaultValue ?? initialValue ?? '';
			});
		};
		formEl.addEventListener('reset', onReset);
		return () => formEl.removeEventListener('reset', onReset);
	});

	function handleInput(event: Event) {
		value = (event.target as HTMLInputElement).value;
		oninput?.(event);
	}

	function handleChange(event: Event) {
		value = (event.target as HTMLInputElement).value;
		onchange?.(event);
	}

	function handleBeforeInput(event: InputEvent) {
		// Cancelable seam: returning `false` vetoes the edit. `undefined` must not
		// cancel, or every consumer that forgets a return value breaks typing.
		if (onbeforeinput?.(event) === false) {
			event.preventDefault();
		}
	}

	// Port of internal/submit-on-enter.ts + number-input's ArrowUp/Down sync:
	// pressing Enter submits the form like a native input; arrow keys step natively
	// and the rAF syncs `value` afterwards.
	function handleKeyDown(event: KeyboardEvent) {
		const hasModifier = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

		// Pressing enter when focused on an input should submit the form like a native
		// input, but we wait a tick before submitting to allow users to cancel the
		// keydown event if they need to.
		if (event.key === 'Enter' && !hasModifier) {
			const key = event;
			setTimeout(() => {
				// When using an Input Method Editor (IME), pressing enter would submit
				// unexpectedly — isComposing is true while the IME is open.
				if (key.defaultPrevented || key.isComposing) return;

				const formEl = inputEl?.form;
				if (!formEl) return;

				const elements = [...formEl.elements] as HTMLElement[];

				// If we're the only form element, we submit like a native input.
				if (elements.length === 1) {
					formEl.requestSubmit();
					return;
				}

				const button = elements.find(
					(el) => (el as HTMLButtonElement).type === 'submit' && !el.matches(':disabled')
				);

				// No button found, don't submit.
				if (!button) return;

				if (button.tagName === 'INPUT' || button.tagName === 'BUTTON') {
					formEl.requestSubmit(button as HTMLButtonElement);
				} else {
					button.click();
				}
			});
		}

		// Sync value after arrow key changes (verbatim from number-input.ts).
		if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
			requestAnimationFrame(() => {
				if (inputEl && value !== inputEl.value) {
					value = inputEl.value;
				}
			});
		}
	}

	function handleStepperPointerDown(event: PointerEvent) {
		// Avoid focusing the input on touch to prevent the virtual keyboard from showing
		if (event.pointerType === 'touch') return;

		event.preventDefault();
		inputEl?.focus();
	}

	function handleStepperPointerUp(direction: 'up' | 'down', event: PointerEvent) {
		if (disabled || readonly) return;

		// Verbatim port of number-input.ts: `beforeinput` is cancelable — WA checked
		// `defaultPrevented`, Svelte checks the callback return (`false` vetoes).
		const beforeInputEvent = new InputEvent('beforeinput', {
			bubbles: true,
			cancelable: true,
			composed: true
		});
		if (onbeforeinput?.(beforeInputEvent) === false) return;

		if (direction === 'up') {
			inputEl?.stepUp();
		} else {
			inputEl?.stepDown();
		}

		if (inputEl && value !== inputEl.value) {
			value = inputEl.value;
		}

		oninput?.(new InputEvent('input', { bubbles: true, composed: true }));
		onchange?.(new Event('change', { bubbles: true }));

		// Avoid focusing the input on touch to prevent the virtual keyboard from showing
		if (event.pointerType !== 'touch') {
			inputEl?.focus();
		}
	}

	/** Sets focus on the input. */
	export function focus(options?: FocusOptions) {
		inputEl?.focus(options);
	}

	/** Removes focus from the input. */
	export function blur() {
		inputEl?.blur();
	}

	/** Selects all the text in the input. */
	export function select() {
		inputEl?.select();
	}

	/** Increments the value by the step amount. */
	export function stepUp() {
		inputEl?.stepUp();
		if (inputEl && value !== inputEl.value) {
			value = inputEl.value;
		}
	}

	/** Decrements the value by the step amount. */
	export function stepDown() {
		inputEl?.stepDown();
		if (inputEl && value !== inputEl.value) {
			value = inputEl.value;
		}
	}

	/** Returns the associated `<form>` element, if any. */
	export function getForm() {
		return inputEl?.form ?? null;
	}

	/** Checks validity against the native control and reports it. */
	export function checkValidity() {
		return inputEl?.checkValidity() ?? true;
	}

	/** Checks validity, sets native interactive state, and shows the browser popup on failure. */
	export function reportValidity() {
		return inputEl?.reportValidity() ?? true;
	}

	/** Sets a custom validation message on the native control. */
	export function setCustomValidity(message: string) {
		inputEl?.setCustomValidity(message);
	}

	/** The native control's validity state. */
	export function validity() {
		return inputEl?.validity;
	}

	/** The native control's validation message. */
	export function validationMessage() {
		return inputEl?.validationMessage ?? '';
	}
</script>

<div
	class="wa-number-input"
	data-size={size}
	data-appearance={appearance}
	data-pill={pill ? '' : undefined}
	data-required={required ? '' : undefined}
	data-disabled={disabled ? '' : undefined}
	data-readonly={readonly ? '' : undefined}
	data-without-steppers={withoutSteppers ? '' : undefined}
>
	<label
		part="form-control-label label"
		class="label"
		class:has-label={hasLabel}
		for={inputId}
		aria-hidden={!hasLabel}
	>
		{#if labelSnippet}{@render labelSnippet()}{:else}{label}{/if}
	</label>

	<div part="base number-input" class="number-field">
		{#if !withoutSteppers}
			<button
				part="stepper stepper-decrement"
				class="stepper stepper-decrement"
				type="button"
				tabindex="-1"
				aria-label="Decrement"
				disabled={disabled || readonly || isAtMin}
				onpointerdown={handleStepperPointerDown}
				onpointerup={(event) => handleStepperPointerUp('down', event)}
			>
				{#if decrementIcon}
					{@render decrementIcon()}
				{:else}
					<!-- Default decrement glyph (WA renders wa-icon "minus" here); overridable via the decrementIcon snippet. -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						width="1em"
						height="1em"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M5 12h14" />
					</svg>
				{/if}
			</button>
		{/if}

		{#if start}
			<span part="start" class="start">{@render start()}</span>
		{/if}

		<!-- svelte-ignore a11y_autofocus: WA exposes an `autofocus` prop that forwards to the native control — kept verbatim for fidelity. -->
		<input
			bind:this={inputEl}
			bind:value
			part="input"
			id={inputId}
			class="control"
			type="number"
			inputmode={inputmode}
			title={title}
			name={name ?? undefined}
			{form}
			disabled={disabled}
			readonly={readonly}
			required={required}
			placeholder={placeholder}
			min={min}
			max={max}
			step={step}
			autocomplete={autocomplete}
			autofocus={autofocus}
			enterkeyhint={enterkeyhint}
			aria-describedby={hintId}
			onblur={(event) => onblur?.(event)}
			onchange={handleChange}
			onfocus={(event) => onfocus?.(event)}
			oninput={handleInput}
			onbeforeinput={handleBeforeInput}
			oninvalid={() => oninvalid?.()}
			onkeydown={handleKeyDown}
		/>

		{#if end}
			<span part="end" class="end">{@render end()}</span>
		{/if}

		{#if !withoutSteppers}
			<button
				part="stepper stepper-increment"
				class="stepper stepper-increment"
				type="button"
				tabindex="-1"
				aria-label="Increment"
				disabled={disabled || readonly || isAtMax}
				onpointerdown={handleStepperPointerDown}
				onpointerup={(event) => handleStepperPointerUp('up', event)}
			>
				{#if incrementIcon}
					{@render incrementIcon()}
				{:else}
					<!-- Default increment glyph (WA renders wa-icon "plus" here); overridable via the incrementIcon snippet. -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						width="1em"
						height="1em"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M12 5v14M5 12h14" />
					</svg>
				{/if}
			</button>
		{/if}
	</div>

	<div id={hintId} part="hint" class:has-slotted={hasHint} aria-hidden={!hasHint}>
		{#if hintSnippet}{@render hintSnippet()}{:else}{hint}{/if}
	</div>
</div>
