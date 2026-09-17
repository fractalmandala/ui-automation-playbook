/**
 * Forward-compatible group coordination for the future `RadioGroup` parent port.
 * The group will `setContext(RADIO_GROUP_KEY, ctx)`; this leaf reads through it
 * so WA's `syncRadioElements()` push-down disappears for reactive state —
 * children read `name` / `disabled` / `required` / `size` / `orientation` /
 * `value` live (accordion pattern, lit-to-svelte §2).
 *
 * WA's group discovers radios via `querySelectorAll('wa-radio')` and pushes
 * `size`, `forceDisabled`, `checked`, `tabIndex`, and `data-wa-radio-*`
 * position attributes onto them (`syncRadioElements`, `handleRadioClick`,
 * `handleKeyDown` in radio-group.ts). The Svelte port splits that push:
 * `size` / `disabled` are live reads (nothing to push down), while DOM-order
 * position attributes and the roving-`tabindex` fix-up stay imperative helpers
 * here (`syncPositions()`, `updateTabIndexes()`) because they depend on
 * document order, which is only known on demand via `items()`.
 *
 * Ownership (form-association.md): the group `value` is the single source of
 * truth; each leaf keeps `checked` as `$bindable` and the group drives it via
 * the handle (`select()` / `syncValue()`). State is NOT hoisted into the
 * parent, so `bind:checked` on a leaf keeps working. `select()` notifies the
 * group through `onSelect`; the group diffs against its old value before
 * emitting `input` / `change` (port of WA's `oldValue` guard).
 */

export type RadioAppearance = 'default' | 'button';
export type RadioSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'small' | 'medium' | 'large';
export type RadioOrientation = 'horizontal' | 'vertical';

/** What a radio hands the group so the group can drive it. Replaces `querySelectorAll('wa-radio')`. */
export interface RadioHandle {
	el: HTMLElement;
	readonly value: string;
	readonly disabled: boolean;
	readonly checked: boolean;
	/** Reflect group selection. Called by `select()` and `syncValue()`. */
	setChecked(checked: boolean): void;
	/** Imperative escape hatch mirroring WA's `forceDisabled` state (group
	 *  disabled while preserving the leaf's own `disabled`). Prefer the live
	 *  `disabled` read — leaves already OR it with their own flag. */
	setForceDisabled(forceDisabled: boolean): void;
	focus(options?: FocusOptions): void;
}

export interface RadioGroupOptions {
	/** The group's current value. Leaves reflect it via `syncValue()`; user
	 *  selection flows back through `onSelect`. */
	value: string | null;
	/** Submitted as a name/value pair with form data. Leaves read it for their native control. */
	name: string | null;
	/** Disables the group and all child radios (OR-ed with each leaf's own `disabled`). */
	disabled: boolean;
	/** Ensures a child radio is checked before allowing the form to submit. */
	required: boolean;
	/** When present, applies to every grouped radio (port of WA stamping `size` in `syncRadioElements`). */
	size?: RadioSize;
	/** Layout direction; drives the `data-wa-radio-horizontal/vertical` attributes via `syncPositions()`. */
	orientation: RadioOrientation;
}

export const RADIO_GROUP_KEY = Symbol('wa-radio-group');

export class RadioGroupContext {
	/** A live view of the group's props. WA's `sync*()` watchers become
	 *  children reading through this — there is nothing to push down for
	 *  `size` / `disabled` / `name` / `required`. */
	#opts: () => RadioGroupOptions;
	#onSelect?: (value: string, handle: RadioHandle) => void;
	#items = new Set<RadioHandle>();

	constructor(opts: () => RadioGroupOptions, onSelect?: (value: string, handle: RadioHandle) => void) {
		this.#opts = opts;
		this.#onSelect = onSelect;
	}

	get value() {
		return this.#opts().value;
	}

	get name() {
		return this.#opts().name;
	}

	get disabled() {
		return this.#opts().disabled;
	}

	get required() {
		return this.#opts().required;
	}

	get size() {
		return this.#opts().size;
	}

	get orientation() {
		return this.#opts().orientation;
	}

	register(item: RadioHandle) {
		this.#items.add(item);
		return () => {
			this.#items.delete(item);
		};
	}

	/** DOM order, resolved on demand: {#if}/{#each} children can mount in any
	 *  order, so registration order is not document order. */
	items(): RadioHandle[] {
		return [...this.#items].sort((a, b) =>
			a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
		);
	}

	/**
	 * Port of WA's `handleRadioClick` selection half. Checks `handle`,
	 * unchecks every other registered radio, repairs the roving tabindex, and
	 * notifies the group — but only when the group value actually changes
	 * (port of WA's `if (this.value !== oldValue)` emit guard, so re-clicking
	 * the checked radio stays silent).
	 */
	select(handle: RadioHandle) {
		if (handle.disabled) return;
		const previous = this.#opts().value;
		for (const item of this.items()) {
			if (item !== handle && item.checked) item.setChecked(false);
		}
		if (!handle.checked) handle.setChecked(true);
		this.updateTabIndexes();
		if (handle.value !== previous) this.#onSelect?.(handle.value, handle);
	}

	/**
	 * Reflect an externally set group value (e.g. `bind:value`) onto the
	 * leaves. The future group calls this from a `$effect` on its `value`.
	 */
	syncValue(value: string | null) {
		for (const item of this.items()) {
			const should = item.value === value;
			if (item.checked !== should) item.setChecked(should);
		}
		this.updateTabIndexes();
	}

	/**
	 * Port of the positioning half of WA's `syncRadioElements()`: stamps the
	 * `data-wa-radio-*` attributes the stylesheet selects on. The future group
	 * calls this after mount and whenever `orientation` changes.
	 */
	syncPositions() {
		const radios = this.items();
		const horizontal = this.#opts().orientation !== 'vertical';
		radios.forEach((radio, index) => {
			radio.el.toggleAttribute('data-wa-radio-horizontal', horizontal);
			radio.el.toggleAttribute('data-wa-radio-vertical', !horizontal);
			radio.el.toggleAttribute('data-wa-radio-first', index === 0);
			radio.el.toggleAttribute('data-wa-radio-inner', index !== 0 && index !== radios.length - 1);
			radio.el.toggleAttribute('data-wa-radio-last', index === radios.length - 1);
		});
	}

	/**
	 * Port of the `tabIndex` half of WA's `syncRadioElements()` / `updated()`:
	 * the checked radio (or the first enabled one when none is checked) is
	 * tabbable, everything else is `-1`. Leaves also derive this declaratively
	 * and converge after the first selection; this covers the initial
	 * none-checked state.
	 */
	updateTabIndexes() {
		const radios = this.items();
		if (this.#opts().disabled) {
			for (const radio of radios) radio.el.tabIndex = -1;
			return;
		}
		const enabled = radios.filter((radio) => !radio.disabled);
		const checked = enabled.find((radio) => radio.checked);
		const tabbable = checked ?? enabled[0];
		for (const radio of radios) {
			radio.el.tabIndex = radio.disabled ? -1 : radio === tabbable ? 0 : -1;
		}
	}

	/**
	 * Port of WA's group-level `handleKeyDown`: arrow keys move (wrapping),
	 * Space re-selects the current radio. Skips disabled radios. Selection
	 * flows through `select()` so the emit guard still applies.
	 */
	keydown(event: KeyboardEvent, current: RadioHandle) {
		if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) return;
		if (this.#opts().disabled) return;
		const radios = this.items().filter((radio) => !radio.disabled);
		if (radios.length === 0) return;
		event.preventDefault();
		const from = radios.includes(current) ? radios.indexOf(current) : 0;
		const incr = event.key === ' ' ? 0 : ['ArrowUp', 'ArrowLeft'].includes(event.key) ? -1 : 1;
		let index = from + incr;
		if (index < 0) index = radios.length - 1;
		if (index > radios.length - 1) index = 0;
		const next = radios[index];
		this.select(next);
		next.focus();
	}

	/** Port of WA's group `focus()`: focus the checked radio, else the first enabled one. */
	focus() {
		if (this.#opts().disabled) return;
		const radios = this.items();
		const target = radios.find((radio) => radio.checked && !radio.disabled) ?? radios.find((radio) => !radio.disabled);
		target?.focus();
	}
}
