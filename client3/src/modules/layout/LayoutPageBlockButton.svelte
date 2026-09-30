<script lang="ts">
  import GearSolid from "svelte-awesome-icons/GearSolid.svelte";
  import { derived } from "svelte/store";
  import { eifActions, store } from "../../store";

  export let buttonAction: EifLayoutBlockAction;
  export let block: EifLayoutBlock;
  export let type: 'button' | 'submit' = 'button';
  export let className: string = '';

  const isDataBlockValid = derived(store, () =>
    eifActions.isDataAtPathValid(block.dataPath)
  );

  let loading = false;
  async function execute() {
    if (loading) return;

    loading = true;
    try {
      await eifActions.executeBlockAction(buttonAction, block);
    } finally {
      loading = false;
    }
  }
</script>

<button
  on:click={execute}
  class={className || "text-sm text-blue-500 cursor-pointer hover:underline"}
  disabled={loading || (buttonAction.validateBeforeExecute && !isDataBlockValid)}
  type={type}
>
  {#if loading}
    <GearSolid class="animate-spin" />
  {:else}
    {buttonAction.title}
  {/if}
</button>
