<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    split?: number;
    orientation?: 'horizontal' | 'vertical';
    min?: number;
    max?: number;
    disabled?: boolean;
    start?: Snippet;
    end?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    split = $bindable(50),
    orientation = 'horizontal',
    min = 10,
    max = 90,
    disabled = false,
    start,
    end,
    class: className = '',
    ...restProps
  }: Props = $props();

  let rootEl: HTMLDivElement | undefined = $state();

  let lo = $derived(Math.min(min, max));
  let hi = $derived(Math.max(min, max));

  function clamp(n: number): number {
    return Math.min(hi, Math.max(lo, n));
  }

  let clampedSplit = $derived(clamp(split));

  function handlePointerDown(e: PointerEvent) {
    if (disabled) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if (disabled || !rootEl) return;
    if (!(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) return;
    const rect = rootEl.getBoundingClientRect();
    const pct = orientation === 'vertical'
      ? ((e.clientY - rect.top) / rect.height) * 100
      : ((e.clientX - rect.left) / rect.width) * 100;
    split = clamp(Math.round(pct * 10) / 10);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (disabled) return;
    const big = e.shiftKey ? 10 : 1;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      split = clamp(split - big);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      split = clamp(split + big);
    }
  }
</script>

<div
  bind:this={rootEl}
  class="cui-splitpanel-root {className}"
  data-slot="splitpanel-root"
  data-orientation={orientation}
  data-disabled={disabled ? '' : undefined}
  style="--cui-split: {clampedSplit}%;"
  {...restProps}
>
  <div class="cui-splitpanel-pane" data-slot="paneStart">
    {#if start}
      {@render start()}
    {:else}
      <p class="cui-splitpanel-placeholder">Start pane</p>
    {/if}
  </div>

  <div
    class="cui-splitpanel-divider"
    data-slot="divider"
  >
    <div
      class="cui-splitpanel-handle"
      data-slot="handle"
      role="slider"
      aria-orientation={orientation === 'horizontal' ? 'vertical' : 'horizontal'}
      aria-valuenow={Math.round(clampedSplit)}
      aria-valuemin={lo}
      aria-valuemax={hi}
      aria-label="Resize panes"
      tabindex={disabled ? -1 : 0}
      onpointerdown={handlePointerDown}
      onpointermove={handlePointerMove}
      onkeydown={handleKeydown}
    >
      <div class="cui-splitpanel-grip" aria-hidden="true"></div>
    </div>
  </div>

  <div class="cui-splitpanel-pane" data-slot="paneEnd">
    {#if end}
      {@render end()}
    {:else}
      <p class="cui-splitpanel-placeholder">End pane</p>
    {/if}
  </div>
</div>
