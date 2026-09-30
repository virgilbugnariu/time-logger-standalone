<script lang="ts">
  import DynamicComponent from "./DynamicComponent.svelte";
  import type { GridRendererComponent } from "./types";

  export let cols: number = 1;
  export let dataPath: string = "";
  export let components: Array<GridRendererComponent> = [];
</script>

<div
  style:grid-template-columns={`repeat(${cols}, minmax(0, 1fr))`}
  class="grid gap-4"
>
  {#if components?.length > 0}
    {#each components as component (component.id)}
      <DynamicComponent
        component={component.component}
        dataPath={`${dataPath}.${component.dataPath}`}
        validationRules={component.validationRules}
        extraProps={component.extraProps || {}}
      />
    {/each}
  {/if}
</div>
