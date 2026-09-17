<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger';
    appearance?: 'filled-outlined' | 'accent' | 'outlined';
    size?: 'sm' | 'md' | 'lg';
    pill?: boolean;
    withRemove?: boolean;
    onremove?: () => void;
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    variant = 'neutral',
    appearance = 'filled-outlined',
    size = 'md',
    pill = false,
    withRemove = false,
    onremove,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  function handleRemove(e: MouseEvent) {
    e.stopPropagation();
    onremove?.();
  }
</script>

<span
  class="cui-tag {className}"
  data-slot="tag-root"
  data-variant={variant}
  data-appearance={appearance}
  data-size={size}
  data-pill={pill ? '' : undefined}
  {...restProps}
>
  <span class="cui-tag-content" data-slot="content">
    {#if children}
      {@render children()}
    {:else}
      Tag
    {/if}
  </span>
  {#if withRemove}
    <button
      type="button"
      class="cui-tag-remove"
      data-slot="remove"
      aria-label="Remove tag"
      onclick={handleRemove}
    >
      <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  {/if}
</span>
