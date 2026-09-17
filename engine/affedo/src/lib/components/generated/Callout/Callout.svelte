<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'brand' | 'neutral' | 'success' | 'warning' | 'danger';
    appearance?: 'accent' | 'filled' | 'outlined';
    size?: 'sm' | 'md' | 'lg';
    title?: string;
    closable?: boolean;
    onclose?: () => void;
    icon?: Snippet;
    actions?: Snippet;
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    variant = 'brand',
    appearance = 'accent',
    size = 'md',
    title,
    closable = false,
    onclose,
    icon,
    actions,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  let dismissed = $state(false);

  function handleClose() {
    dismissed = true;
    onclose?.();
  }
</script>

{#if !dismissed}
  <div
    class="cui-callout {className}"
    data-slot="callout-root"
    data-variant={variant}
    data-appearance={appearance}
    data-size={size}
    role="status"
    {...restProps}
  >
    <div class="cui-callout-icon" data-slot="icon">
      {#if icon}
        {@render icon()}
      {:else if variant === 'success'}
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      {:else if variant === 'warning'}
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      {:else if variant === 'danger'}
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      {:else}
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      {/if}
    </div>

    <div class="cui-callout-body" data-slot="body">
      {#if title}
        <div class="cui-callout-title" data-slot="title">{title}</div>
      {/if}
      <div class="cui-callout-message" data-slot="message">
        {@render children?.()}
      </div>
      {#if actions}
        <div class="cui-callout-actions" data-slot="actions">
          {@render actions()}
        </div>
      {/if}
    </div>

    {#if closable}
      <button
        type="button"
        class="cui-callout-close"
        data-slot="close"
        onclick={handleClose}
        aria-label="Dismiss notice"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    {/if}
  </div>
{/if}
