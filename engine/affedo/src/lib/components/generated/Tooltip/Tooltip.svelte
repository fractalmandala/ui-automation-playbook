<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    content?: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    children: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    content = '',
    placement = 'top',
    children,
    class: className = '',
    ...restProps
  }: Props = $props();
</script>

<span
  class="cui-tooltip-anchor {className}"
  data-slot="tooltip-root"
  {...restProps}
>
  {@render children()}
  {#if content}
    <span
      class="cui-tooltip-balloon"
      data-slot="panel"
      data-placement={placement}
      role="tooltip"
    >
      {content}
    </span>
  {/if}
</span>
