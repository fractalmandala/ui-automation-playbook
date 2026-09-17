<script lang="ts">
  import { setContext, type Snippet } from 'svelte';

  interface Props {
    active?: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    children: Snippet;
    class?: string;
    onchange?: (active: string) => void;
    [key: string]: any;
  }

  let {
    active = $bindable(''),
    placement = 'top',
    children,
    class: className = '',
    onchange,
    ...restProps
  }: Props = $props();

  function selectTab(val: string) {
    active = val;
    onchange?.(val);
  }

  setContext('cui-tab-ctx', {
    getActive: () => active,
    select: selectTab,
    getPlacement: () => placement
  });
</script>

<div
  class="cui-tab-group {className}"
  data-slot="tab-group"
  data-placement={placement}
  {...restProps}
>
  {@render children()}
</div>
