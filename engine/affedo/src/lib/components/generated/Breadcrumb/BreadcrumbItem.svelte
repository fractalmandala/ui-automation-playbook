<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    href?: string;
    current?: boolean;
    children: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    href,
    current = false,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();
</script>

<li class="cui-breadcrumb-item {className}" data-slot="item" {...restProps}>
  {#if href && !current}
    <a {href} class="cui-breadcrumb-link">
      {@render children()}
    </a>
  {:else}
    <span class="cui-breadcrumb-current" aria-current={current ? 'page' : undefined}>
      {@render children()}
    </span>
  {/if}
  {#if !current}
    <span class="cui-breadcrumb-separator" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </span>
  {/if}
</li>
