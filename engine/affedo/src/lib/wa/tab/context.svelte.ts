/**
 * Forward-compatible group coordination for the future `TabGroup` parent port.
 * The group will `setContext(TAB_GROUP_KEY, ctx)`; these leaves read through it
 * so WA's slot-introspection + prop push-down disappears for reactive state —
 * children drive selection through the context (accordion pattern, lit-to-svelte §2).
 *
 * WA's group discovers tabs/panels via `slot.assignedElements()` filtered by
 * tag name (`getAllTabs()` / `getAllPanels()`) and pushes `active` + `tabIndex`
 * onto every tab and `active` onto every panel in `setActiveTab()`. The Svelte
 * port splits that push: `active` is owned by each leaf as `$bindable` and the
 * group drives it via the handle (`setActive()`), while the roving `tabindex`
 * converges declaratively from `active`/`disabled` (radio precedent) with an
 * imperative `el.tabIndex` fix-up for manual-activation focus moves, where
 * focus roves without changing `active` (port of WA's `handleKeyDown` manual
 * branch). DOM-order position and the `aria-controls` / `aria-labelledby`
 * linkage stay imperative helpers here (`tabs()` / `panels()` sorted on demand,
 * `setAriaLabels()`) because document order is only known via
 * `compareDocumentPosition` (accordion precedent).
 *
 * Ownership (lit-to-svelte §2): each leaf owns its `active` as `$bindable`;
 * the group never hoists it, so `bind:active` on a leaf keeps working. The
 * group's `active` (panel name) is the single source of truth for *which*
 * panel shows; selection flows leaf→group through `setActiveTab()` → the
 * `onActiveChange` callback, and group→leaf through `syncActive()` (port of
 * WA's `@watch('active') updateActiveTab()`). Show/hide notifications flow
 * through `onShow` / `onHide` (port of WA's `WaTabShowEvent` /
 * `WaTabHideEvent`, both `{ name: string }` and non-cancelable, so the return
 * value is ignored).
 */

export type TabPlacement = 'top' | 'bottom' | 'start' | 'end';
export type TabActivation = 'auto' | 'manual';

/** What a tab hands the group so the group can drive it. Replaces `querySelectorAll('wa-tab')`. */
export interface TabHandle {
	el: HTMLElement;
	/** The `panel` attribute: the `name` of the panel this tab activates. */
	readonly panel: string;
	readonly disabled: boolean;
	readonly active: boolean;
	/** Reflect group selection. Called by `setActiveTab()` and `syncActive()`. */
	setActive(active: boolean): void;
	focus(options?: FocusOptions): void;
}

/** What a panel hands the group so the group can drive it. Replaces `querySelectorAll('wa-tab-panel')`. */
export interface TabPanelHandle {
	el: HTMLElement;
	/** The panel's `name`, matched against `TabHandle.panel`. */
	readonly name: string;
	readonly active: boolean;
	/** Reflect group selection (`el.name === activeTab.panel`). */
	setActive(active: boolean): void;
}

export interface TabGroupOptions {
	/** The `name`/`panel` of the visible panel. Leaves reflect it via `syncActive()`; user selection flows back through `onActiveChange`. */
	active: string;
	/** Which edge the tabs sit on. Drives arrow-key orientation in `keydown()` (port of WA's `placement` branches). */
	placement: TabPlacement;
	/** `auto` activates on arrow-move; `manual` roves focus until Enter/Space (port of WA's `activation`). */
	activation: TabActivation;
}

export interface TabGroupHandlers {
	/** The visible panel changed — the future group sets its own `active` prop from this (port of WA's `this.active = tab.panel`). Always called when selection changes, even when `emitEvents` is false (initial activation still updates `active`). */
	onActiveChange?: (active: string) => void;
	/** Port of `WaTabShowEvent` (`{ name }`, non-cancelable). */
	onShow?: (detail: { name: string }) => void;
	/** Port of `WaTabHideEvent` (`{ name }`, non-cancelable). */
	onHide?: (detail: { name: string }) => void;
}

export const TAB_GROUP_KEY = Symbol('wa-tab-group');

function isRtl(el: HTMLElement): boolean {
	const closest = el.closest('[dir]') as HTMLElement | null;
	const dir =
		closest?.getAttribute('dir') ??
		el.ownerDocument?.documentElement?.getAttribute('dir') ??
		'_ltr';
	return dir === 'rtl';
}

export class TabGroupContext {
	/** A live view of the group's props. WA's `syncTabsAndPanels()` cache
	 *  becomes registration sets read on demand — there is nothing to push down. */
	#opts: () => TabGroupOptions;
	#handlers: TabGroupHandlers;
	#tabs = new Set<TabHandle>();
	#panels = new Set<TabPanelHandle>();

	constructor(opts: () => TabGroupOptions, handlers: TabGroupHandlers = {}) {
		this.#opts = opts;
		this.#handlers = handlers;
	}

	get active() {
		return this.#opts().active;
	}

	get placement() {
		return this.#opts().placement;
	}

	get activation() {
		return this.#opts().activation;
	}

	registerTab(item: TabHandle) {
		this.#tabs.add(item);
		return () => {
			this.#tabs.delete(item);
		};
	}

	registerPanel(item: TabPanelHandle) {
		this.#panels.add(item);
		return () => {
			this.#panels.delete(item);
		};
	}

	/** DOM order, resolved on demand: `{#if}`/`{#each}` children can mount in any
	 *  order, so registration order is not document order. */
	tabs(): TabHandle[] {
		return [...this.#tabs].sort((a, b) =>
			a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
		);
	}

	/** DOM order, resolved on demand (see `tabs()`). */
	panels(): TabPanelHandle[] {
		return [...this.#panels].sort((a, b) =>
			a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
		);
	}

	/** Port of WA's `focusableTabs` cache (`tabs.filter(el => !el.disabled)`). */
	focusableTabs(): TabHandle[] {
		return this.tabs().filter((tab) => !tab.disabled);
	}

	/**
	 * Port of WA's `setActiveTab()`. Syncs every tab's `active` + roving
	 * `tabIndex` and every panel's `active` (`el.name === tab.panel`), then
	 * notifies the group. No-ops when `tab` is disabled or already active
	 * (port of WA's `tab !== this.activeTab && !tab.disabled` guard).
	 * Scrolling (`scrollIntoView`) stays with the future group, which owns the
	 * `.nav` element — the context only owns selection state.
	 */
	setActiveTab(tab: TabHandle, options?: { emitEvents?: boolean }) {
		const emitEvents = options?.emitEvents ?? true;
		if (tab.disabled) return;
		const tabs = this.tabs();
		if (!tabs.includes(tab)) return;
		const current = tabs.find((t) => t.active);
		if (tab === current) return;

		for (const t of tabs) {
			const should = t === tab;
			if (t.active !== should) t.setActive(should);
			// Imperative fix-up so the tab order is correct synchronously;
			// leaves also derive this declaratively and converge on next render
			// (radio precedent). Required for manual-activation focus moves,
			// where `active` does not change at all.
			t.el.tabIndex = should ? 0 : -1;
		}

		for (const p of this.panels()) {
			const should = p.name === tab.panel;
			if (p.active !== should) p.setActive(should);
		}

		// WA always assigns `this.active`, even on the silent initial activation.
		this.#handlers.onActiveChange?.(tab.panel);
		if (emitEvents) {
			if (current) this.#handlers.onHide?.({ name: current.panel });
			this.#handlers.onShow?.({ name: tab.panel });
		}
	}

	/**
	 * Reflect an externally set group `active` (e.g. `bind:active` or the
	 * `active` attribute for SSR) onto the leaves. The future group calls this
	 * from a `$effect` on its `active` (port of WA's `@watch('active')
	 * updateActiveTab()`).
	 */
	syncActive(active: string) {
		const tab = this.tabs().find((t) => t.panel === active);
		if (tab) this.setActiveTab(tab);
	}

	/**
	 * Port of WA's `setAriaLabels()`: links each tab to its panel via
	 * `aria-controls` / `aria-labelledby`, resolved from element ids the leaves
	 * generate with `$props.id()`. The future group calls this after mount and
	 * whenever tabs/panels register (port of WA's `MutationObserver` +
	 * `IntersectionObserver` aria pass).
	 */
	setAriaLabels() {
		for (const tab of this.tabs()) {
			const panel = this.panels().find((p) => p.name === tab.panel);
			if (panel) {
				if (panel.el.id) tab.el.setAttribute('aria-controls', panel.el.id);
				if (tab.el.id) panel.el.setAttribute('aria-labelledby', tab.el.id);
			}
		}
	}

	private findNextFocusableTab(
		tabs: TabHandle[],
		currentIndex: number,
		direction: 'forward' | 'backward'
	): TabHandle | null {
		const focusable = tabs.filter((t) => !t.disabled);
		if (focusable.length === 0) return null;
		let next: TabHandle | null = null;
		const iterator = direction === 'forward' ? 1 : -1;
		let nextIndex = currentIndex + iterator;

		while (currentIndex < tabs.length) {
			next = tabs[nextIndex] ?? null;
			if (next === null) {
				// Wrapping (port of WA's comment): forward past the end jumps to
				// the first focusable, backward past the start to the last.
				next = direction === 'forward' ? focusable[0] : focusable[focusable.length - 1];
				break;
			}
			if (!next.disabled) break;
			nextIndex += iterator;
		}

		return next;
	}

	/**
	 * Port of WA's group-level `handleKeyDown`. Enter/Space activates the
	 * current tab; arrows move focus (wrapping, skipping disabled) and activate
	 * immediately when `activation` is `auto`, or rove `tabIndex` only when
	 * `manual` (WA's `tabs.forEach(tabEl => tabEl.tabIndex = …)` branch, kept
	 * imperative because `active` does not change). Orientation follows
	 * `placement` + RTL exactly as in WA.
	 */
	keydown(event: KeyboardEvent, current: TabHandle) {
		const tabs = this.tabs();
		if (!tabs.includes(current)) return;

		// Activate a tab (port of WA's `['Enter', ' '].includes(event.key)` branch).
		if (event.key === 'Enter' || event.key === ' ') {
			this.setActiveTab(current);
			event.preventDefault();
			return;
		}

		if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key))
			return;

		const focusable = tabs.filter((t) => !t.disabled);
		if (focusable.length === 0) return;

		const rtl = isRtl(current.el);
		const placement = this.#opts().placement;
		let next: TabHandle | null = null;

		if (event.key === 'Home') {
			next = focusable[0];
		} else if (event.key === 'End') {
			next = focusable[focusable.length - 1];
		} else if (
			(['top', 'bottom'].includes(placement) && event.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) ||
			(['start', 'end'].includes(placement) && event.key === 'ArrowUp')
		) {
			next = this.findNextFocusableTab(tabs, tabs.indexOf(current), 'backward');
		} else if (
			(['top', 'bottom'].includes(placement) && event.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) ||
			(['start', 'end'].includes(placement) && event.key === 'ArrowDown')
		) {
			next = this.findNextFocusableTab(tabs, tabs.indexOf(current), 'forward');
		}

		if (!next) return;

		next.el.tabIndex = 0;
		next.focus({ preventScroll: true });

		if (this.#opts().activation === 'auto') {
			this.setActiveTab(next);
		} else {
			for (const tab of tabs) tab.el.tabIndex = tab === next ? 0 : -1;
		}

		// Horizontal scroll-into-view stays with the future group, which owns `.nav`.
		event.preventDefault();
	}

	/**
	 * Port of WA's `updateTabIndexes()` intent for the Svelte tree: the active
	 * tab (or the first enabled one when none is active) is tabbable,
	 * everything else is `-1`. Leaves already derive this; the future group
	 * calls this after mount to repair the DOM synchronously (radio
	 * `updateTabIndexes()` precedent), covering the initial none-active state
	 * before the first `setActiveTab()`.
	 */
	updateTabIndexes() {
		const tabs = this.tabs();
		const enabled = tabs.filter((t) => !t.disabled);
		const active = enabled.find((t) => t.active);
		const tabbable = active ?? enabled[0];
		for (const tab of tabs) {
			tab.el.tabIndex = tab.disabled ? -1 : tab === tabbable ? 0 : -1;
		}
	}

	/** Focus the active tab, else the first enabled one (mirrors WA's nav-focus fallback). */
	focus() {
		const tabs = this.tabs();
		const target =
			tabs.find((t) => t.active && !t.disabled) ?? tabs.find((t) => !t.disabled);
		target?.focus();
	}
}
