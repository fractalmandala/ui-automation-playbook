<script lang="ts">
  import { setContext, type Snippet } from 'svelte';

  interface Props {
    mode?: 'multiple' | 'single' | 'single-collapsible';
    appearance?: 'outlined' | 'separated' | 'plain';
    children: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    mode = 'multiple',
    appearance = 'outlined',
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  let activeItems = $state<string[]>([]);

  function toggleItem(id: string) {
    if (mode === 'multiple') {
      if (activeItems.includes(id)) {
        activeItems = activeItems.filter(i => i !== id);
      } else {
        activeItems = [...activeItems, id];
      }
    } else if (mode === 'single-collapsible') {
      if (activeItems.includes(id)) {
        activeItems = [];
      } else {
        activeItems = [id];
      }
    } else {
      // single
      activeItems = [id];
    }
  }

  setContext('cui-accordion-ctx', {
    getMode: () => mode,
    getAppearance: () => appearance,
    isActive: (id: string) => activeItems.includes(id),
    toggle: toggleItem
  });
</script>

<div
  class="{className}"
  data-slot="accordion-root"
  data-appearance={appearance}
  data-mode={mode}
  {...restProps}
>
  {@render children()}
</div>
