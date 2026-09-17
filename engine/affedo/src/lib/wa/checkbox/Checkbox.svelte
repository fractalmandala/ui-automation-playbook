<script lang="ts" module>
	const warnedSizes = new Set<string>();
</script>

<script lang="ts">
	import { getContext, type Snippet } from 'svelte';
	import '../_shared/wa-styles/component/form-control.css';
	import './checkbox.css';
	import {
		CHECKBOX_GROUP_KEY,
		type CheckboxGroupContext,
		type CheckboxItemHandle,
		type CheckboxSize
	} from './context.svelte.js';

	interface Props {
		/** Draws the checkbox in a checked state. */
		checked?: boolean;
		/**
		 * Draws the checkbox in an indeterminate state. This is usually applied to checkboxes
		 * that represent a "select all/none" behavior when associated checkboxes have a mix of
		 * checked and unchecked states. Cleared on the next user commit, like the original.
		 */
		indeterminate?: boolean;
		/** The default checked state of the form control. Restored on form reset; falls back to the initial `checked` value. */
		defaultChecked?: boolean;
		/** The value submitted as a name/value pair when the checkbox is checked. Defaults to `'on'`, like a native checkbox. */
		value?: string | null;
		/** The checkbox's size. `small` / `medium` / `large` are deprecated aliases for `s` / `m` / `l`. A `checkbox-group` size overrides this via context. */
		size?: CheckboxSize;
		/** The checkbox's label as plain text. Use the `children` snippet when you need markup. */
		label?: string;
		/** The checkbox's hint as plain text. If you need to display HTML, use the `hintSnippet` snippet instead. */
		hint?: string;
		/** Makes the checkbox a required field. */
		required?: boolean;
		/** Disables the checkbox. */
		disabled?: boolean;
		/** The name of the checkbox, submitted as a name/value pair with form data. */
		name?: string | null;
		/** Associates the checkbox with a `<form>` elsewhere in the document by id. Forwarded to the native control. */
		form?: string;
		/** The checkbox's title. An empty title prevents browser validation tooltips from appearing on hover. */
		title?: string;
		/** Convenience API for `setCustomValidity()`. Applied to the native control in an `$effect`. */
		customError?: string | null;
		/** The checkbox's label as markup. Renders in place of the default slot; falls back to the `label` string. */
		children?: Snippet;
		/** Hint text as markup. Renders in place of the `hint` slot; falls back to the `hint` string. */
		hintSnippet?: Snippet;
		/** Emitted when the control loses focus. None of WA's checkbox events are cancelable, so the return value is ignored. */
		onblur?: (event: FocusEvent) => void;
		/** Emitted when the control's checked state changes. */
		onchange?: (event: Event) => void;
		/** Emitted when the control gains focus. */
		onfocus?: (event: FocusEvent) => void;
		/** Emitted when the control receives input. */
		oninput?: (event: Event) => void;
		/** Emitted when the form control has been checked for validity and its constraints aren't satisfied. */
		oninvalid?: () => void;
	}

	let {
		checked = $bindable(false),
		indeterminate = $bindable(false),
		defaultChecked,
		value = 'on',
		size = 'm',
		label = '',
		hint = '',
		required = false,
		disabled = false,
		name = null,
		form,
		title = '',
		customError = null,
		children,
		hintSnippet,
		onblur,
		onchange,
		onfocus,
		oninput,
		oninvalid
	}: Props = $props();

	// A checkbox outside a group still works; it just governs itself. Inside a
	// group, the group's `size` wins (port of WA's `syncCheckboxElements()` —
	// the group stamped its size attribute onto every child).
	const ctx = getContext<CheckboxGroupContext | undefined>(CHECKBOX_GROUP_KEY);

	const uid = $props.id();
	const hintId = `${uid}-hint`;

	// The native checkbox IS the control (per form-association.md): it carries
	// name/value/validation directly, so no mirrored hidden input is needed. WA
	// only wrapped it in ElementInternals because shadow DOM hid it from the form.
	let inputEl = $state<HTMLInputElement>();

	// WA's `defaultChecked` reflects the `checked` attribute, so `<Checkbox checked>`
	// resets back to it. Capture the initial value as the reset baseline when no
	// explicit defaultChecked is given.
	const initialChecked = checked;

	// Port of HasSlotController: the snippet being present is the whole answer —
	// no slot introspection needed. (WA's SSR-only scaffolding is deleted per the pipeline.)
	const hasLabel = $derived(label !== '' || !!children);
	const hasHint = $derived(hint !== '' || !!hintSnippet);
	// Port of WA's `isIndeterminate`: the indeterminate glyph only shows while unchecked.
	const isIndeterminate = $derived(!checked && indeterminate);
	const effectiveSize = $derived(ctx?.size ?? size);

	// Port of WA's `@watch('size')` + `warnDeprecatedSize` (see Switch.svelte for
	// the same pattern): a genuine side effect, so `$effect` is correct here.
	$effect(() => {
		if (
			(effectiveSize === 'small' || effectiveSize === 'medium' || effectiveSize === 'large') &&
			!warnedSizes.has(effectiveSize)
		) {
			warnedSizes.add(effectiveSize);
			const canonical =
				effectiveSize === 'small' ? 's' : effectiveSize === 'medium' ? 'm' : 'l';
			console.warn(
				`[wa-checkbox] size="${effectiveSize}" is deprecated. Use size="${canonical}" instead. The long-form value will be removed in the next major version.`
			);
		}
	});

	// setCustomValidity is imperative, so it is a genuine side effect. The native
	// control is the validation target, so validity, messages, and popups all come
	// from it directly.
	$effect(() => {
		inputEl?.setCustomValidity(customError ?? '');
	});

	// `.indeterminate` is property-only state with no attribute. WA drove it via a
	// `live()` property binding plus a forced sync in `handleStateChange()`; the
	// `$effect` below is that sync. A genuine side effect.
	$effect(() => {
		if (inputEl) inputEl.indeterminate = indeterminate;
	});

	// Native reset restores the checkbox's default state, so re-assert component
	// state on the next microtask — after the browser has finished resetting.
	$effect(() => {
		void form;
		const formEl = inputEl?.form;
		if (!formEl) return;
		const onReset = () => {
			queueMicrotask(() => {
				checked = defaultChecked ?? initialChecked;
			});
		};
		formEl.addEventListener('reset', onReset);
		return () => formEl.removeEventListener('reset', onReset);
	});

	function handleInput(event: Event) {
		checked = (event.target as HTMLInputElement).checked;
		oninput?.(event);
	}

	function handleChange(event: Event) {
		const target = event.target as HTMLInputElement;
		checked = target.checked;
		// Port of WA `handleClick()`: any user commit clears the indeterminate state.
		if (indeterminate) indeterminate = false;
		onchange?.(event);
	}

	/** Simulates a click on the checkbox. */
	export function click() {
		inputEl?.click();
	}

	/** Sets focus on the checkbox. */
	export function focus(options?: FocusOptions) {
		inputEl?.focus(options);
	}

	/** Removes focus from the checkbox. */
	export function blur() {
		inputEl?.blur();
	}

	/** Sets the checked state. Used by a future `checkbox-group` (select-all patterns) through the handle. */
	export function setChecked(next: boolean) {
		checked = next;
	}

	/** Sets the indeterminate state. Used by a future `checkbox-group` (select-all patterns) through the handle. */
	export function setIndeterminate(next: boolean) {
		indeterminate = next;
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

	const handle: CheckboxItemHandle = {
		el: undefined as unknown as HTMLElement,
		get disabled() {
			return disabled;
		},
		get checked() {
			return checked;
		},
		get indeterminate() {
			return indeterminate;
		},
		setChecked,
		setIndeterminate,
		focus
	};

	function join(node: HTMLElement) {
		handle.el = node;
		return ctx?.register(handle);
	}
</script>

<div
	class="wa-checkbox"
	data-checked={checked ? '' : undefined}
	data-disabled={disabled ? '' : undefined}
	data-indeterminate={indeterminate ? '' : undefined}
	data-required={required ? '' : undefined}
	data-size={effectiveSize}
	{@attach join}
>
	<label part="base checkbox">
		<span part="control">
			<input
				bind:this={inputEl}
				class="input"
				type="checkbox"
				title={title}
				name={name ?? undefined}
				value={value ?? 'on'}
				{form}
				{checked}
				{disabled}
				{required}
				aria-checked={indeterminate ? 'mixed' : checked ? 'true' : 'false'}
				aria-describedby={hasHint ? hintId : undefined}
				onblur={(event) => onblur?.(event)}
				onchange={handleChange}
				onfocus={(event) => onfocus?.(event)}
				oninput={handleInput}
				oninvalid={() => oninvalid?.()}
			/>

			{#if isIndeterminate}
				<span part="indeterminate-icon icon" aria-hidden="true">
					<!-- Default indeterminate glyph (WA renders wa-icon "indeterminate" here). -->
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
				</span>
			{:else}
				<span part="checked-icon icon" aria-hidden="true">
					<!-- Default checked glyph (WA renders wa-icon "check" here). -->
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
						<path d="M20 6 9 17l-5-5" />
					</svg>
				</span>
			{/if}
		</span>

		<span part="label" class="label" class:has-label={hasLabel}>
			{#if children}{@render children()}{:else}{label}{/if}
		</span>
	</label>

	<div id={hintId} part="hint" class:has-slotted={hasHint} aria-hidden={!hasHint}>
		{#if hintSnippet}{@render hintSnippet()}{:else}{hint}{/if}
	</div>
</div>
