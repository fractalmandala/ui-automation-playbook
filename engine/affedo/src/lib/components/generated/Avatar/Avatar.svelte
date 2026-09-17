<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    image?: string;
    label?: string;
    initials?: string;
    shape?: 'circle' | 'square' | 'rounded';
    size?: 'sm' | 'md' | 'lg';
    status?: 'online' | 'offline' | 'busy' | 'away';
    icon?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    image = '',
    label = '',
    initials = '',
    shape = 'circle',
    size = 'md',
    status,
    icon,
    class: className = '',
    ...restProps
  }: Props = $props();

  let hasError = $state(false);
  const showImage = $derived(Boolean(image) && !hasError);
</script>

<div
  class="cui-avatar {className}"
  data-slot="avatar-root"
  data-shape={shape}
  data-size={size}
  role="img"
  aria-label={label || initials || 'Avatar'}
  {...restProps}
>
  {#if showImage}
    <img
      src={image}
      alt={label || initials || 'Avatar'}
      class="cui-avatar-img"
      data-slot="image"
      onerror={() => hasError = true}
    />
  {:else if initials}
    <span class="cui-avatar-initials" data-slot="initials">
      {initials}
    </span>
  {:else if icon}
    <span class="cui-avatar-icon" data-slot="icon">
      {@render icon()}
    </span>
  {:else}
    <span class="cui-avatar-fallback" data-slot="fallback" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </span>
  {/if}

  {#if status}
    <span
      class="cui-avatar-status"
      data-slot="indicator"
      data-status={status}
      aria-label="Status: {status}"
    ></span>
  {/if}
</div>
