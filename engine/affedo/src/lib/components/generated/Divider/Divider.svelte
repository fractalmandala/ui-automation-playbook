<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    orientation?: 'horizontal' | 'vertical';
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    orientation = 'horizontal',
    children,
    class: className = '',
    ...restProps
  }: Props = $props();
</script>

<div
  class="cui-divider {className}"
  data-slot="divider-root"
  data-orientation={orientation}
  role="separator"
  aria-orientation={orientation}
  {...restProps}
>
  {#if children && orientation === 'horizontal'}
    <span class="cui-divider-content" data-slot="label">
      {@render children()}
    </span>
  {/if}
</div>
