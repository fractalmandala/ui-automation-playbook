<script lang="ts" module>
	const warnedSizes = new Set<string>();
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import '../_shared/wa-styles/component/form-control.css';
	import './switch.css';

	export type SwitchSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'small' | 'medium' | 'large';

	interface Props {
		/** Draws the switch in a checked state. */
		checked?: boolean;
		/** The default checked state of the form control. Restored on form reset; falls back to the initial `checked` value. */
		defaultChecked?: boolean;
		/** The value submitted as a name/value pair when the switch is checked. Defaults to `'on'`, like a native checkbox. */
		value?: string | null;
		/** The switch's size. `small` / `medium` / `large` are deprecated aliases for `s` / `m` / `l`. */
		size?: SwitchSize;
		/** The switch's label as plain text. Use the `children` snippet when you need markup. */
		label?: string;
		/** The switch's hint as plain text. If you need to display HTML, use the `hintSnippet` snippet instead. */
		hint?: string;
		/** Makes the switch a required field. */
		required?: boolean;
		/** Disables the switch. */
		disabled?: boolean;
		/** The name of the switch, submitted as a name/value pair with form data. */
		name?: string | null;
		/** Associates the switch with a `<form>` elsewhere in the document by id. Forwarded to the native control. */
		form?: string;
		/** The switch's title. An empty title prevents browser validation tooltips from appearing on hover. */
		title?: string;
		/** Convenience API for `setCustomValidity()`. Applied to the native control in an `$effect`. */
		customError?: string | null;
		/** The switch's label as markup. Renders in place of the default slot; falls back to the `label` string. */
		children?: Snippet;
		/** Hint text as markup. Renders in place of the `hint` slot; falls back to the `hint` string. */
		hintSnippet?: Snippet;
		/** Emitted when the control loses focus. None of WA's switch events are cancelable, so the return value is ignored. */
		onblur?: (event: FocusEvent) => void;
		/** Emitted when the control's checked state changes. */
		onchange?: (event: Event) => void;
		/** Emitted when the control receives input. */
		oninput?: (event: Event) => void;
		/** Emitted when the control gains focus. */
		onfocus?: (event: FocusEvent) => void;
		/** Emitted when the form control has been checked for validity and its constraints aren't satisfied. */
		oninvalid?: () => void;
	}

	let {
		checked = $bindable(false),
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
		oninput,
		onfocus,
		oninvalid
	}: Props = $props();

	const uid = $props.id();
	const hintId = `${uid}-hint`;

	// The native checkbox IS the control (per form-association.md): it carries
	// name/value/validation directly, so no mirrored hidden input is needed. WA
	// only wrapped it in ElementInternals because shadow DOM hid it from the form.
	let inputEl = $state<HTMLInputElement>();

	// WA's `defaultChecked` reflects the `checked` attribute, so `<Switch checked>`
	// resets back to it. Capture the initial value as the reset baseline when no
	// explicit defaultChecked is given.
	const initialChecked = checked;

	// Port of HasSlotController: the snippet being present is the whole answer —
	// no slot introspection needed. (WA's `withHint` prop is SSR-only scaffolding
	// and is deleted per the pipeline.)
	const hasLabel = $derived(label !== '' || !!children);
	const hasHint = $derived(hint !== '' || !!hintSnippet);

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
				`[wa-switch] size="${size}" is deprecated. Use size="${canonical}" instead. The long-form value will be removed in the next major version.`
			);
		}
	});

	// setCustomValidity is imperative, so it is a genuine side effect. The native
	// control is the validation target (WA's MirrorValidator logic), so validity,
	// messages, and popups all come from it directly.
	$effect(() => {
		inputEl?.setCustomValidity(customError ?? '');
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
		checked = (event.target as HTMLInputElement).checked;
		onchange?.(event);
	}

	// Port of WA's `handleKeyDown`: arrow keys set the state directly (RTL-aware,
	// like the original) and emit change + input. `LocalizeController.dir()` has
	// no Svelte equivalent, so the direction is read from the DOM instead.
	function handleKeyDown(event: KeyboardEvent) {
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
		event.preventDefault();
		const dir =
			inputEl?.closest('[dir]')?.getAttribute('dir') ??
			document.documentElement.getAttribute('dir') ??
			'ltr';
		const isRtl = dir === 'rtl';
		checked = event.key === 'ArrowLeft' ? isRtl : !isRtl;
		// WA dispatches change + input here; following Input.svelte's clear-button
		// precedent, synthetic events are delivered to the callbacks.
		onchange?.(new Event('change', { bubbles: true }));
		oninput?.(new InputEvent('input', { bubbles: true, composed: true }));
	}

	/** Simulates a click on the switch. */
	export function click() {
		inputEl?.click();
	}

	/** Sets focus on the switch. */
	export function focus(options?: FocusOptions) {
		inputEl?.focus(options);
	}

	/** Removes focus from the switch. */
	export function blur() {
		inputEl?.blur();
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
	class="wa-switch"
	data-checked={checked ? '' : undefined}
	data-disabled={disabled ? '' : undefined}
	data-required={required ? '' : undefined}
	data-size={size}
>
	<label part="base switch" class:checked class:disabled>
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
			role="switch"
			aria-checked={checked ? 'true' : 'false'}
			aria-describedby={hasHint ? hintId : undefined}
			onblur={(event) => onblur?.(event)}
			onchange={handleChange}
			onfocus={(event) => onfocus?.(event)}
			oninput={handleInput}
			oninvalid={() => oninvalid?.()}
			onkeydown={handleKeyDown}
		/>

		<span part="control" class="switch">
			<span part="thumb" class="thumb"></span>
		</span>

		<span part="label" class="label" class:has-label={hasLabel}>
			{#if children}{@render children()}{:else}{label}{/if}
		</span>
	</label>

	<div id={hintId} part="hint" class:has-slotted={hasHint} aria-hidden={!hasHint}>
		{#if hintSnippet}{@render hintSnippet()}{:else}{hint}{/if}
	</div>
</div>
