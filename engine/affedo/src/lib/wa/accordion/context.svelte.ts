export type AccordionMode = 'single' | 'single-collapsible' | 'multiple';
export type IconPlacement = 'start' | 'end';
export type Appearance = 'filled' | 'outlined' | 'filled-outlined' | 'plain';

/** What an item hands the group so the group can drive it. Replaces `assignedElements()`. */
export interface ItemHandle {
	el: HTMLElement;
	readonly disabled: boolean;
	readonly expanded: boolean;
	expand(): void;
	collapse(): void;
	focus(): void;
}

export interface GroupOptions {
	mode: AccordionMode;
	iconPlacement: IconPlacement;
	headingLevel: string;
	appearance: Appearance;
}

export const ACCORDION_KEY = Symbol('wa-accordion');

export class AccordionContext {
	/** A live view of the group's props. WA's three sync*() watchers become
	 *  children reading through this — there is nothing to push down. */
	#opts: () => GroupOptions;
	#items = new Set<ItemHandle>();

	constructor(opts: () => GroupOptions) {
		this.#opts = opts;
	}

	get mode() { return this.#opts().mode; }
	get iconPlacement() { return this.#opts().iconPlacement; }
	get headingLevel() { return this.#opts().headingLevel; }
	get appearance() { return this.#opts().appearance; }

	register(item: ItemHandle) {
		this.#items.add(item);
		return () => this.#items.delete(item);
	}

	/** DOM order, resolved on demand: {#if}/{#each} children can mount in any
	 *  order, so registration order is not document order. */
	items(): ItemHandle[] {
		return [...this.#items].sort((a, b) =>
			a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
		);
	}

	toggle(item: ItemHandle) {
		if (item.disabled) return;
		if (item.expanded) {
			if (this.mode === 'single') return;
			item.collapse();
			return;
		}
		if (this.mode !== 'multiple') {
			for (const other of this.items()) if (other !== item && other.expanded) other.collapse();
		}
		item.expand();
	}

	keydown(event: KeyboardEvent, item: ItemHandle) {
		const items = this.items().filter((i) => !i.disabled);
		if (!items.length) return;
		const current = items.indexOf(item);
		if (current === -1) return;

		let next = current;
		switch (event.key) {
			case 'ArrowDown': next = (current + 1) % items.length; break;
			case 'ArrowUp': next = (current - 1 + items.length) % items.length; break;
			case 'Home': next = 0; break;
			case 'End': next = items.length - 1; break;
			default: return;
		}
		event.preventDefault();
		items[next].focus();
	}

	expandAll() {
		if (this.mode !== 'multiple') return;
		for (const item of this.items()) if (!item.disabled && !item.expanded) item.expand();
	}

	collapseAll() {
		for (const item of this.items()) if (item.expanded) item.collapse();
	}
}
