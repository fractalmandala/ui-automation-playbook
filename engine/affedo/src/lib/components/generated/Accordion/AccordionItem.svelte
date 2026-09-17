<script lang="ts">
  import { getContext, type Snippet } from 'svelte';

  interface Props {
    value?: string;
    title?: string;
    open?: boolean;
    disabled?: boolean;
    header?: Snippet;
    children: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    value,
    title = '',
    open = $bindable(false),
    disabled = false,
    header,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  const ctx = getContext<any>('cui-accordion-ctx');
  const uid = $props.id();
  const itemId = $derived(value || uid);

  const isOpen = $derived(ctx ? ctx.isActive(itemId) : open);

  function handleClick() {
    if (disabled) return;
    if (ctx) {
      ctx.toggle(itemId);
    } else {
      open = !open;
    }
  }
</script>

<div
  class="cui-accordion-item {className}"
  data-slot="accordion-item"
  data-open={isOpen ? '' : undefined}
  data-disabled={disabled ? '' : undefined}
  {...restProps}
>
  <button
    type="button"
    class="cui-accordion-trigger"
    data-slot="trigger"
    aria-expanded={isOpen}
    {disabled}
    onclick={handleClick}
  >
    <div class="cui-accordion-header-content" data-slot="header">
      {#if header}
        {@render header()}
      {:else}
        {title}
      {/if}
    </div>
    <span class="cui-accordion-chevron" data-slot="indicator" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </span>
  </button>

  {#if isOpen}
    <div class="cui-accordion-panel" data-slot="panel" role="region">
      {@render children()}
    </div>
  {/if}
</div>
