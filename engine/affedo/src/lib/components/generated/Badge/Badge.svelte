<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'brand' | 'neutral' | 'success' | 'warning' | 'danger';
    appearance?: 'accent' | 'filled' | 'outlined';
    size?: 'sm' | 'md' | 'lg';
    pill?: boolean;
    start?: Snippet;
    end?: Snippet;
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    variant = 'brand',
    appearance = 'accent',
    size = 'md',
    pill = false,
    start,
    end,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();
</script>

<span
  class="cui-badge {className}"
  data-slot="badge-root"
  data-variant={variant}
  data-appearance={appearance}
  data-size={size}
  data-pill={pill ? '' : undefined}
  {...restProps}
>
  {#if start}
    <span class="cui-badge-start" data-slot="start">
      {@render start()}
    </span>
  {/if}
  <span class="cui-badge-label" data-slot="label" role="status">
    {#if children}
      {@render children()}
    {:else}
      Badge
    {/if}
  </span>
  {#if end}
    <span class="cui-badge-end" data-slot="end">
      {@render end()}
    </span>
  {/if}
</span>
