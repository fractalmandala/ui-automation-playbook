<script lang="ts" module>
	const warnedSizes = new Set<string>();
</script>

<script lang="ts">
	import { tick, type Snippet } from 'svelte';
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import './textarea.css';
	import '../_shared/wa-styles/component/form-control.css';

	export type TextareaSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'small' | 'medium' | 'large';
	export type TextareaAppearance = 'filled' | 'outlined' | 'filled-outlined';
	export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both' | 'auto';

	interface Props {
		/** The current value of the textarea, submitted as a name/value pair with form data. */
		value?: string;
		/** The default value of the form control. Primarily used for resetting the form control. */
		defaultValue?: string | null;
		/** The textarea's size. `small` / `medium` / `large` are deprecated aliases for `s` / `m` / `l`. */
		size?: TextareaSize;
		/** The textarea's visual appearance. */
		appearance?: TextareaAppearance;
		/** The textarea's label. If you need to display HTML, use the `labelSnippet` snippet instead. */
		label?: string;
		/** The textarea's hint. If you need to display HTML, use the `hintSnippet` snippet instead. */
		hint?: string;
		/** Placeholder text to show as a hint when the input is empty. */
		placeholder?: string;
		/** The number of rows to display by default. */
		rows?: number;
		/** Controls how the textarea can be resized. `auto` grows to fit its content as the user types. */
		resize?: TextareaResize;
		/** Disables the textarea. */
		disabled?: boolean;
		/** Makes the textarea readonly. Unlike `disabled`, a readonly textarea stays focusable and its value is still submitted with the form. */
		readonly?: boolean;
		/** Makes the textarea a required field. */
		required?: boolean;
		/** The minimum length of input that will be considered valid. */
		minlength?: number;
		/** The maximum length of input that will be considered valid. */
		maxlength?: number;
		/** The name of the textarea, submitted as a name/value pair with form data. */
		name?: string | null;
		/** Associates the textarea with a `<form>` elsewhere in the document by id. Forwarded to the native control. */
		form?: string;
		/** The textarea's title. An empty title prevents browser validation tooltips from appearing on hover. */
		title?: string;
		/** Controls whether and how text input is automatically capitalized as it is entered by the user. */
		autocapitalize?: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';
		/** Indicates whether the browser's autocorrect feature is on or off. Omitted when `undefined` so the browser default applies. */
		autocorrect?: boolean;
		/** Specifies what permission the browser has to provide assistance in filling out form field values. */
		autocomplete?: HTMLTextareaAttributes['autocomplete'];
		/** Indicates that the input should receive focus on page load. */
		autofocus?: boolean;
		/** Used to customize the label or icon of the Enter key on virtual keyboards. */
		enterkeyhint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
		/** Enables spell checking on the textarea. */
		spellcheck?: boolean;
		/** Tells the browser what type of data will be entered by the user, allowing it to display the appropriate virtual keyboard on supportive devices. */
		inputmode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
		/** Shows a character count below the textarea. When `maxlength` is set, shows remaining characters instead. */
		withCount?: boolean;
		/** Convenience API for `setCustomValidity()`. Applied to the native control in an `$effect`. */
		customError?: string | null;
		/** The textarea's label as markup. Renders in place of the `label` slot; falls back to the `label` string. */
		labelSnippet?: Snippet;
		/** Hint text as markup. Renders in place of the `hint` slot; falls back to the `hint` string. */
		hintSnippet?: Snippet;
		/** Emitted when the control loses focus. None of WA's textarea events are cancelable, so the return value is ignored. */
		onblur?: (event: FocusEvent) => void;
		/** Emitted when an alteration to the control's value is committed by the user. */
		onchange?: (event: Event) => void;
		/** Emitted when the control gains focus. */
		onfocus?: (event: FocusEvent) => void;
		/** Emitted when the control receives input. */
		oninput?: (event: Event) => void;
		/** Emitted when the form control has been checked for validity and its constraints aren't satisfied. */
		oninvalid?: () => void;
	}

	let {
		value = $bindable(''),
		defaultValue = null,
		size = 'm',
		appearance = 'outlined',
		label = '',
		hint = '',
		placeholder = '',
		rows = 4,
		resize = 'vertical',
		disabled = false,
		readonly = false,
		required = false,
		minlength,
		maxlength,
		name = null,
		form,
		title = '',
		autocapitalize,
		autocorrect,
		autocomplete,
		autofocus = false,
		enterkeyhint,
		spellcheck = true,
		inputmode,
		withCount = false,
		customError = null,
		labelSnippet,
		hintSnippet,
		onblur,
		onchange,
		onfocus,
		oninput,
		oninvalid
	}: Props = $props();

	const uid = $props.id();
	const inputId = `${uid}-input`;
	const hintId = `${uid}-hint`;

	// English defaults from webawesome/src/translations/en.ts. There is no
	// _shared/localize yet, so only English is available — recorded as a gap
	// (same approach as the pagination port).
	const STRINGS = {
		numCharacters: (num: number) => (num === 1 ? '1 character' : `${num} characters`),
		numCharactersRemaining: (num: number) =>
			num === 1 ? '1 character remaining' : `${num} characters remaining`
	};

	// The native element IS the control (per form-association.md): it carries
	// name/value/validation directly, so no mirrored hidden input is needed. WA
	// only wrapped it in ElementInternals because shadow DOM hid it from the form.
	let rootEl = $state<HTMLElement>();
	let inputEl = $state<HTMLTextAreaElement>();
	let baseEl = $state<HTMLDivElement>();
	let adjusterEl = $state<HTMLDivElement>();

	// WA's `defaultValue` reflects the `value` attribute, so `<Textarea value="...">`
	// resets back to it. Capture the initial value as the reset baseline when no
	// explicit defaultValue is given.
	const initialValue = value;

	// Port of HasSlotController.test('label') / .test('hint'): the snippet being
	// present is the whole answer — no slot introspection needed. (WA's `withLabel`
	// / `withHint` props are SSR-only scaffolding and are deleted per the pipeline.)
	const hasLabel = $derived(label !== '' || !!labelSnippet);
	const hasHint = $derived(hint !== '' || !!hintSnippet);
	const isBlank = $derived((value ?? '').length === 0);

	// We use .length intentionally here instead of Intl.Segmenter so the count stays
	// consistent with the browser's native maxlength enforcement, which also counts
	// UTF-16 code units.
	const currentLength = $derived((value ?? '').length);
	const countText = $derived(
		maxlength != null
			? STRINGS.numCharactersRemaining(maxlength - currentLength)
			: STRINGS.numCharacters(currentLength)
	);
	let announcedCountText = $state('');

	let countTimer: ReturnType<typeof setTimeout> | undefined;
	let resizeObserver: ResizeObserver | undefined;
	let lastObservedWidth = 0;

	// Port of WA's `@watch('size')` + `warnDeprecatedSize` (see Input.svelte for
	// the same pattern): a genuine side effect, so `$effect` is correct here.
	$effect(() => {
		if (
			(size === 'small' || size === 'medium' || size === 'large') &&
			!warnedSizes.has(size)
		) {
			warnedSizes.add(size);
			const canonical = size === 'small' ? 's' : size === 'medium' ? 'm' : 'l';
			console.warn(
				`[wa-textarea] size="${size}" is deprecated. Use size="${canonical}" instead. The long-form value will be removed in the next major version.`
			);
		}
	});

	// setCustomValidity is imperative, so it is a genuine side effect. The native
	// control is the validation target (WA's MirrorValidator logic), so validity,
	// messages, and popups all come from it directly.
	$effect(() => {
		inputEl?.setCustomValidity(customError ?? '');
	});

	// `autocorrect` is a non-standard Safari attribute that svelte/elements only
	// types on `<input>`, so it is applied imperatively. Omitted when `undefined`
	// (matching WA's `ifDefined`), so the browser default applies.
	$effect(() => {
		if (!inputEl) return;
		if (autocorrect === undefined) inputEl.removeAttribute('autocorrect');
		else inputEl.setAttribute('autocorrect', autocorrect ? 'on' : 'off');
	});

	// Native reset restores the textarea's *default value* (its `value` content
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

	// Port of WA's `setTextareaDimensions()`. Guards replace the `@query`
	// non-null assumptions; the `resize === 'none'` early return clears stale
	// inline dimensions when the mode changes back.
	function setTextareaDimensions() {
		if (!inputEl || !baseEl) return;

		if (resize === 'none') {
			// just in case this is called via a property changing.
			baseEl.style.width = ``;
			baseEl.style.height = ``;
			return;
		}

		if (resize === 'auto') {
			// The size adjuster shares a grid cell with the textarea and acts as a lower bound on the wrapper height. Pin it
			// to the current `clientHeight` while we measure so the wrapper doesn't collapse during the `auto` reset, then
			// sync it to the new measured height so the wrapper can shrink when content is removed. We use `clientHeight` and
			// `scrollHeight` instead of CSS to account for `max-height` on the textarea.
			//
			// Let's switch to `field-sizing: content` once it has better support: https://caniuse.com/mdn-css_properties_field-sizing [Lea]
			if (adjusterEl) adjusterEl.style.height = `${inputEl.clientHeight}px`;
			inputEl.style.height = 'auto';
			const newHeight = inputEl.scrollHeight;
			inputEl.style.height = `${newHeight}px`;
			if (adjusterEl) adjusterEl.style.height = `${newHeight}px`;

			baseEl.style.width = ``;
			baseEl.style.height = ``;
			return;
		}

		// handles vertical, horizontal, and both resizers:

		// These should always be set by a manual resize operation, so its reasonable to expect px.
		if (inputEl.style.width) {
			const width = Number(inputEl.style.width.split(/px/)[0]) + 2;
			baseEl.style.width = `${width}px`;
		}

		if (inputEl.style.height) {
			const height = Number(inputEl.style.height.split(/px/)[0]) + 2;
			baseEl.style.height = `${height}px`;
		}
	}

	// Port of WA's `updateResizeObserver()`: the observer is needed for manual
	// resize modes (to sync the base wrapper dimensions with the textarea) and for
	// `auto` (so the height recalculates when the textarea goes from hidden to
	// visible or the width changes and the text needs to re-wrap).
	function updateResizeObserver() {
		const needsObserver = resize !== 'none';

		// Always tear down first. The `auto` and manual modes observe different targets with different callbacks, so a
		// stale observer from the previous mode would keep firing on the wrong element.
		if (resizeObserver) {
			resizeObserver.disconnect();
			resizeObserver = undefined;
		}

		if (needsObserver && inputEl) {
			if (resize === 'auto') {
				// Observe the host's width only. Height changes are skipped so our own height mutation in
				// `setTextareaDimensions` doesn't recurse into the observer. The recompute is deferred to the next frame so it
				// runs outside the observer callback (avoids "ResizeObserver loop completed" warnings).
				resizeObserver = new ResizeObserver((entries) => {
					const width = entries[0]?.contentRect.width ?? 0;
					if (width !== lastObservedWidth) {
						lastObservedWidth = width;
						requestAnimationFrame(() => setTextareaDimensions());
					}
				});
				if (rootEl) resizeObserver.observe(rootEl);
			} else {
				resizeObserver = new ResizeObserver(() => setTextareaDimensions());
				resizeObserver.observe(inputEl);
			}
		}
	}

	// Port of WA's `updated()` resize branch + `connectedCallback` setup: rewire
	// the observer whenever the mode or the bound elements change. The returned
	// cleanup is the `disconnectedCallback` teardown.
	$effect(() => {
		void resize;
		void inputEl;
		void rootEl;
		updateResizeObserver();
		return () => {
			resizeObserver?.disconnect();
			resizeObserver = undefined;
		};
	});

	// Port of WA's `@watch('rows')` + `@watch('value')` dimension syncs: after the
	// DOM has caught up (the `tick()` is WA's `await this.updateComplete`), remeasure
	// so programmatic `value`/`rows` changes resize `auto` correctly.
	$effect(() => {
		void rows;
		void value;
		void resize;
		void inputEl;
		tick().then(() => setTextareaDimensions());
	});

	// Port of WA's `disconnectedCallback` timer teardown.
	$effect(() => {
		return () => clearTimeout(countTimer);
	});

	function scheduleCountAnnouncement() {
		clearTimeout(countTimer);
		countTimer = setTimeout(() => {
			const length = (value ?? '').length;
			announcedCountText =
				maxlength != null
					? STRINGS.numCharactersRemaining(maxlength - length)
					: STRINGS.numCharacters(length);
		}, 1000);
	}

	function handleInput(event: Event) {
		value = (event.target as HTMLTextAreaElement).value;
		setTextareaDimensions();
		scheduleCountAnnouncement();
		oninput?.(event);
	}

	function handleChange(event: Event) {
		value = (event.target as HTMLTextAreaElement).value;
		setTextareaDimensions();
		onchange?.(event);
	}

	/** Sets focus on the textarea. */
	export function focus(options?: FocusOptions) {
		inputEl?.focus(options);
	}

	/** Removes focus from the textarea. */
	export function blur() {
		inputEl?.blur();
	}

	/** Selects all the text in the textarea. */
	export function select() {
		inputEl?.select();
	}

	/**
	 * Gets or sets the textarea's scroll position.
	 * Note: the WA source reads `scrollTop` for both axes when getting; this port
	 * returns `scrollLeft` for `left`, which is what the setter writes.
	 */
	export function scrollPosition(position?: {
		top?: number;
		left?: number;
	}): { top: number; left: number } | undefined {
		if (!inputEl) return undefined;
		if (position) {
			if (typeof position.top === 'number') inputEl.scrollTop = position.top;
			if (typeof position.left === 'number') inputEl.scrollLeft = position.left;
			return undefined;
		}

		return {
			top: inputEl.scrollTop,
			left: inputEl.scrollLeft
		};
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
			setTextareaDimensions();
		}
	}

	/** Returns the associated `<form>` element, if any. */
	export function getForm() {
		return inputEl?.form ?? null;
	}

	/** Checks validity against the native control. */
	export function checkValidity() {
		return inputEl?.checkValidity() ?? true;
	}

	/** Checks validity and shows the browser popup on failure. */
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
	class="wa-textarea"
	data-size={size}
	data-appearance={appearance}
	data-resize={resize}
	data-required={required ? '' : undefined}
	data-disabled={disabled ? '' : undefined}
	data-readonly={readonly ? '' : undefined}
	data-blank={isBlank ? '' : undefined}
	bind:this={rootEl}
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

	<div part="base textarea-wrapper" class="textarea" bind:this={baseEl}>
		<!-- svelte-ignore a11y_autofocus: WA exposes an `autofocus` prop that forwards to the native control — kept verbatim for fidelity. -->
		<textarea
			bind:this={inputEl}
			bind:value
			part="textarea"
			id={inputId}
			class="control"
			title={title}
			name={name ?? undefined}
			{form}
			disabled={disabled}
			readonly={readonly}
			required={required}
			placeholder={placeholder}
			rows={rows}
			minlength={minlength}
			maxlength={maxlength}
			autocapitalize={autocapitalize}
			autocomplete={autocomplete}
			autofocus={autofocus}
			spellcheck={spellcheck ? 'true' : 'false'}
			enterkeyhint={enterkeyhint}
			inputmode={inputmode}
			aria-describedby={hintId}
			onblur={(event) => onblur?.(event)}
			onchange={handleChange}
			onfocus={(event) => onfocus?.(event)}
			oninput={handleInput}
			oninvalid={() => oninvalid?.()}
		></textarea>

		<!-- This "adjuster" exists to prevent layout shifting. https://github.com/shoelace-style/shoelace/issues/2180 -->
		<div
			part="textarea-adjuster"
			class="size-adjuster"
			hidden={resize !== 'auto'}
			bind:this={adjusterEl}
		></div>
	</div>

	<div part="hint" class="footer" class:has-count={withCount} class:has-slotted={hasHint}>
		<span id={hintId} class="hint" aria-hidden={!hasHint}>
			{#if hintSnippet}{@render hintSnippet()}{:else}{hint}{/if}
		</span>

		{#if withCount}
			<div part="count" class="count" aria-hidden="true">{countText}</div>
			<div class="wa-visually-hidden-force" aria-live="polite">{announcedCountText}</div>
		{/if}
	</div>
</div>
