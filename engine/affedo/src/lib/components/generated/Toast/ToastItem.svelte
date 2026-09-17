<script lang="ts">
  import { onMount, type Snippet } from 'svelte';

  interface Props {
    variant?: 'brand' | 'neutral' | 'success' | 'warning' | 'danger';
    open?: boolean;
    duration?: number;
    title?: string;
    onclose?: () => void;
    icon?: Snippet;
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    variant = 'neutral',
    open = $bindable(true),
    duration = 4000,
    title,
    onclose,
    icon,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  let timer: ReturnType<typeof setTimeout> | null = null;

  onMount(() => {
    if (duration > 0) {
      timer = setTimeout(() => {
        close();
      }, duration);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  });

  function close() {
    open = false;
    onclose?.();
  }
</script>

{#if open}
  <div
    class="cui-toast-item {className}"
    data-slot="toast-item"
    data-variant={variant}
    role="status"
    {...restProps}
  >
    <div class="cui-toast-icon" data-slot="icon">
      {#if icon}
        {@render icon()}
      {:else if variant === 'success'}
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      {:else if variant === 'danger'}
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      {:else if variant === 'warning'}
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      {:else}
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      {/if}
    </div>

    <div class="cui-toast-body" data-slot="body">
      {#if title}
        <div class="cui-toast-title" data-slot="title">{title}</div>
      {/if}
      <div class="cui-toast-message" data-slot="message">
        {@render children?.()}
      </div>
    </div>

    <button
      type="button"
      class="cui-toast-close"
      data-slot="close"
      onclick={close}
      aria-label="Dismiss notification"
    >
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  </div>
{/if}
