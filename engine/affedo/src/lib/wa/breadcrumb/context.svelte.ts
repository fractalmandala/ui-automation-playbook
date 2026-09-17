import type { Snippet } from 'svelte';

/** What an item hands the group so the group can drive it. Replaces `assignedElements()`. */
export interface BreadcrumbItemHandle {
	el: HTMLElement;
}

export interface BreadcrumbOptions {
	separator?: Snippet;
}

export const BREADCRUMB_KEY = Symbol('wa-breadcrumb');

export class BreadcrumbContext {
	/** A live view of the group's props. WA's handleSlotChange() push-down becomes
	 *  children reading through this — there is nothing to clone or sync. */
	#opts: () => BreadcrumbOptions;
	#items = new Set<BreadcrumbItemHandle>();

	/** Bumped on register/unregister so `isLast()` stays reactive.
	 *  Accordion needs no reactivity off its set; breadcrumb derives
	 *  `aria-current="page"` for the last item, so it does. */
	version = $state(0);

	constructor(opts: () => BreadcrumbOptions) {
		this.#opts = opts;
	}

	get separator() {
		return this.#opts().separator;
	}

	register(item: BreadcrumbItemHandle) {
		this.#items.add(item);
		this.version++;
		return () => {
			this.#items.delete(item);
			this.version++;
		};
	}

	/** DOM order, resolved on demand: {#if}/{#each} children can mount in any
	 *  order, so registration order is not document order. */
	items(): BreadcrumbItemHandle[] {
		void this.version;
		return [...this.#items].sort((a, b) =>
			a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
		);
	}

	/** WA marks the last `wa-breadcrumb-item` with `aria-current="page"`.
	 *  The stylesheet hides the last separator via `:last-of-type`; this is the
	 *  AT equivalent, resolved from the same registration set. */
	isLast(item: BreadcrumbItemHandle): boolean {
		const all = this.items();
		return all.length > 0 && all[all.length - 1] === item;
	}
}
