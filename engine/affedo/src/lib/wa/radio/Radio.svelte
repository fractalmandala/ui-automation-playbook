<script lang="ts" module>
	const warnedSizes = new Set<string>();
</script>

<script lang="ts">
	import { getContext, type Snippet } from 'svelte';
	import {
		RADIO_GROUP_KEY,
		type RadioAppearance,
		type RadioGroupContext,
		type RadioHandle,
		type RadioSize
	} from './context.svelte.js';
	import '../_shared/wa-styles/component/form-control.css';
	import './radio.css';

	interface Props {
		/** The radio's value. When selected, the future radio group receives this value. Falls back to `'on'` on the native control, like a native radio. */
		value?: string;
		/** Draws the radio in a checked state. Owned by the leaf; the future group mutates it via the handle. */
		checked?: boolean;
		/** The default checked state. Restored on form reset; falls back to the initial `checked` value. Standalone only — inside a group the group's `defaultValue` wins. */
		defaultChecked?: boolean;
		/** The radio's visual appearance. The group never stamps this (WA keeps it per-radio), so there is no context fallback. */
		appearance?: RadioAppearance;
		/** The radio's size. Inside a group the group's size wins when present. `small` / `medium` / `large` are deprecated aliases for `s` / `m` / `l`. */
		size?: RadioSize;
		/** Disables the radio. */
		disabled?: boolean;
		/** The name submitted as a name/value pair with form data (standalone). Inside a group the group's name wins. */
		name?: string | null;
		/** Makes the radio required (standalone). Inside a group the group's `required` wins. */
		required?: boolean;
		/** Associates the radio with a `<form>` elsewhere in the document by id. Forwarded to the native control. */
		form?: string;
		/** The radio's label. Maps to WA's default slot. */
		children?: Snippet;
		/** Emitted when the control loses focus. (`change` / `input` are group-level — see the future RadioGroup.) */
		onblur?: (event: FocusEvent) => void;
		/** Emitted when the control gains focus. */
		onfocus?: (event: FocusEvent) => void;
	}

	let {
		value,
		checked = $bindable(false),
		defaultChecked,
		appearance = 'default',
		size,
		disabled = false,
		name = null,
		required = false,
		form,
		children,
		onblur,
		onfocus
	}: Props = $props();

	// Outside a group the leaf governs itself; inside, the group drives it
	// through the handle (accordion pattern). Group `value` is the single
	// source of truth; leaf `checked` stays `$bindable` so `bind:checked` keeps
	// working (lit-to-svelte §2).
	const ctx = getContext<RadioGroupContext | undefined>(RADIO_GROUP_KEY);

	let rootEl = $state<HTMLElement>();
	let inputEl = $state<HTMLInputElement>();
	let forceDisabled = $state(false);

	const initialChecked = checked;

	// Live reads replacing WA's `syncRadioElements()` pushes.
	const effectiveSize = $derived(ctx?.size ?? size);
	const effectiveName = $derived(ctx?.name ?? name);
	const effectiveRequired = $derived(ctx ? ctx.required : required);
	const effectivelyDisabled = $derived(disabled || forceDisabled || (ctx?.disabled ?? false));
	// Roving tabindex (port of WA's `updated()` + the tabIndex half of
	// `syncRadioElements()`). A standalone radio stays tabbable; in a group the
	// checked radio is tabbable. The future group calls
	// `ctx.updateTabIndexes()` after mount so the first enabled radio is
	// tabbable while none is checked.
	const tabindex = $derived(effectivelyDisabled ? -1 : ctx ? (checked ? 0 : -1) : 0);
	const optionValue = $derived(value ?? 'on');

	const handle: RadioHandle = {
		el: undefined as unknown as HTMLElement,
		get value() {
			return optionValue;
		},
		get disabled() {
			return effectivelyDisabled;
		},
		get checked() {
			return checked;
		},
		setChecked(next: boolean) {
			checked = next;
		},
		setForceDisabled(next: boolean) {
			forceDisabled = next;
		},
		focus: (options?: FocusOptions) => rootEl?.focus(options)
	};

	// Port of WA's `@watch('size')` + `warnDeprecatedSize` (Input/Switch
	// precedent): a genuine side effect, so `$effect` is correct here.
	$effect(() => {
		if ((size === 'small' || size === 'medium' || size === 'large') && !warnedSizes.has(size)) {
			warnedSizes.add(size);
			const canonical = size === 'small' ? 's' : size === 'medium' ? 'm' : 'l';
			console.warn(
				`[wa-radio] size="${size}" is deprecated. Use size="${canonical}" instead. The long-form value will be removed in the next major version.`
			);
		}
	});

	// Native reset restores the hidden input's default, so re-assert component
	// state on the next microtask — after the browser has finished resetting
	// (Input/Switch precedent). Inside a group the future group resets via
	// `ctx.syncValue()` instead; this covers standalone use.
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

	// Port of WA's `handleClick`: a radio only ever checks (never unchecks
	// itself — the group unchecks the others via the handle).
	function handleClick() {
		if (effectivelyDisabled) return;
		if (ctx) ctx.select(handle);
		else checked = true;
	}

	// Standalone Space support. Inside a group the context owns arrow/space
	// navigation (port of WA's group-level `handleKeyDown`).
	function handleKeyDown(event: KeyboardEvent) {
		if (effectivelyDisabled) return;
		if (ctx) {
			ctx.keydown(event, handle);
			return;
		}
		if (event.key === ' ' || event.key === 'Spacebar') {
			event.preventDefault();
			checked = true;
		}
	}

	function join(node: HTMLElement) {
		handle.el = node;
		rootEl = node;
		return ctx?.register(handle);
	}

	/** Sets focus on the radio. */
	export function focus(options?: FocusOptions) {
		rootEl?.focus(options);
	}

	/** Removes focus from the radio. */
	export function blur() {
		rootEl?.blur();
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
</script>

<div
	class="wa-radio"
	class:checked
	class:disabled={effectivelyDisabled}
	role="radio"
	tabindex={tabindex}
	aria-checked={checked ? 'true' : 'false'}
	aria-disabled={effectivelyDisabled ? 'true' : 'false'}
	data-checked={checked ? '' : undefined}
	data-disabled={effectivelyDisabled ? '' : undefined}
	data-appearance={appearance}
	data-size={effectiveSize}
	{@attach join}
	onclick={handleClick}
	onkeydown={handleKeyDown}
	onblur={(event) => onblur?.(event)}
	onfocus={(event) => onfocus?.(event)}
>
	<!-- The native radio IS the form control (form-association.md): it carries
		name/value/validation directly. It stays hidden (`pointer-events: none`,
		see radio.css `.input`) — the `role=radio` host keeps focus + ARIA, so
		the `:focus-visible` selectors port verbatim. Inside a group the
		name/required come from the context and the group value stays the single
		source of truth; the group itself renders no duplicate control. -->
	<input
		bind:this={inputEl}
		class="input"
		type="radio"
		name={effectiveName ?? undefined}
		value={optionValue}
		{checked}
		disabled={effectivelyDisabled}
		required={effectiveRequired}
		{form}
		tabindex="-1"
		aria-hidden="true"
	/>
	<span part="control" class="control">
		{#if checked}
			<svg
				viewBox="0 0 16 16"
				xmlns="http://www.w3.org/2000/svg"
				part="checked-icon"
				class="checked-icon"
				aria-hidden="true"
			>
				<circle cx="8" cy="8" r="8" />
			</svg>
		{/if}
	</span>
	<span part="label" class="label">
		{#if children}{@render children()}{/if}
	</span>
</div>
