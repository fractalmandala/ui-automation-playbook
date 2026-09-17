<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    direction?: 'vertical' | 'horizontal' | 'both';
    snap?: 'none' | 'proximity' | 'mandatory';
    fade?: boolean;
    maxHeight?: string;
    children?: Snippet;
    onscroll?: (e: Event) => void;
    class?: string;
    [key: string]: any;
  }

  let {
    direction = 'vertical',
    snap = 'none',
    fade = false,
    maxHeight = '',
    children,
    onscroll,
    class: className = '',
    ...restProps
  }: Props = $props();
</script>

<div
  class="cui-scroller-root {className}"
  data-slot="scroller-root"
  data-direction={direction}
  data-snap={snap}
  data-fade={fade ? '' : undefined}
  style={maxHeight ? '--cui-scroller-max: ' + maxHeight + ';' : undefined}
  {...restProps}
>
  <div class="cui-scroller-viewport" data-slot="viewport" {onscroll}>
    <div class="cui-scroller-content" data-slot="content">
      {#if children}
        {@render children()}
      {:else}
        <p class="cui-scroller-placeholder">Scroll content</p>
      {/if}
    </div>
  </div>
</div>
