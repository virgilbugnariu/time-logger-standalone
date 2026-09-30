<script lang="ts">
  import { derived } from "svelte/store";
  import { eifActions, store } from "../../store";
  import Button from "../common/Button.svelte";

  export let buttonAction: EifLayoutBlockAction;
  export let block: EifLayoutBlock;

  const isDataBlockValid = derived(store, () =>
    eifActions.isDataAtPathValid(block.dataPath)
  );

  let loading = false;
  async function execute() {
    loading = true;
    try {
      await eifActions.executeBlockAction(buttonAction, block);
    } finally {
      loading = false;
    }
  }
</script>

<Button
  {loading}
  disabled={buttonAction?.validateBeforeExecute && !isDataBlockValid}
  on:click={execute}
>
  {buttonAction?.title}
</Button>
