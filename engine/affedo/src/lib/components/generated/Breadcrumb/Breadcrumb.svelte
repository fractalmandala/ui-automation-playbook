<script lang="ts">
  import { setContext, type Snippet } from 'svelte';

  interface Props {
    label?: string;
    children: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    label = 'Breadcrumb',
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  setContext('cui-breadcrumb-ctx', {
    hasContext: true
  });
</script>

<nav
  class="cui-breadcrumb {className}"
  data-slot="breadcrumb-root"
  aria-label={label}
  {...restProps}
>
  <ol class="cui-breadcrumb-list">
    {@render children()}
  </ol>
</nav>
