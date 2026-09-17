<script lang="ts">
	import { setContext, tick, type Snippet } from 'svelte';
	import {
		RADIO_GROUP_KEY,
		RadioGroupContext,
		type RadioOrientation,
		type RadioSize
	} from '../radio/context.svelte.js';
	import '../_shared/wa-styles/component/form-control.css';
	import './radio-group.css';

	interface Props {
		/** The current value of the radio group. */
		value?: string | null;
		/** The name of the radio group, submitted with form data. */
		name?: string | null;
		/** Disables the radio group and all child radios. */
		disabled?: boolean;
		/** The orientation in which to show radio items. */
		orientation?: RadioOrientation;
		/** The size of child radios. */
		size?: RadioSize;
		/** Requires an option to be selected. */
		required?: boolean;
		/** Label for the radio group. */
		label?: string;
		/** Hint text for the radio group. */
		hint?: string;
		/** Custom label snippet. */
		labelSnippet?: Snippet;
		/** Custom hint snippet. */
		hintSnippet?: Snippet;
		/** Child radio items. */
		children?: Snippet;
		/** Emitted when value changes. */
		onchange?: (value: string) => void;
		/** Emitted on user input. */
		oninput?: (value: string) => void;
	}

	let {
		value = $bindable(null),
		name = null,
		disabled = false,
		orientation = 'vertical',
		size = undefined,
		required = false,
		label = '',
		hint = '',
		labelSnippet,
		hintSnippet,
		children,
		onchange,
		oninput
	}: Props = $props();

	const ctx = new RadioGroupContext(
		() => ({ value, name, disabled, required, size, orientation }),
		(val: string) => {
			const old = value;
			value = val;
			if (old !== val) {
				oninput?.(val);
				onchange?.(val);
			}
			tick().then(() => ctx.syncPositions());
		}
	);

	setContext(RADIO_GROUP_KEY, ctx);

	const uid = $props.id();
	const labelId = `${uid}-label`;
	const hintId = `${uid}-hint`;

	const hasLabel = $derived(Boolean(label || labelSnippet));
	const hasHint = $derived(Boolean(hint || hintSnippet));

	$effect(() => {
		tick().then(() => {
			if (value !== null) {
				ctx.syncValue(value);
			}
			ctx.syncPositions();
			ctx.updateTabIndexes();
		});
	});
</script>

<div
	class="wa-radio-group"
	data-orientation={orientation}
	data-size={size}
	data-disabled={disabled ? '' : undefined}
	data-required={required ? '' : undefined}
>
	{#if name}
		<input type="hidden" {name} value={value ?? ''} {disabled} />
	{/if}

	<fieldset
		part="form-control"
		class="form-control"
		class:radio-group-required={required}
		class:form-control-has-label={hasLabel}
	>
		{#if hasLabel}
			<legend
				part="form-control-label"
				id={labelId}
				class="label has-label"
			>
				{#if labelSnippet}
					{@render labelSnippet()}
				{:else}
					{label}
				{/if}
			</legend>
		{/if}

		<div
			part="form-control-input"
			role="radiogroup"
			aria-labelledby={hasLabel ? labelId : undefined}
			aria-describedby={hasHint ? hintId : undefined}
		>
			{#if children}
				{@render children()}
			{/if}
		</div>

		{#if hasHint}
			<div
				id={hintId}
				part="hint"
				class="hint has-slotted"
			>
				{#if hintSnippet}
					{@render hintSnippet()}
				{:else}
					{hint}
				{/if}
			</div>
		{/if}
	</fieldset>
</div>
