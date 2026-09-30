<script lang="ts">
  import { derived } from "svelte/store";
  import { eifActions, store } from "../../store";
  import Dropdown from "../common/Dropdown.svelte";
  import CompaniesContractDetailsManagement from './CompaniesContractDetailsManagement.svelte';

  export let error = "";
  export let value = "";
  export let label = "";

  const options = derived(store, (state) => {
    return Object.values(state.data.companiesContractDetails).map((items) => ({
      name: items.description,
      value: items.id,
    }));
  });

  function openManagementDialog() {
    eifActions.pushLayoutBlock({
      title: "Product details C.R.U.D.",
      type: "modal",
      dataPath: "",
      component: CompaniesContractDetailsManagement,
      actions: [
        {
          title: "back",
          action: ({ blockId }) => {
            eifActions.popLayoutBlock(blockId);
          },
        },
      ],
    });
  }
</script>

<Dropdown
  {label}
  placeholder="Select an description"
  {error}
  {value}
  options={$options}
  on:change
  showMore
  on:show-more={openManagementDialog}
/>
