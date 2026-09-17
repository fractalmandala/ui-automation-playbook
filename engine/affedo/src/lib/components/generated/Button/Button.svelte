<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
    children?: Snippet;
    start?: Snippet;
    end?: Snippet;
    onclick?: (e: MouseEvent) => void;
    class?: string;
    [key: string]: any;
  }

  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    type = 'button',
    children,
    start,
    end,
    onclick,
    class: className = '',
    ...restProps
  }: Props = $props();
</script>

<button
  {type}
  {disabled}
  data-slot="button-root"
  data-variant={variant}
  data-size={size}
  data-loading={loading ? '' : undefined}
  class="cui-button {className}"
  {onclick}
  {...restProps}
>
  {#if loading}
    <span class="cui-button-spinner" data-slot="spinner" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="cui-spin-icon">
        <circle cx="12" cy="12" r="9" stroke-opacity="0.25" />
        <path d="M12 3a9 9 0 0 1 9 9" stroke-linecap="round" />
      </svg>
    </span>
  {/if}
  {#if start}
    <span class="cui-button-start" data-slot="start">
      {@render start()}
    </span>
  {/if}
  <span class="cui-button-label" data-slot="label">
    {#if children}
      {@render children()}
    {:else}
      Button
    {/if}
  </span>
  {#if end}
    <span class="cui-button-end" data-slot="end">
      {@render end()}
    </span>
  {/if}
</button>
