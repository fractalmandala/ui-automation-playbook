<script lang="ts">
  import { getContext, type Snippet } from 'svelte';

  interface Props {
    value: string;
    label?: string;
    expanded?: boolean;
    disabled?: boolean;
    icon?: Snippet;
    children?: Snippet;
    class?: string;
    [key: string]: any;
  }

  let {
    value,
    label = '',
    expanded = $bindable(false),
    disabled = false,
    icon,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  const ctx = getContext<any>('cui-tree-ctx');
  const isSelected = $derived(ctx ? ctx.isSelected(value) : false);
  const hasChildren = $derived(Boolean(children));

  function handleRowClick() {
    if (disabled) return;
    ctx?.select(value);
    if (hasChildren) {
      expanded = !expanded;
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRowClick();
    }
  }

  function handleToggle(e: MouseEvent) {
    e.stopPropagation();
    expanded = !expanded;
  }
</script>

<div
  class="cui-tree-item {className}"
  data-slot="tree-item"
  role="treeitem"
  aria-expanded={hasChildren ? expanded : undefined}
  aria-selected={isSelected}
  {...restProps}
>
  <div
    class="cui-tree-row"
    data-selected={isSelected ? '' : undefined}
    data-disabled={disabled ? '' : undefined}
    onclick={handleRowClick}
    onkeydown={handleKeyDown}
    role="button"
    tabindex="0"
  >
    {#if hasChildren}
      <button
        type="button"
        class="cui-tree-toggle"
        data-slot="trigger"
        data-expanded={expanded ? '' : undefined}
        onclick={handleToggle}
        aria-label="Toggle branch"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    {:else}
      <span class="cui-tree-spacer"></span>
    {/if}

    {#if icon}
      <span class="cui-tree-icon" data-slot="icon">
        {@render icon()}
      </span>
    {/if}

    <span class="cui-tree-label" data-slot="label">
      {#if label}
        {label}
      {:else}
        {value}
      {/if}
    </span>
  </div>

  {#if hasChildren && expanded}
    <div class="cui-tree-branch" data-slot="children" role="group">
      {@render children?.()}
    </div>
  {/if}
</div>
