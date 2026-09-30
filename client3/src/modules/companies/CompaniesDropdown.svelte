<script lang="ts">
  import { derived } from "svelte/store";
  import { eifActions, store } from "../../store";
  import Dropdown from "../common/Dropdown.svelte";
  import CompaniesManagement from './CompaniesManagement.svelte';

  export let error = "";
  export let value = "";
  export let label = "";

  const options = derived(store, (state) => {
    return Object.values(state.data.companies).map((company) => ({
      name: company.name,
      value: company.id,
    }));
  });

  function openManagementDialog() {
    eifActions.pushLayoutBlock({
      title: "Companies C.R.U.D.",
      type: "modal",
      dataPath: "",
      component: CompaniesManagement,
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
  placeholder="Select a company"
  {error}
  {value}
  options={$options}
  on:change
  showMore
  on:show-more={openManagementDialog}
/>
