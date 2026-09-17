<script lang="ts">
  import { tick, type Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import './popup.css';

  export type PopupPlacement =
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

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** Activates the positioning logic and shows the popup. */
    active?: boolean;
    /** The preferred placement of the popup. */
    placement?: PopupPlacement;
    /** The element or selector to anchor to. If omitted, uses the anchor slot. */
    anchor?: Element | string | null;
    /** The distance in pixels from which to offset the panel away from its anchor. */
    distance?: number;
    /** The distance in pixels from which to offset the panel along its anchor. */
    skidding?: number;
    /** Attaches an arrow to the popup. */
    arrow?: boolean;
    /** The placement of the arrow. */
    arrowPlacement?: 'start' | 'end' | 'center' | 'anchor';
    /** Padding between arrow and popup edge. */
    arrowPadding?: number;
    /** Automatically flip to opposite side if clipped. */
    flip?: boolean;
    /** Move popup along axis to keep inside viewport. */
    shift?: boolean;
    /** Sync popup size to anchor size. */
    sync?: 'width' | 'height' | 'both';
    /** Emitted when the popup is repositioned. */
    onreposition?: () => void;
    /** Slotted anchor content. */
    anchorSnippet?: Snippet;
    /** Popup content. */
    children?: Snippet;
    class?: string;
  }

  let {
    active = false,
    placement = 'top',
    anchor = null,
    distance = 0,
    skidding = 0,
    arrow = false,
    arrowPlacement = 'anchor',
    arrowPadding = 10,
    flip = true,
    shift = true,
    sync,
    onreposition,
    anchorSnippet,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  let popupEl = $state<HTMLElement>();
  let anchorWrapperEl = $state<HTMLElement>();
  let arrowEl = $state<HTMLElement>();

  let dynamicPlacement = $state<PopupPlacement | undefined>(undefined);
  let resolvedPlacement = $derived(dynamicPlacement ?? placement);
  let coords = $state({ top: 0, left: 0 });
  let arrowCoords = $state<{ top?: number; left?: number; bottom?: number; right?: number }>({});

  function resolveAnchor(): Element | null {
    if (typeof anchor === 'string') {
      return document.getElementById(anchor) || document.querySelector(anchor);
    }
    if (anchor instanceof Element) {
      return anchor;
    }
    if (anchorWrapperEl) {
      return anchorWrapperEl.firstElementChild || anchorWrapperEl;
    }
    return null;
  }

  interface Coords {
    top: number;
    left: number;
  }

  function computeCoords(
    place: PopupPlacement,
    anchorRect: DOMRect,
    popRect: DOMRect,
    dist: number,
    skid: number
  ): Coords {
    const centerX = anchorRect.left + (anchorRect.width - popRect.width) / 2 + skid;
    const centerY = anchorRect.top + (anchorRect.height - popRect.height) / 2 + skid;

    switch (place) {
      case 'top':
        return { top: anchorRect.top - popRect.height - dist, left: centerX };
      case 'top-start':
        return { top: anchorRect.top - popRect.height - dist, left: anchorRect.left + skid };
      case 'top-end':
        return { top: anchorRect.top - popRect.height - dist, left: anchorRect.right - popRect.width - skid };
      case 'bottom':
        return { top: anchorRect.bottom + dist, left: centerX };
      case 'bottom-start':
        return { top: anchorRect.bottom + dist, left: anchorRect.left + skid };
      case 'bottom-end':
        return { top: anchorRect.bottom + dist, left: anchorRect.right - popRect.width - skid };
      case 'left':
        return { top: centerY, left: anchorRect.left - popRect.width - dist };
      case 'left-start':
        return { top: anchorRect.top + skid, left: anchorRect.left - popRect.width - dist };
      case 'left-end':
        return { top: anchorRect.bottom - popRect.height - skid, left: anchorRect.left - popRect.width - dist };
      case 'right':
        return { top: centerY, left: anchorRect.right + dist };
      case 'right-start':
        return { top: anchorRect.top + skid, left: anchorRect.right + dist };
      case 'right-end':
        return { top: anchorRect.bottom - popRect.height - skid, left: anchorRect.right + dist };
    }
  }

  export function reposition() {
    if (!active || !popupEl) return;
    const anchorEl = resolveAnchor();
    if (!anchorEl) return;

    const anchorRect = anchorEl.getBoundingClientRect();
    const popRect = popupEl.getBoundingClientRect();

    if (sync === 'width' || sync === 'both') {
      popupEl.style.width = `${anchorRect.width}px`;
    }
    if (sync === 'height' || sync === 'both') {
      popupEl.style.height = `${anchorRect.height}px`;
    }

    const margin = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const fits = (c: Coords) =>
      c.top >= margin &&
      c.left >= margin &&
      c.top + popRect.height <= vh - margin &&
      c.left + popRect.width <= vw - margin;

    let place = placement;
    let pos = computeCoords(place, anchorRect, popRect, distance, skidding);

    if (flip && !fits(pos)) {
      const primary = place.split('-')[0];
      const opposite: Record<string, string> = {
        top: 'bottom',
        bottom: 'top',
        left: 'right',
        right: 'left'
      };
      const flippedBase = opposite[primary];
      if (flippedBase) {
        const flipped = (
          place.includes('-') ? `${flippedBase}${place.slice(primary.length)}` : flippedBase
        ) as PopupPlacement;
        const alt = computeCoords(flipped, anchorRect, popRect, distance, skidding);
        if (fits(alt)) {
          place = flipped;
          pos = alt;
        }
      }
    }

    dynamicPlacement = place;

    if (shift) {
      coords = {
        top: Math.min(Math.max(pos.top, margin), Math.max(margin, vh - popRect.height - margin)),
        left: Math.min(Math.max(pos.left, margin), Math.max(margin, vw - popRect.width - margin))
      };
    } else {
      coords = pos;
    }

    // Arrow positioning
    if (arrow) {
      const primary = resolvedPlacement.split('-')[0];
      const arrowHalf = 6;
      if (primary === 'top') {
        arrowCoords = {
          bottom: -arrowHalf,
          left: Math.max(arrowPadding, Math.min(popRect.width - arrowPadding, popRect.width / 2 - arrowHalf))
        };
      } else if (primary === 'bottom') {
        arrowCoords = {
          top: -arrowHalf,
          left: Math.max(arrowPadding, Math.min(popRect.width - arrowPadding, popRect.width / 2 - arrowHalf))
        };
      } else if (primary === 'left') {
        arrowCoords = {
          right: -arrowHalf,
          top: Math.max(arrowPadding, Math.min(popRect.height - arrowPadding, popRect.height / 2 - arrowHalf))
        };
      } else if (primary === 'right') {
        arrowCoords = {
          left: -arrowHalf,
          top: Math.max(arrowPadding, Math.min(popRect.height - arrowPadding, popRect.height / 2 - arrowHalf))
        };
      }
    }

    onreposition?.();
  }

  $effect(() => {
    if (active) {
      void tick().then(() => reposition());
      const handleEvent = () => reposition();
      window.addEventListener('scroll', handleEvent, { capture: true, passive: true });
      window.addEventListener('resize', handleEvent, { passive: true });

      return () => {
        window.removeEventListener('scroll', handleEvent, true);
        window.removeEventListener('resize', handleEvent);
      };
    }
  });
</script>

<div
  class="wa-popup {className}"
  data-current-placement={resolvedPlacement}
  {...restProps}
>
  {#if anchorSnippet}
    <div bind:this={anchorWrapperEl} style="display: inline-block;">
      {@render anchorSnippet()}
    </div>
  {/if}

  <div
    bind:this={popupEl}
    class="popup"
    class:popup-active={active}
    part="popup"
    style:top="{coords.top}px"
    style:left="{coords.left}px"
  >
    {#if arrow}
      <div
        bind:this={arrowEl}
        class="arrow"
        part="arrow"
        style:top={arrowCoords.top !== undefined ? `${arrowCoords.top}px` : undefined}
        style:bottom={arrowCoords.bottom !== undefined ? `${arrowCoords.bottom}px` : undefined}
        style:left={arrowCoords.left !== undefined ? `${arrowCoords.left}px` : undefined}
        style:right={arrowCoords.right !== undefined ? `${arrowCoords.right}px` : undefined}
      ></div>
    {/if}

    {#if children}
      {@render children()}
    {/if}
  </div>
</div>
