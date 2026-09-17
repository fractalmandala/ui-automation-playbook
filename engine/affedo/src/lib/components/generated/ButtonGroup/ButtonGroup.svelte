<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    orientation?: 'horizontal' | 'vertical';
    children: Snippet;
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
  class="cui-button-group {className}"
  data-slot="button-group-root"
  data-orientation={orientation}
  role="group"
  {...restProps}
>
  {@render children()}
</div>
