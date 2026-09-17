<script lang="ts">
  import { setContext, type Snippet } from 'svelte';

  interface Props {
    selection?: 'single' | 'multiple';
    selected?: string[];
    children?: Snippet;
    class?: string;
    onselect?: (selected: string[]) => void;
    [key: string]: any;
  }

  let {
    selection = 'single',
    selected = $bindable([]),
    children,
    class: className = '',
    onselect,
    ...restProps
  }: Props = $props();

  function selectNode(id: string) {
    if (selection === 'single') {
      selected = [id];
    } else {
      if (selected.includes(id)) {
        selected = selected.filter(i => i !== id);
      } else {
        selected = [...selected, id];
      }
    }
    onselect?.(selected);
  }

  setContext('cui-tree-ctx', {
    getSelection: () => selection,
    isSelected: (id: string) => selected.includes(id),
    select: selectNode
  });
</script>

<div
  class="cui-tree-root {className}"
  data-slot="tree-root"
  role="tree"
  {...restProps}
>
  {@render children?.()}
</div>
