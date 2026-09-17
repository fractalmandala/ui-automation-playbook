<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    placement?: 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start' | 'top-center' | 'bottom-center';
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    placement = 'bottom-end',
    children,
    class: className = '',
    ...restProps
  }: Props = $props();
</script>

<div
  class="cui-toast-region {className}"
  data-slot="toast-region"
  data-placement={placement}
  role="region"
  aria-label="Notifications"
  {...restProps}
>
  {@render children?.()}
</div>
