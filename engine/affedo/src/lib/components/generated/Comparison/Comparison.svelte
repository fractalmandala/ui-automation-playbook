<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    position?: number;
    beforeLabel?: string;
    afterLabel?: string;
    disabled?: boolean;
    before?: Snippet;
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    position = $bindable(50),
    beforeLabel = 'Before',
    afterLabel = 'After',
    disabled = false,
    before,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  let rootEl: HTMLDivElement | undefined = $state();

  function clamp(n: number): number {
    return Math.min(100, Math.max(0, n));
  }

  let clampedPosition = $derived(clamp(position));

  function handlePointerDown(e: PointerEvent) {
    if (disabled) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if (disabled || !rootEl) return;
    if (!(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) return;
    const rect = rootEl.getBoundingClientRect();
    position = clamp(Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 10);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (disabled) return;
    const big = e.shiftKey ? 10 : 2;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      position = clamp(position - big);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      position = clamp(position + big);
    }
  }
</script>

<div
  bind:this={rootEl}
  class="cui-comparison-root {className}"
  data-slot="comparison-root"
  data-disabled={disabled ? '' : undefined}
  style="--cui-compare: {clampedPosition}%;"
  {...restProps}
>
  <div class="cui-comparison-layer cui-comparison-after" data-slot="afterLayer">
    {#if children}
      {@render children()}
    {:else}
      <p class="cui-comparison-placeholder">{afterLabel}</p>
    {/if}
  </div>

  <div class="cui-comparison-layer cui-comparison-before" data-slot="beforeLayer">
    {#if before}
      {@render before()}
    {:else}
      <p class="cui-comparison-placeholder">{beforeLabel}</p>
    {/if}
  </div>

  <span class="cui-comparison-label cui-comparison-label-before" data-slot="labelBefore">{beforeLabel}</span>
  <span class="cui-comparison-label cui-comparison-label-after" data-slot="labelAfter">{afterLabel}</span>

  <div
    class="cui-comparison-divider"
    data-slot="divider"
  >
    <div
      class="cui-comparison-handle"
      data-slot="handle"
      role="slider"
      aria-orientation="vertical"
      aria-valuenow={Math.round(clampedPosition)}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label="Comparison slider"
      aria-valuetext={Math.round(clampedPosition) + '% before visible'}
      tabindex={disabled ? -1 : 0}
      onpointerdown={handlePointerDown}
      onpointermove={handlePointerMove}
      onkeydown={handleKeydown}
    >
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
        <polyline points="9 18 3 12 9 6" />
        <polyline points="15 6 21 12 15 18" />
      </svg>
    </div>
  </div>
</div>
