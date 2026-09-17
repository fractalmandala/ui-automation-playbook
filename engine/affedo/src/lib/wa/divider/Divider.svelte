<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import './divider.css';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** Sets the divider's orientation. Defaults to 'horizontal'. */
    orientation?: 'horizontal' | 'vertical';
    class?: string;
  }

  let {
    orientation = 'horizontal',
    class: className = '',
    ...restProps
  }: Props = $props();
</script>

<div
  role="separator"
  aria-orientation={orientation}
  data-orientation={orientation}
  class="wa-divider {className}"
  {...restProps}
></div>
