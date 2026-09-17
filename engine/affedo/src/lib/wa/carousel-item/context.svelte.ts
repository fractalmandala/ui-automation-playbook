/** Forward-compatible group contract for the future Carousel parent port.
 *  WA's carousel discovers slides by scanning `this.children` for the
 *  `wa-carousel-item` tag and pushes no props onto them, so the item works
 *  standalone today. When the parent is ported it should `setContext` with a
 *  `CarouselContext` (this class, extended with scroll/navigation state) and
 *  drive slides through the registered handles in DOM order — the same shape
 *  as the accordion's `AccordionContext`. Replaces tag-name introspection. */

/** What an item hands the group so the group can drive it. */
export interface CarouselItemHandle {
	el: HTMLElement;
}

export const CAROUSEL_KEY = Symbol('wa-carousel');

export class CarouselContext {
	#items = new Set<CarouselItemHandle>();

	register(item: CarouselItemHandle) {
		this.#items.add(item);
		return () => this.#items.delete(item);
	}

	/** DOM order, resolved on demand: {#if}/{#each} children can mount in any
	 *  order, so registration order is not document order. */
	items(): CarouselItemHandle[] {
		return [...this.#items].sort((a, b) =>
			a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
		);
	}
}
