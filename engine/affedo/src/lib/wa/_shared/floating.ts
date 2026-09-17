/**
 * Shared floating-positioning subsystem for `wa-*` ports.
 *
 * Port of the positioning machinery in
 * webawesome/src/components/popup/popup.ts, extracted so every floating
 * consumer (popup, and later dropdown, select, popover, color-picker) shares
 * one implementation instead of each vendoring its own.
 *
 * GAP — `@floating-ui/dom` is NOT a dependency of this workspace (see
 * package.json) and must not be installed without asking. This module is
 * therefore a lightweight, dependency-free fallback that implements the same
 * option surface (placement, distance/skidding offset, flip with fallbacks,
 * shift, sync, auto-size, arrow centering, hover bridge) against viewport
 * coordinates. It intentionally differs from Floating UI in three ways:
 *
 * 1. No true middleware pipeline — flip/shift/size run as sequential clamps
 *    against the viewport (or the nearest scroll ancestor when
 *    `boundary="scroll"`). Custom `flipBoundary` / `shiftBoundary` /
 *    `autoSizeBoundary` element(s) are accepted for API compatibility but only
 *    narrow the clip rect when they are scroll ancestors; arbitrary boundary
 *    elements are ignored.
 * 2. No Popover API / top-layer handling — positioning is `position: fixed`
 *    (viewport coordinates), with a best-effort `strategy="absolute"` mode
 *    that re-bases coordinates onto the popup's `offsetParent`.
 * 3. Arrow collision clamping is a simple padding clamp, not Floating UI's
 *    arrow middleware.
 *
 * When `@floating-ui/dom` is approved as a dependency, only this file needs
 * to change: keep every exported name and type, re-implement
 * `computeFloatingPosition` / `autoUpdatePosition` on top of it, and all
 * consumers keep working.
 */

export type Placement =
	| 'top'
	| 'top-start'
	| 'top-end'
	| 'bottom'
	| 'bottom-start'
	| 'bottom-end'
	| 'right'
	| 'right-start'
	| 'right-end'
	| 'left'
	| 'left-start'
	| 'left-end';

export type FloatingStrategy = 'fixed' | 'absolute';
export type FlipFallbackStrategy = 'best-fit' | 'initial';
export type AutoSize = 'horizontal' | 'vertical' | 'both';
export type Sync = 'width' | 'height' | 'both';
export type ArrowPlacement = 'start' | 'end' | 'center' | 'anchor';
export type FloatingBoundary = 'viewport' | 'scroll';

export interface VirtualElement {
	getBoundingClientRect: () => DOMRect;
	contextElement?: Element;
}

export function isVirtualElement(value: unknown): value is VirtualElement {
	return (
		value !== null &&
		typeof value === 'object' &&
		'getBoundingClientRect' in value &&
		('contextElement' in value ? (value as VirtualElement).contextElement instanceof Element : true)
	);
}

export type AnchorTarget = Element | VirtualElement;

export interface FloatingOptions {
	placement?: Placement;
	strategy?: FloatingStrategy;
	boundary?: FloatingBoundary;
	distance?: number;
	skidding?: number;
	arrow?: boolean;
	arrowPlacement?: ArrowPlacement;
	arrowPadding?: number;
	flip?: boolean;
	/** Space-separated placements (`"right bottom"`) or an array. Empty means "the opposite side". */
	flipFallbackPlacements?: string | string[];
	flipFallbackStrategy?: FlipFallbackStrategy;
	flipBoundary?: Element | Element[];
	flipPadding?: number;
	shift?: boolean;
	shiftBoundary?: Element | Element[];
	shiftPadding?: number;
	autoSize?: AutoSize | '';
	sync?: Sync | '';
	autoSizeBoundary?: Element | Element[];
	autoSizePadding?: number;
}

export interface FloatingResult {
	x: number;
	y: number;
	placement: Placement;
	/** Arrow offset relative to the popup box, or `null` on that axis. Mirrors `middlewareData.arrow`. */
	arrowX: number | null;
	arrowY: number | null;
	availableWidth: number | null;
	availableHeight: number | null;
}

export const ALL_PLACEMENTS: readonly Placement[] = [
	'top',
	'top-start',
	'top-end',
	'bottom',
	'bottom-start',
	'bottom-end',
	'right',
	'right-start',
	'right-end',
	'left',
	'left-start',
	'left-end'
] as const;

const OPPOSITE: Record<string, string> = {
	top: 'bottom',
	bottom: 'top',
	left: 'right',
	right: 'left'
};

interface Rect {
	x: number;
	y: number;
	width: number;
	height: number;
}

function toRect(rect: DOMRect | Rect): Rect {
	return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
}

function viewportRect(padding = 0): Rect {
	if (typeof window === 'undefined' || typeof document === 'undefined') {
		return { x: 0, y: 0, width: 0, height: 0 };
	}
	const width = window.innerWidth || document.documentElement.clientWidth || 0;
	const height = window.innerHeight || document.documentElement.clientHeight || 0;
	return { x: 0 - padding, y: 0 - padding, width: width + padding * 2, height: height + padding * 2 };
}

function intersect(a: Rect, b: Rect): Rect {
	const x = Math.max(a.x, b.x);
	const y = Math.max(a.y, b.y);
	const right = Math.min(a.x + a.width, b.x + b.width);
	const bottom = Math.min(a.y + a.height, b.y + b.height);
	return { x, y, width: Math.max(0, right - x), height: Math.max(0, bottom - y) };
}

function isScrollable(el: Element): boolean {
	let style: CSSStyleDeclaration;
	try {
		const view = el.ownerDocument.defaultView;
		if (!view) return false;
		style = view.getComputedStyle(el);
	} catch {
		return false;
	}
	const overflow = `${style.overflow}${style.overflowX}${style.overflowY}`;
	return /(auto|scroll)/.test(overflow);
}

/** Nearest scrollable ancestor's client rect, in viewport coordinates. */
function scrollAncestorRect(el: Element): Rect | null {
	let parent = el.parentElement;
	while (parent) {
		if (isScrollable(parent)) {
			const rect = parent.getBoundingClientRect();
			return toRect(rect);
		}
		parent = parent.parentElement;
	}
	return null;
}

/**
 * The clipping area for flip/shift/auto-size. `viewport` is the viewport;
 * `scroll` additionally intersects the nearest scroll ancestor — the pragmatic
 * stand-in for Floating UI's overflow-ancestor boundary (see module GAP note).
 */
export function getClippingRect(anchor: AnchorTarget, boundary: FloatingBoundary = 'viewport'): Rect {
	const viewport = viewportRect();
	if (boundary !== 'scroll' || !(anchor instanceof Element)) return viewport;
	const scrollRect = scrollAncestorRect(anchor);
	return scrollRect ? intersect(viewport, scrollRect) : viewport;
}

/** Floating UI mirrors `start`/`end` in RTL; reproduce that before measuring. */
export function resolvePhysicalPlacement(placement: Placement, isRtl: boolean): Placement {
	if (!isRtl) return placement;
	if (placement.endsWith('-start')) return placement.replace(/-start$/, '-end') as Placement;
	if (placement.endsWith('-end')) return placement.replace(/-end$/, '-start') as Placement;
	return placement;
}

function oppositePlacement(placement: Placement): Placement {
	const [side, align] = placement.split('-');
	const opposite = OPPOSITE[side] ?? side;
	return (align ? `${opposite}-${align}` : opposite) as Placement;
}

/**
 * Base position for one placement: the popup sits outside the anchor on the
 * placement side. `distance` pushes along the placement axis (Floating UI
 * `offset.mainAxis`), `skidding` slides along the anchor axis
 * (`offset.crossAxis`).
 */
function basePosition(
	placement: Placement,
	anchor: Rect,
	popup: { width: number; height: number },
	distance: number,
	skidding: number
): { x: number; y: number } {
	const anchorCx = anchor.x + anchor.width / 2;
	const anchorCy = anchor.y + anchor.height / 2;
	switch (placement) {
		case 'top':
			return { x: anchorCx - popup.width / 2 + skidding, y: anchor.y - popup.height - distance };
		case 'top-start':
			return { x: anchor.x + skidding, y: anchor.y - popup.height - distance };
		case 'top-end':
			return { x: anchor.x + anchor.width - popup.width - skidding, y: anchor.y - popup.height - distance };
		case 'bottom':
			return { x: anchorCx - popup.width / 2 + skidding, y: anchor.y + anchor.height + distance };
		case 'bottom-start':
			return { x: anchor.x + skidding, y: anchor.y + anchor.height + distance };
		case 'bottom-end':
			return {
				x: anchor.x + anchor.width - popup.width - skidding,
				y: anchor.y + anchor.height + distance
			};
		case 'left':
			return { x: anchor.x - popup.width - distance, y: anchorCy - popup.height / 2 + skidding };
		case 'left-start':
			return { x: anchor.x - popup.width - distance, y: anchor.y + skidding };
		case 'left-end':
			return {
				x: anchor.x - popup.width - distance,
				y: anchor.y + anchor.height - popup.height - skidding
			};
		case 'right':
			return { x: anchor.x + anchor.width + distance, y: anchorCy - popup.height / 2 + skidding };
		case 'right-start':
			return { x: anchor.x + anchor.width + distance, y: anchor.y + skidding };
		case 'right-end':
			return {
				x: anchor.x + anchor.width + distance,
				y: anchor.y + anchor.height - popup.height - skidding
			};
	}
}

/** Total overflow of a placed popup beyond the clip rect (0 fits). */
function totalOverflow(
	x: number,
	y: number,
	popup: { width: number; height: number },
	clip: Rect,
	padding: number
): number {
	const overTop = clip.y + padding - y;
	const overLeft = clip.x + padding - x;
	const overBottom = y + popup.height - (clip.y + clip.height - padding);
	const overRight = x + popup.width - (clip.x + clip.width - padding);
	return (
		Math.max(0, overTop) + Math.max(0, overLeft) + Math.max(0, overBottom) + Math.max(0, overRight)
	);
}

function parseFallbacks(fallbacks: string | string[] | undefined, preferred: Placement): Placement[] {
	const list = (Array.isArray(fallbacks) ? fallbacks : (fallbacks ?? '').split(' '))
		.map((p) => p.trim())
		.filter((p): p is Placement => (ALL_PLACEMENTS as readonly string[]).includes(p));
	if (list.length > 0) return list;
	const opposite = oppositePlacement(preferred);
	return opposite === preferred ? [] : [opposite];
}

/**
 * Pure position computation — the fallback equivalent of Floating UI's
 * `computePosition` with the popup's middleware stack (offset → sync is
 * applied by the caller → flip → shift → size → arrow). Pure so dropdown /
 * select / popover / color-picker can reuse it (and unit-test it) without a
 * DOM.
 */
export function computeFloatingPosition(
	anchorRect: DOMRect | Rect,
	popupSize: { width: number; height: number },
	options: FloatingOptions = {},
	clip?: Rect,
	isRtl = false
): FloatingResult {
	const {
		placement = 'top',
		distance = 0,
		skidding = 0,
		flip = false,
		flipFallbackPlacements = '',
		flipFallbackStrategy = 'best-fit',
		flipPadding = 0,
		shift = false,
		shiftPadding = 0,
		autoSize = '',
		autoSizePadding = 0
	} = options;

	const anchor = toRect(anchorRect);
	const clipRect = clip ?? viewportRect();
	const preferred = resolvePhysicalPlacement(placement, isRtl);

	// Flip: walk preferred + fallbacks, keep the first that fits; otherwise
	// fall back per strategy. Each candidate is measured with offset applied,
	// exactly like the middleware order in the source.
	let chosen = preferred;
	if (flip) {
		const candidates = [preferred, ...parseFallbacks(flipFallbackPlacements, preferred)];
		const fits = candidates.find(
			(candidate) =>
				totalOverflow(
					...(() => {
						const p = basePosition(candidate, anchor, popupSize, distance, skidding);
						return [p.x, p.y] as const;
					})(),
					popupSize,
					clipRect,
					flipPadding
				) <= 0
		);
		if (fits) {
			chosen = fits;
		} else if (flipFallbackStrategy === 'best-fit') {
			let best = preferred;
			let bestOverflow = Number.POSITIVE_INFINITY;
			for (const candidate of candidates) {
				const p = basePosition(candidate, anchor, popupSize, distance, skidding);
				const overflow = totalOverflow(p.x, p.y, popupSize, clipRect, flipPadding);
				if (overflow < bestOverflow) {
					bestOverflow = overflow;
					best = candidate;
				}
			}
			chosen = best;
		} else {
			chosen = preferred;
		}
	}

	let { x, y } = basePosition(chosen, anchor, popupSize, distance, skidding);

	// Shift: slide along the cross axis back into view.
	if (shift) {
		const side = chosen.split('-')[0];
		if (side === 'top' || side === 'bottom') {
			const min = clipRect.x + shiftPadding;
			const max = clipRect.x + clipRect.width - shiftPadding - popupSize.width;
			x = max >= min ? Math.min(Math.max(x, min), max) : min;
		} else {
			const min = clipRect.y + shiftPadding;
			const max = clipRect.y + clipRect.height - shiftPadding - popupSize.height;
			y = max >= min ? Math.min(Math.max(y, min), max) : min;
		}
	}

	// Size: report the space remaining before the clip edge, like the source's
	// `size` middleware feeding `--auto-size-available-*`.
	let availableWidth: number | null = null;
	let availableHeight: number | null = null;
	if (autoSize === 'horizontal' || autoSize === 'both') {
		availableWidth = Math.max(0, clipRect.x + clipRect.width - autoSizePadding - x);
	}
	if (autoSize === 'vertical' || autoSize === 'both') {
		availableHeight = Math.max(0, clipRect.y + clipRect.height - autoSizePadding - y);
	}

	// Arrow: center on the anchor, like `middlewareData.arrow`. Clamping to
	// `arrowPadding` happens in the component, which knows the rendered sizes.
	const side = chosen.split('-')[0];
	const anchorCx = anchor.x + anchor.width / 2;
	const anchorCy = anchor.y + anchor.height / 2;
	const arrowX = side === 'top' || side === 'bottom' ? anchorCx - x : null;
	const arrowY = side === 'left' || side === 'right' ? anchorCy - y : null;

	return { x, y, placement: chosen, arrowX, arrowY, availableWidth, availableHeight };
}

/**
 * Element-level driver: measures both elements, runs the pure computation,
 * and writes every style the source's middleware stack wrote — sync sizes,
 * `left`/`top`, and the `--auto-size-available-*` vars on `host` (the popup
 * root, which is what the stylesheet reads them from). Returns the raw result
 * so the caller can finish arrow placement. `null` when there is nothing to
 * position (SSR / missing rects).
 */
export function positionFloatingElements(
	anchor: AnchorTarget,
	popup: HTMLElement,
	host: HTMLElement | null,
	options: FloatingOptions = {},
	isRtl = false
): FloatingResult | null {
	if (typeof window === 'undefined') return null;

	const anchorRect = anchor.getBoundingClientRect();
	const popupRect = popup.getBoundingClientRect();

	const { sync = '', autoSize = '' } = options;

	// Sync first, like the source middleware order, then re-measure so the
	// placement below uses the synced size.
	if (sync === 'width' || sync === 'both') {
		popup.style.width = `${anchorRect.width}px`;
	} else {
		popup.style.width = '';
	}
	if (sync === 'height' || sync === 'both') {
		popup.style.height = `${anchorRect.height}px`;
	} else {
		popup.style.height = '';
	}
	const syncedSize =
		sync !== '' && sync !== undefined
			? popup.getBoundingClientRect()
			: popupRect;
	const popupSize = { width: syncedSize.width, height: syncedSize.height };

	const clip = getClippingRect(anchor, options.boundary ?? 'viewport');
	const result = computeFloatingPosition(anchorRect, popupSize, options, clip, isRtl);

	let { x, y } = result;
	if ((options.strategy ?? 'fixed') === 'absolute') {
		// Viewport coordinates re-based onto the offset parent — the fallback
		// equivalent of Floating UI's `absolute` strategy (see module GAP note).
		const parent = popup.offsetParent as HTMLElement | null;
		if (parent) {
			const parentRect = parent.getBoundingClientRect();
			x -= parentRect.left;
			y -= parentRect.top;
		}
	}

	popup.style.left = `${x}px`;
	popup.style.top = `${y}px`;

	if (host) {
		if (autoSize === 'vertical' || autoSize === 'both') {
			host.style.setProperty('--auto-size-available-height', `${result.availableHeight}px`);
		} else {
			host.style.removeProperty('--auto-size-available-height');
		}
		if (autoSize === 'horizontal' || autoSize === 'both') {
			host.style.setProperty('--auto-size-available-width', `${result.availableWidth}px`);
		} else {
			host.style.removeProperty('--auto-size-available-width');
		}
	}

	return { ...result, x, y };
}

/**
 * Fallback for Floating UI's `autoUpdate`: re-runs `update` on scroll
 * (captured, so ancestor scrollers are covered), viewport resize, and size
 * changes of either element. Returns a cleanup, like Floating UI.
 */
export function autoUpdatePosition(
	anchor: AnchorTarget,
	popup: HTMLElement,
	update: () => void
): () => void {
	if (typeof window === 'undefined') return () => {};
	update();
	const scrollOptions: AddEventListenerOptions = { capture: true, passive: true };
	window.addEventListener('scroll', update, scrollOptions);
	window.addEventListener('resize', update);
	let observer: ResizeObserver | null = null;
	if (typeof ResizeObserver !== 'undefined') {
		observer = new ResizeObserver(update);
		if (anchor instanceof Element) observer.observe(anchor);
		observer.observe(popup);
	}
	return () => {
		window.removeEventListener('scroll', update, scrollOptions);
		window.removeEventListener('resize', update);
		observer?.disconnect();
	};
}

/**
 * Verbatim port of `WaPopup.updateHoverBridge`: writes the invisible
 * hover-bridge polygon (anchor rect → popup rect) as custom properties on the
 * host. Takes rects so the caller can measure after the new position is
 * applied; no-op unless bridging is enabled.
 */
export function updateHoverBridge(
	host: HTMLElement,
	anchorRect: DOMRect | Rect,
	popupRect: DOMRect | Rect,
	placement: Placement,
	enabled: boolean
): void {
	if (!enabled) return;
	const anchor = toRect(anchorRect);
	const popup = toRect(popupRect);
	const isVertical = placement.includes('top') || placement.includes('bottom');
	let topLeftX = 0;
	let topLeftY = 0;
	let topRightX = 0;
	let topRightY = 0;
	let bottomLeftX = 0;
	let bottomLeftY = 0;
	let bottomRightX = 0;
	let bottomRightY = 0;

	if (isVertical) {
		if (anchor.y < popup.y) {
			// Anchor is above
			topLeftX = anchor.x;
			topLeftY = anchor.y + anchor.height;
			topRightX = anchor.x + anchor.width;
			topRightY = anchor.y + anchor.height;

			bottomLeftX = popup.x;
			bottomLeftY = popup.y;
			bottomRightX = popup.x + popup.width;
			bottomRightY = popup.y;
		} else {
			// Anchor is below
			topLeftX = popup.x;
			topLeftY = popup.y + popup.height;
			topRightX = popup.x + popup.width;
			topRightY = popup.y + popup.height;

			bottomLeftX = anchor.x;
			bottomLeftY = anchor.y;
			bottomRightX = anchor.x + anchor.width;
			bottomRightY = anchor.y;
		}
	} else {
		if (anchor.x < popup.x) {
			// Anchor is on the left
			topLeftX = anchor.x + anchor.width;
			topLeftY = anchor.y;
			topRightX = popup.x;
			topRightY = popup.y;

			bottomLeftX = anchor.x + anchor.width;
			bottomLeftY = anchor.y + anchor.height;
			bottomRightX = popup.x;
			bottomRightY = popup.y + popup.height;
		} else {
			// Anchor is on the right
			topLeftX = popup.x + popup.width;
			topLeftY = popup.y;
			topRightX = anchor.x;
			topRightY = anchor.y;

			bottomLeftX = popup.x + popup.width;
			bottomLeftY = popup.y + popup.height;
			bottomRightX = anchor.x;
			bottomRightY = anchor.y + anchor.height;
		}
	}

	host.style.setProperty('--hover-bridge-top-left-x', `${topLeftX}px`);
	host.style.setProperty('--hover-bridge-top-left-y', `${topLeftY}px`);
	host.style.setProperty('--hover-bridge-top-right-x', `${topRightX}px`);
	host.style.setProperty('--hover-bridge-top-right-y', `${topRightY}px`);
	host.style.setProperty('--hover-bridge-bottom-left-x', `${bottomLeftX}px`);
	host.style.setProperty('--hover-bridge-bottom-left-y', `${bottomLeftY}px`);
	host.style.setProperty('--hover-bridge-bottom-right-x', `${bottomRightX}px`);
	host.style.setProperty('--hover-bridge-bottom-right-y', `${bottomRightY}px`);
}

/** Removes every custom property the floating engine writes (stop/teardown path). */
export function clearFloatingVars(host: HTMLElement): void {
	host.style.removeProperty('--auto-size-available-width');
	host.style.removeProperty('--auto-size-available-height');
	host.style.removeProperty('--hover-bridge-top-left-x');
	host.style.removeProperty('--hover-bridge-top-left-y');
	host.style.removeProperty('--hover-bridge-top-right-x');
	host.style.removeProperty('--hover-bridge-top-right-y');
	host.style.removeProperty('--hover-bridge-bottom-left-x');
	host.style.removeProperty('--hover-bridge-bottom-left-y');
	host.style.removeProperty('--hover-bridge-bottom-right-x');
	host.style.removeProperty('--hover-bridge-bottom-right-y');
}
