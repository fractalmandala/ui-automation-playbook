<script lang="ts">
  import { getContext, type Snippet } from 'svelte';

  interface Props {
    value: string;
    disabled?: boolean;
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    value,
    disabled = false,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  const ctx = getContext<any>('cui-tab-ctx');
  const isActive = $derived(ctx ? ctx.getActive() === value : false);

  function handleClick() {
    if (disabled) return;
    ctx?.select(value);
  }
</script>

<button
  type="button"
  role="tab"
  class="cui-tab-item {className}"
  data-slot="tab"
  data-active={isActive ? '' : undefined}
  data-disabled={disabled ? '' : undefined}
  aria-selected={isActive}
  {disabled}
  onclick={handleClick}
  {...restProps}
>
  {@render children?.()}
</button>
