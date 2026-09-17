<script lang="ts">
	import { setContext, type Snippet } from 'svelte';
	import {
		CHECKBOX_GROUP_KEY,
		CheckboxGroupContext,
		type CheckboxSize
	} from '../checkbox/context.svelte.js';
	import '../_shared/wa-styles/component/form-control.css';
	import './checkbox-group.css';

	export type CheckboxGroupOrientation = 'horizontal' | 'vertical';

	interface Props {
		/** The checkbox group's label. */
		label?: string;
		/** The checkbox group's hint text. */
		hint?: string;
		/** The orientation in which to show grouped checkboxes. */
		orientation?: CheckboxGroupOrientation;
		/** The group's size. When present, applied to all checkboxes inside. */
		size?: CheckboxSize;
		/** Indicates that at least one option should be selected (visual indicator on label). */
		required?: boolean;
		/** Custom label markup. */
		labelSnippet?: Snippet;
		/** Custom hint markup. */
		hintSnippet?: Snippet;
		/** Grouped checkboxes and switches. */
		children?: Snippet;
	}

	let {
		label = '',
		hint = '',
		orientation = 'vertical',
		size = undefined,
		required = false,
		labelSnippet,
		hintSnippet,
		children
	}: Props = $props();

	const ctx = new CheckboxGroupContext(() => ({ size }));
	setContext(CHECKBOX_GROUP_KEY, ctx);

	const uid = $props.id();
	const labelId = `${uid}-label`;
	const hintId = `${uid}-hint`;

	const hasLabel = $derived(Boolean(label || labelSnippet));
	const hasHint = $derived(Boolean(hint || hintSnippet));
</script>

<div
	class="wa-checkbox-group"
	data-orientation={orientation}
	data-size={size}
	data-required={required ? '' : undefined}
>
	<fieldset
		part="form-control"
		class="form-control"
		class:checkbox-group-required={required}
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
			role="group"
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
