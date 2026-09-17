<script lang="ts" module>
	const warnedSizes = new Set<string>();
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import './input.css';
	import '../_shared/wa-styles/component/form-control.css';

	export type InputType =
		| 'date'
		| 'datetime-local'
		| 'email'
		| 'number'
		| 'password'
		| 'search'
		| 'tel'
		| 'text'
		| 'time'
		| 'url';
	export type InputSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'small' | 'medium' | 'large';
	export type InputAppearance = 'filled' | 'outlined' | 'filled-outlined';

	interface Props {
		/** The current value of the input, submitted as a name/value pair with form data. */
		value?: string;
		/** The default value of the form control. Primarily used for resetting the form control. */
		defaultValue?: string | null;
		/** The type of input. Works the same as a native `<input>` element, but only a subset of types are supported. Defaults to `text`. */
		type?: InputType;
		/** The input's size. `small` / `medium` / `large` are deprecated aliases for `s` / `m` / `l`. */
		size?: InputSize;
		/** The input's visual appearance. */
		appearance?: InputAppearance;
		/** Draws a pill-style input with rounded edges. */
		pill?: boolean;
		/** The input's label. If you need to display HTML, use the `labelSnippet` snippet instead. */
		label?: string;
		/** The input's hint. If you need to display HTML, use the `hintSnippet` snippet instead. */
		hint?: string;
		/** Adds a clear button when the input is not empty. */
		withClear?: boolean;
		/** Placeholder text to show as a hint when the input is empty. */
		placeholder?: string;
		/** Makes the input readonly. */
		readonly?: boolean;
		/** Adds a button to toggle the password's visibility. Only applies to password types. */
		passwordToggle?: boolean;
		/** Determines whether or not the password is currently visible. Only applies to password input types. */
		passwordVisible?: boolean;
		/** Hides the browser's built-in increment/decrement spin buttons for number inputs. */
		withoutSpinButtons?: boolean;
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
		/** A regular expression pattern to validate input against. */
		pattern?: string;
		/** The minimum length of input that will be considered valid. */
		minlength?: number;
		/** The maximum length of input that will be considered valid. */
		maxlength?: number;
		/** The input's minimum value. Only applies to date and number input types. */
		min?: number | string;
		/** The input's maximum value. Only applies to date and number input types. */
		max?: number | string;
		/** The granularity the value must adhere to, or `any`. Only applies to date and number input types. */
		step?: number | 'any';
		/** Controls whether and how text input is automatically capitalized as it is entered by the user. */
		autocapitalize?: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';
		/** Indicates whether the browser's autocorrect feature is on or off. */
		autocorrect?: boolean;
		/** Specifies what permission the browser has to provide assistance in filling out form field values. */
		autocomplete?: HTMLInputAttributes['autocomplete'];
		/** Indicates that the input should receive focus on page load. */
		autofocus?: boolean;
		/** Used to customize the label or icon of the Enter key on virtual keyboards. */
		enterkeyhint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
		/** Enables spell checking on the input. */
		spellcheck?: boolean;
		/** Tells the browser what type of data will be entered by the user, allowing it to display the appropriate virtual keyboard on supportive devices. */
		inputmode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
		/** Convenience API for `setCustomValidity()`. Applied to the native control in an `$effect`. */
		customError?: string | null;
		/** The input's label as markup. Renders in place of the `label` slot; falls back to the `label` string. */
		labelSnippet?: Snippet;
		/** Hint text as markup. Renders in place of the `hint` slot; falls back to the `hint` string. */
		hintSnippet?: Snippet;
		/** An element placed at the start of the input control. Renders in place of the `start` slot. */
		start?: Snippet;
		/** An element placed at the end of the input control. Renders in place of the `end` slot. */
		end?: Snippet;
		/** An icon to use in lieu of the default clear icon. Renders in place of the `clear-icon` slot. */
		clearIcon?: Snippet;
		/** An icon to use in lieu of the default show password icon. Renders in place of the `show-password-icon` slot. */
		showPasswordIcon?: Snippet;
		/** An icon to use in lieu of the default hide password icon. Renders in place of the `hide-password-icon` slot. */
		hidePasswordIcon?: Snippet;
		/** Emitted when the control loses focus. None of WA's input events are cancelable, so the return value is ignored. */
		onblur?: (event: FocusEvent) => void;
		/** Emitted when an alteration to the control's value is committed by the user. */
		onchange?: (event: Event) => void;
		/** Emitted when the control gains focus. */
		onfocus?: (event: FocusEvent) => void;
		/** Emitted when the control receives input. */
		oninput?: (event: Event) => void;
		/** Emitted when the clear button is activated. */
		onclear?: () => void;
		/** Emitted when the form control has been checked for validity and its constraints aren't satisfied. */
		oninvalid?: () => void;
	}

	let {
		value = $bindable(''),
		defaultValue = null,
		type = 'text',
		size = 'm',
		appearance = 'outlined',
		pill = false,
		label = '',
		hint = '',
		withClear = false,
		placeholder = '',
		readonly = false,
		passwordToggle = false,
		passwordVisible = $bindable(false),
		withoutSpinButtons = false,
		required = false,
		disabled = false,
		name = null,
		form,
		title = '',
		pattern,
		minlength,
		maxlength,
		min,
		max,
		step,
		autocapitalize,
		autocorrect,
		autocomplete,
		autofocus = false,
		enterkeyhint,
		spellcheck = true,
		inputmode,
		customError = null,
		labelSnippet,
		hintSnippet,
		start,
		end,
		clearIcon,
		showPasswordIcon,
		hidePasswordIcon,
		onblur,
		onchange,
		onfocus,
		oninput,
		onclear,
		oninvalid
	}: Props = $props();

	const uid = $props.id();
	const inputId = `${uid}-input`;
	const hintId = `${uid}-hint`;

	// The native element IS the control (per form-association.md): it carries
	// name/value/validation directly, so no mirrored hidden input is needed. WA
	// only wrapped it in ElementInternals because shadow DOM hid it from the form.
	let inputEl = $state<HTMLInputElement>();

	// WA's `defaultValue` reflects the `value` attribute, so `<Input value="WA-2049">`
	// resets back to it. Capture the initial value as the reset baseline when no
	// explicit defaultValue is given.
	const initialValue = value;

	const effectiveType = $derived(type === 'password' && passwordVisible ? 'text' : type);
	// Port of HasSlotController.test('label') / .test('hint'): the snippet being
	// present is the whole answer — no slot introspection needed. (WA's `withLabel`
	// / `withHint` props are SSR-only scaffolding and are deleted per the pipeline.)
	const hasLabel = $derived(label !== '' || !!labelSnippet);
	const hasHint = $derived(hint !== '' || !!hintSnippet);
	const showClear = $derived(withClear && !disabled && !readonly && (value ?? '').length > 0);
	const showPasswordToggle = $derived(passwordToggle && !disabled);

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
				`[wa-input] size="${size}" is deprecated. Use size="${canonical}" instead. The long-form value will be removed in the next major version.`
			);
		}
	});

	// setCustomValidity is imperative, so it is a genuine side effect. The native
	// control is the validation target (WA's MirrorValidator logic), so validity,
	// messages, and popups all come from it directly.
	$effect(() => {
		inputEl?.setCustomValidity(customError ?? '');
	});

	// Port of WA's `updated()` sanitization: for types where the browser coerces
	// invalid input to an empty string, mirror that back so `value` stays
	// consistent with the native control (e.g. `"abc"` on `type="number"`).
	$effect(() => {
		const el = inputEl;
		if (!el) return;
		const currentValue = value;
		const currentType = type;
		if (
			['number', 'date', 'time', 'datetime-local'].includes(currentType) &&
			currentValue &&
			el.value !== currentValue
		) {
			value = el.value;
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

	function handleClearClick(event: MouseEvent) {
		event.preventDefault();

		if (value !== '') {
			value = '';

			// WA dispatches wa-clear, then synthetic input + change so listeners
			// observe the cleared value like a user edit.
			onclear?.();
			oninput?.(new InputEvent('input', { bubbles: true, composed: true }));
			onchange?.(new Event('change', { bubbles: true }));
		}

		inputEl?.focus();
	}

	function handlePasswordToggle() {
		passwordVisible = !passwordVisible;
	}

	// Port of internal/submit-on-enter.ts: pressing Enter submits the form like a
	// native input. `requestSubmit(button)` handles native buttons; anything else
	// (e.g. a custom button component) gets a manual click.
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

	/** Sets the start and end positions of the text selection (0-based). */
	export function setSelectionRange(
		selectionStart: number,
		selectionEnd: number,
		selectionDirection: 'forward' | 'backward' | 'none' = 'none'
	) {
		inputEl?.setSelectionRange(selectionStart, selectionEnd, selectionDirection);
	}

	/** Replaces a range of text with a new string. */
	export function setRangeText(
		replacement: string,
		start?: number,
		end?: number,
		selectMode: 'select' | 'start' | 'end' | 'preserve' = 'preserve'
	) {
		if (!inputEl) return;
		const selectionStart = start ?? inputEl.selectionStart ?? 0;
		const selectionEnd = end ?? inputEl.selectionEnd ?? 0;

		inputEl.setRangeText(replacement, selectionStart, selectionEnd, selectMode);

		if (value !== inputEl.value) {
			value = inputEl.value;
		}
	}

	/** Displays the browser picker for an input element (only works if the browser supports it for the input type). */
	export function showPicker() {
		inputEl?.showPicker();
	}

	/** Increments the value of a numeric input type by the value of the step attribute. */
	export function stepUp() {
		inputEl?.stepUp();
		if (inputEl && value !== inputEl.value) {
			value = inputEl.value;
		}
	}

	/** Decrements the value of a numeric input type by the value of the step attribute. */
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

	/** Checks validity, sets `hasInteracted`-equivalent native state, and shows the browser popup on failure. */
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
	class="wa-input"
	data-size={size}
	data-appearance={appearance}
	data-pill={pill ? '' : undefined}
	data-required={required ? '' : undefined}
	data-disabled={disabled ? '' : undefined}
	data-readonly={readonly ? '' : undefined}
	data-without-spin-buttons={withoutSpinButtons ? '' : undefined}
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

	<div part="base input-wrapper" class="text-field">
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
			type={effectiveType}
			title={title}
			name={name ?? undefined}
			{form}
			disabled={disabled}
			readonly={readonly}
			required={required}
			placeholder={placeholder}
			minlength={minlength}
			maxlength={maxlength}
			min={min}
			max={max}
			step={step}
			autocapitalize={autocapitalize}
			autocomplete={autocomplete}
			autocorrect={autocorrect ? 'on' : 'off'}
			autofocus={autofocus}
			spellcheck={spellcheck ? 'true' : 'false'}
			pattern={pattern}
			enterkeyhint={enterkeyhint}
			inputmode={inputmode}
			aria-describedby={hintId}
			onblur={(event) => onblur?.(event)}
			onchange={handleChange}
			onfocus={(event) => onfocus?.(event)}
			oninput={handleInput}
			oninvalid={() => oninvalid?.()}
			onkeydown={handleKeyDown}
		/>

		{#if showClear}
			<button
				part="clear-button"
				class="clear"
				type="button"
				aria-label="Clear entry"
				tabindex="-1"
				onclick={handleClearClick}
			>
				{#if clearIcon}
					{@render clearIcon()}
				{:else}
					<!-- Default clear glyph (WA renders wa-icon "circle-xmark" here); overridable via the clearIcon snippet. -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						width="1em"
						height="1em"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						aria-hidden="true"
					>
						<circle cx="12" cy="12" r="10" />
						<path d="m9 9 6 6M15 9l-6 6" />
					</svg>
				{/if}
			</button>
		{/if}
		{#if showPasswordToggle}
			<button
				part="password-toggle-button"
				class="password-toggle"
				type="button"
				aria-label={passwordVisible ? 'Hide password' : 'Show password'}
				onclick={handlePasswordToggle}
			>
				{#if passwordVisible}
					{#if hidePasswordIcon}
						{@render hidePasswordIcon()}
					{:else}
						<!-- Default hide-password glyph (WA renders wa-icon "eye-slash" here); overridable via the hidePasswordIcon snippet. -->
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
							<path d="M10.6 5.1A9.8 9.8 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 3.9M6.6 6.6C4 8.2 2 12 2 12s3.5 7 10 7a9.6 9.6 0 0 0 4.4-1.1" />
							<path d="m3 3 18 18" />
						</svg>
					{/if}
				{:else}
					{#if showPasswordIcon}
						{@render showPasswordIcon()}
					{:else}
						<!-- Default show-password glyph (WA renders wa-icon "eye" here); overridable via the showPasswordIcon snippet. -->
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
							<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
							<circle cx="12" cy="12" r="3" />
						</svg>
					{/if}
				{/if}
			</button>
		{/if}

		{#if end}
			<span part="end" class="end">{@render end()}</span>
		{/if}
	</div>

	<div id={hintId} part="hint" class:has-slotted={hasHint} aria-hidden={!hasHint}>
		{#if hintSnippet}{@render hintSnippet()}{:else}{hint}{/if}
	</div>
</div>
