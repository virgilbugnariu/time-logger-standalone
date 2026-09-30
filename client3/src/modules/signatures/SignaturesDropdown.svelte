<script lang="ts">
  import { derived } from "svelte/store";
  import { eifActions, store } from "../../store";
  import Dropdown from "../common/Dropdown.svelte";
  import SignatureItem from "./SignatureItem.svelte";
    import SignaturesManagement from "./SignaturesManagement.svelte";

  export let error = "";
  export let value = "";
  export let label = "";
  export let placeholder = "";

  const options = derived(store, (state) => {
    return Object.values(state.data.signatures).map((signature) => ({
      component: SignatureItem,
      extraProps: { signature },
      value: signature.id,
    }));
  });

  function openManagementDialog() {
    eifActions.pushLayoutBlock({
      title: 'Signatures C.R.U.D',
      type: 'modal',
      dataPath: '',
      component: SignaturesManagement,
      actions: [
        {
          title: 'back',
          action: (block) => eifActions.popLayoutBlock(block.blockId),
        }
      ],
    });
  }
</script>

<Dropdown
  {label}
  {placeholder}
  {error}
  {value}
  options={$options}
  on:change
  showMore
  on:show-more={openManagementDialog}
/>
