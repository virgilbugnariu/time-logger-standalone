<script lang="ts">
  import { derived } from "svelte/store";
  import { get } from "lodash";
  import { eifActions, store } from "../store";

  export let block: EifLayoutBlock;

  const data = derived(store, (state) => get(state.data, block.dataPath, null));
  const errors = derived(store, () => eifActions.getErrorsAtPath(block.dataPath))
</script>

<svelte:component
  this={block.component}
  dataPath={block.dataPath}
  {block}
  data={$data}
  errors={$errors}
  {...block.extraProps}
/>
