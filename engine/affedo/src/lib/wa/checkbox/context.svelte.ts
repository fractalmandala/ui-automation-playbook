/**
 * Forward-compatible group coordination for `wa-checkbox-group` (and `wa-switch`
 * slotted inside it). The group port will `setContext(CHECKBOX_GROUP_KEY, ctx)`;
 * this leaf reads through it so WA's `syncCheckboxElements()` push-down (group
 * `size` stamped onto each child) disappears — children read the live value.
 *
 * WA's group does not own item state: each checkbox/switch keeps `checked` as
 * `$bindable` and the group only drives it for select-all style patterns via
 * the handle. State is intentionally NOT hoisted into the parent (per
 * lit-to-svelte §2) so `bind:checked` on the leaf keeps working.
 */

export type CheckboxSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'small' | 'medium' | 'large';

/** What a checkbox/switch hands the group so the group can drive it. Replaces `querySelectorAll('wa-checkbox, wa-switch')`. */
export interface CheckboxItemHandle {
	el: HTMLElement;
	readonly disabled: boolean;
	readonly checked: boolean;
	readonly indeterminate: boolean;
	setChecked(checked: boolean): void;
	setIndeterminate(indeterminate: boolean): void;
	focus(options?: FocusOptions): void;
}

export interface CheckboxGroupOptions {
	/** When present, the group's size applies to every grouped item (port of WA's `syncCheckboxElements`). */
	size?: CheckboxSize;
}

export const CHECKBOX_GROUP_KEY = Symbol('wa-checkbox-group');

export class CheckboxGroupContext {
	/** A live view of the group's props. WA's `syncCheckboxElements()` watcher
	 *  becomes children reading through this — there is nothing to push down. */
	#opts: () => CheckboxGroupOptions;
	#items = new Set<CheckboxItemHandle>();

	constructor(opts: () => CheckboxGroupOptions) {
		this.#opts = opts;
	}

	get size() {
		return this.#opts().size;
	}

	register(item: CheckboxItemHandle) {
		this.#items.add(item);
		return () => {
			this.#items.delete(item);
		};
	}

	/** DOM order, resolved on demand: {#if}/{#each} children can mount in any
	 *  order, so registration order is not document order. */
	items(): CheckboxItemHandle[] {
		return [...this.#items].sort((a, b) =>
			a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
		);
	}
}
