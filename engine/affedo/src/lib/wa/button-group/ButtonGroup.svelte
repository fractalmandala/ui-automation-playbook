<script lang="ts">
	import type { Snippet } from 'svelte';
	import './button-group.css';

	export type ButtonGroupOrientation = 'horizontal' | 'vertical';

	interface Props {
		/** A label to use for the button group (announced by screen readers). */
		label?: string;
		/** The button group's orientation. */
		orientation?: ButtonGroupOrientation;
		/** Set true to disable the role="group" attribute (e.g. for segmented controls). */
		disableRole?: boolean;
		/** The buttons to display in the button group. */
		children?: Snippet;
	}

	let {
		label = '',
		orientation = 'horizontal',
		disableRole = false,
		children
	}: Props = $props();

	function findButton(el: HTMLElement) {
		const selector = '.wa-button, .wa-radio-button';
		return el.closest(selector) ?? el.querySelector(selector);
	}

	function handleFocus(event: FocusEvent) {
		const button = findButton(event.target as HTMLElement);
		button?.classList.add('button-focus');
	}

	function handleBlur(event: FocusEvent) {
		const button = findButton(event.target as HTMLElement);
		button?.classList.remove('button-focus');
	}

	function handleMouseOver(event: MouseEvent) {
		const button = findButton(event.target as HTMLElement);
		button?.classList.add('button-hover');
	}

	function handleMouseOut(event: MouseEvent) {
		const button = findButton(event.target as HTMLElement);
		button?.classList.remove('button-hover');
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_mouse_events_have_key_events -->
<div
	class="wa-button-group"
	data-orientation={orientation}
	onfocusin={handleFocus}
	onfocusout={handleBlur}
	onmouseover={handleMouseOver}
	onmouseout={handleMouseOut}
>
	<div
		part="base"
		class="button-group"
		role={disableRole ? 'presentation' : 'group'}
		aria-label={label || undefined}
		aria-orientation={orientation}
	>
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>
