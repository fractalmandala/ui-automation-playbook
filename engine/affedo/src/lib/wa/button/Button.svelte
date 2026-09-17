<script lang="ts" module>
	const warnedSizes = new Set<string>();
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '../icon/Icon.svelte';
	import './button.css';
	import '../_shared/wa-styles/component/variants.css';

	export type ButtonVariant = 'neutral' | 'brand' | 'success' | 'warning' | 'danger';
	export type ButtonAppearance = 'accent' | 'filled' | 'outlined' | 'filled-outlined' | 'plain';
	export type ButtonSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'small' | 'medium' | 'large';
	export type ButtonType = 'button' | 'submit' | 'reset';

	interface Props {
		/** The button's theme variant. Defaults to `neutral` if not within another element with a variant. */
		variant?: ButtonVariant;
		/** The button's visual appearance. */
		appearance?: ButtonAppearance;
		/** The button's size. `small` / `medium` / `large` are deprecated aliases for `s` / `m` / `l`. */
		size?: ButtonSize;
		/** Draws the button with a caret. Used to indicate that the button triggers a dropdown menu or similar behavior. */
		withCaret?: boolean;
		/** Disables the button. Works on link buttons too. */
		disabled?: boolean;
		/** Draws the button in a loading state. Its width stays the same, so adjacent elements don't shift. */
		loading?: boolean;
		/** Draws a pill-style button with rounded edges. */
		pill?: boolean;
		/**
		 * The type of button. Note that the default value is `button` instead of `submit`, which is opposite of how native
		 * `<button>` elements behave. When the type is `submit`, the button will submit the surrounding form.
		 */
		type?: ButtonType;
		/**
		 * The name of the button, submitted as a name/value pair with form data, but only when this button is the submitter.
		 * This attribute is ignored when `href` is present.
		 */
		name?: string;
		/**
		 * The value of the button, submitted as a pair with the button's name as part of the form data, but only when this
		 * button is the submitter. This attribute is ignored when `href` is present.
		 */
		value?: string;
		/** When set, the underlying button will be rendered as an `<a>` with this `href` instead of a `<button>`. */
		href?: string;
		/** Tells the browser where to open the link. Only used when `href` is present. */
		target?: '_blank' | '_parent' | '_self' | '_top';
		/** When using `href`, this attribute will map to the underlying link's `rel` attribute. */
		rel?: string;
		/** Tells the browser to download the linked file as this filename. Only used when `href` is present. */
		download?: string;
		/**
		 * The "form owner" to associate the button with. If omitted, the closest containing form will be used instead. The
		 * value of this attribute must be an id of a form in the same document. Forwarded to the native control.
		 */
		form?: string;
		/** Used to override the form owner's `action` attribute. */
		formAction?: string;
		/** Used to override the form owner's `enctype` attribute. */
		formEnctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
		/** Used to override the form owner's `method` attribute. */
		formMethod?: 'post' | 'get';
		/** Used to override the form owner's `novalidate` attribute. */
		formNoValidate?: boolean;
		/** Used to override the form owner's `target` attribute. */
		formTarget?: '_self' | '_blank' | '_parent' | '_top' | string;
		/** An optional ID for the button element. */
		id?: string;
		/** Additional CSS classes */
		class?: string;
		/** Accessible label for screen readers */
		'aria-label'?: string;
		/** The button's title. An empty title prevents browser validation tooltips from appearing on hover. */
		title?: string;
		/** Part name for CSS part styling. */
		part?: string;
		/** The button's label. */
		children?: Snippet;
		/** An element, such as an icon, placed before the label. */
		start?: Snippet;
		/** An element, such as an icon, placed after the label. */
		end?: Snippet;
		/** Emitted when the button is clicked. Not called when the button is disabled or loading. */
		onclick?: (event: MouseEvent) => void;
		/** Emitted when the button loses focus. */
		onblur?: (event: FocusEvent) => void;
		/** Emitted when the button gains focus. */
		onfocus?: (event: FocusEvent) => void;
		/** Emitted when the form control has been checked for validity and its constraints aren't satisfied. */
		oninvalid?: () => void;
	}

	let {
		variant = 'neutral',
		appearance = 'accent',
		size = 'm',
		withCaret = false,
		disabled = false,
		loading = false,
		pill = false,
		id = undefined,
		class: className = '',
		type = 'button',
		name,
		value,
		href,
		target,
		rel,
		download,
		form,
		formAction,
		formEnctype,
		formMethod,
		formNoValidate,
		formTarget,
		title = '',
		part,
		'aria-label': ariaLabel,
		children,
		start,
		end,
		onclick,
		onblur,
		onfocus,
		oninvalid
	}: Props = $props();

	// The native element IS the control (form=native): it carries type/name/value/
	// form/disabled and all form* overrides directly, so no mirrored hidden input is
	// needed. WA only needed ElementInternals indirection because shadow DOM hid the
	// control from the form.
	let controlEl = $state<HTMLButtonElement | HTMLAnchorElement>();
	let labelEl = $state<HTMLElement>();
	let rootEl = $state<HTMLElement>();

	// Port of WA's `isIconButton` state: when an icon is the only thing slotted into
	// the label, the button becomes an icon button. WA read this off slot assignment;
	// here a MutationObserver over the light-DOM label children runs the same check.
	let isIconButton = $state(false);

	// Port of `this.localize.dir() === 'rtl'` (same approach as the pagination port).
	let rtl = $state(false);

	// Port of WA's `isLink()`: any truthy `href` renders an `<a>` instead of a `<button>`.
	const isLink = $derived(!!href);

	// Port of HasSlotController.test('[default]' / 'start' / 'end'): the snippet being
	// present is the whole answer — no slot introspection needed. (WA's `withStart` /
	// `withEnd` props are SSR-only scaffolding and are deleted per the pipeline.)
	const hasLabel = $derived(children !== undefined);
	const hasStart = $derived(start !== undefined);
	const hasEnd = $derived(end !== undefined);

	// Port of WA's `@watch('size')` + `warnDeprecatedSize` (see Input.svelte for the
	// same pattern): a genuine side effect, so `$effect` is correct here.
	$effect(() => {
		if ((size === 'small' || size === 'medium' || size === 'large') && !warnedSizes.has(size)) {
			warnedSizes.add(size);
			const canonical = size === 'small' ? 's' : size === 'medium' ? 'm' : 'l';
			console.warn(
				`[wa-button] size="${size}" is deprecated. Use size="${canonical}" instead. The long-form value will be removed in the next major version.`
			);
		}
	});

	$effect(() => {
		if (rootEl) {
			rtl = getComputedStyle(rootEl).direction === 'rtl';
		}
	});

	// Port of WA's `handleLabelSlotChange()`. The Icon component's root carries
	// `wa-icon`, and its accessible name (if any) surfaces as `aria-label` — so the
	// icon-label warning survives the port without reaching into the Icon's props.
	function checkIconButton() {
		const el = labelEl;
		if (!el) return;
		let hasIcon = false;
		let hasText = false;
		let hasOtherElements = false;
		let iconEl: Element | null = null;

		for (const node of el.childNodes) {
			if (node.nodeType === Node.ELEMENT_NODE) {
				const element = node as HTMLElement;
				if (element.classList.contains('wa-icon')) {
					hasIcon = true;
					iconEl ??= element;
				} else {
					// Any other element type means it's not an icon button
					hasOtherElements = true;
				}
			} else if (node.nodeType === Node.TEXT_NODE) {
				// Check if text node has actual content
				if ((node.textContent ?? '').trim().length > 0) {
					hasText = true;
				}
			}
		}

		// It's only an icon button if there's an icon and nothing else
		isIconButton = hasIcon && !hasText && !hasOtherElements;

		if (isIconButton && iconEl && !iconEl.hasAttribute('aria-label')) {
			console.warn(
				'Icon buttons must have a label for screen readers. Add a label to the icon (e.g. <Icon name="..." label="..." />) to remove this warning.'
			);
		}
	}

	$effect(() => {
		checkIconButton();
		const el = labelEl;
		if (!el) return;
		const observer = new MutationObserver(checkIconButton);
		observer.observe(el, { childList: true, characterData: true, subtree: true });
		return () => observer.disconnect();
	});

	function handleClick(event: MouseEvent) {
		// Port of WA's `handleClick` guard: disabled and loading buttons swallow clicks.
		// WA's `constructLightDOMButton()` submit hack is deleted — the native
		// `<button type="submit|reset">` IS in the form's light DOM here, so submit and
		// reset participate natively with no proxy element.
		if (disabled || loading) {
			event.preventDefault();
			event.stopImmediatePropagation();
			return;
		}
		onclick?.(event);
	}

	/** Simulates a click on the button. */
	export function click() {
		controlEl?.click();
	}

	/** Sets focus on the button. */
	export function focus(options?: FocusOptions) {
		controlEl?.focus(options);
	}

	/** Removes focus from the button. */
	export function blur() {
		controlEl?.blur();
	}

	/** Returns the associated `<form>` element, if any. Links have no form owner. */
	export function getForm() {
		return controlEl instanceof HTMLButtonElement ? controlEl.form : null;
	}
</script>

{#snippet inner()}
	{#if start}
		<span part="start" class="start">{@render start()}</span>
	{/if}
	<span bind:this={labelEl} part="label" class="label">{@render children?.()}</span>
	{#if end}
		<span part="end" class="end">{@render end()}</span>
	{/if}
	{#if withCaret}
		<!-- Port of `<wa-icon part="caret" library="system" name="chevron-down">`: the Icon
		     component renders the same system icon; the part/class live on the wrapper
		     because Icon owns its own root element. -->
		<span part="caret" class="caret">
			<Icon library="system" name="chevron-down" variant="solid" />
		</span>
	{/if}
	{#if loading}
		<!-- Port of `<wa-spinner part="spinner">`: the spinner component is not ported yet,
		     so its track/indicator SVG ports inline (see button.css) until it is. -->
		<span class="wa-spinner" part="spinner">
			<svg
				part="base spinner"
				role="progressbar"
				aria-label="Loading"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<circle class="track" />
				<circle class="indicator" />
			</svg>
		</span>
	{/if}
{/snippet}

<span
	bind:this={rootEl}
	class="wa-button {className}"
	id={id}
	part={part || undefined}
	data-variant={variant}
	data-appearance={appearance}
	data-size={size}
	data-pill={pill ? '' : undefined}
	data-loading={loading ? '' : undefined}
	data-disabled={disabled ? '' : undefined}
>
	{#if isLink}
		<a
			bind:this={controlEl}
			part="base button"
			class="button-control"
			class:caret={withCaret}
			class:disabled
			class:loading
			class:rtl
			class:has-label={hasLabel}
			class:has-start={hasStart}
			class:has-end={hasEnd}
			class:is-icon-button={isIconButton}
			href={href}
			target={target}
			download={download}
			rel={rel}
			title={title}
			aria-label={ariaLabel}
			aria-disabled={disabled ? 'true' : undefined}
			aria-busy={loading ? 'true' : 'false'}
			tabindex={disabled ? -1 : 0}
			onclick={handleClick}
			onblur={(event) => onblur?.(event)}
			onfocus={(event) => onfocus?.(event)}
		>
			{@render inner()}
		</a>
	{:else}
		<button
			bind:this={controlEl}
			part="base button"
			class="button-control"
			class:caret={withCaret}
			class:disabled
			class:loading
			class:rtl
			class:has-label={hasLabel}
			class:has-start={hasStart}
			class:has-end={hasEnd}
			class:is-icon-button={isIconButton}
			disabled={disabled}
			type={type}
			title={title}
			aria-label={ariaLabel}
			name={name}
			value={value}
			form={form}
			formaction={formAction}
			formenctype={formEnctype}
			formmethod={formMethod}
			formnovalidate={formNoValidate}
			formtarget={formTarget}
			aria-busy={loading ? 'true' : 'false'}
			tabindex={disabled ? -1 : undefined}
			onclick={handleClick}
			onblur={(event) => onblur?.(event)}
			onfocus={(event) => onfocus?.(event)}
			oninvalid={() => oninvalid?.()}
		>
			{@render inner()}
		</button>
	{/if}
</span>
