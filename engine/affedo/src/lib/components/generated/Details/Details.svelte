<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    summary?: string;
    open?: boolean;
    children: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    summary = 'Details',
    open = false,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();
</script>

<details
  class="cui-details {className}"
  data-slot="details-root"
  {open}
  {...restProps}
>
  <summary class="cui-details-summary" data-slot="summary">
    <span>{summary}</span>
    <span class="cui-details-chevron" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </span>
  </summary>
  <div class="cui-details-content" data-slot="content">
    {@render children()}
  </div>
</details>
