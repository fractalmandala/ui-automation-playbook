<script lang="ts">
  import { getContext, onMount, type Snippet } from 'svelte';

  interface Props {
    value: string;
    label?: string;
    disabled?: boolean;
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    value,
    label = '',
    disabled = false,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  const ctx = getContext<any>('cui-select-ctx');
  const isSelected = $derived(ctx ? ctx.getSelected() === value : false);

  function handleClick() {
    if (disabled) return;
    ctx?.select(value, label || value);
  }
</script>

<div
  class="cui-option-item {className}"
  data-slot="option"
  data-selected={isSelected ? '' : undefined}
  data-disabled={disabled ? '' : undefined}
  role="option"
  aria-selected={isSelected}
  tabindex="0"
  onclick={handleClick}
  onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
  {...restProps}
>
  <span class="cui-option-label">
    {#if children}
      {@render children()}
    {:else}
      {label || value}
    {/if}
  </span>
  {#if isSelected}
    <span class="cui-option-check" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </span>
  {/if}
</div>
