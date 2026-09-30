<script lang="ts">
  import { derived } from "svelte/store";
  import { toast } from "svelte-toastify";
  import { records as db } from "../../db";
  import { eifActions, store } from "../../store";
  import Button from "../common/Button.svelte";
  import ConfirmationParagraph from "../common/ConfirmationParagraph.svelte";
  import GridRenderer from "../common/GridRenderer.svelte";
  import Input from "../common/Input.svelte";
  import type { GridRendererComponent } from "../common/types";
  import { dispatchApiValidationResponse, getUniqueId } from "../common/utils";
  import Checkbox from "../common/Checkbox.svelte";
  import type { CompaniesContractDetails } from "./contractDetails.slice";
  import companiesContractDetailsSlice from "./contractDetails.slice";

  const details = derived(store, (state) =>
    Object.values(state.data.companiesContractDetails)
  );

  function handleEdit(item: CompaniesContractDetails) {
    eifActions.pushLayoutBlock(
      {
        title: "Edit",
        type: "modal",
        dataPath: `companiesContractDetails.${item.id}`,
        component: GridRenderer,
        extraProps: {
          cols: 1,
          components: [
            {
              id: getUniqueId(),
              dataPath: "description",
              validationRules: { required: "This field is required" },
              component: Input,
              extraProps: {
                label: "Description",
                help: "{project} will be replaced with the actual project name inside the final invoice",
              },
            },
          ] as Array<GridRendererComponent>,
        },
        actions: [
          {
            title: "cancel",
            action({ blockId }) {
              eifActions.popLayoutBlock(blockId, "deleteDataAtPath");
            },
          },
          {
            title: "update",
            validateBeforeExecute: true,
            async action(block) {
              const data = eifActions.getDataAtPath(
                block.dataPath
              ) as CompaniesContractDetails;

              try {
                const contractDetails = await db.update(
                  "companies_contract_details",
                  data.id,
                  data
                );

                companiesContractDetailsSlice.actions.set(
                  contractDetails as unknown as CompaniesContractDetails
                );
                eifActions.popLayoutBlock(block.blockId, "deleteDataAtPath");
              } catch (error: any) {
                dispatchApiValidationResponse(block.dataPath, error?.data);
              }
            },
          },
        ],
      },
      "cloneData"
    );
  }

  function handleAdd() {
    eifActions.pushLayoutBlock({
      title: "Create",
      type: "modal",
      dataPath: "contract-details-new-dirty-data",
      component: GridRenderer,
      extraProps: {
        cols: 1,
        components: [
          {
            id: getUniqueId(),
            dataPath: "description",
            validationRules: { required: "This field is required" },
            component: Input,
            extraProps: {
              label: "Description",
              help: "{project} will be replaced with the actual project name inside the final invoice",
            },
          },
        ] as Array<GridRendererComponent>,
      },
      actions: [
        {
          title: "cancel",
          action({ blockId }) {
            eifActions.popLayoutBlock(blockId, "deleteDataAtPath");
          },
        },
        {
          title: "add",
          validateBeforeExecute: true,
          async action(block) {
            const data = eifActions.getDataAtPath(block.dataPath) as Object;

            try {
              const contractDetails = await db.create(
                "companies_contract_details",
                {
                  ...data,
                }
              );

              companiesContractDetailsSlice.actions.set(
                contractDetails as unknown as CompaniesContractDetails
              );
              eifActions.popLayoutBlock(block.blockId, "deleteDataAtPath");
            } catch (error: any) {
              dispatchApiValidationResponse(block.dataPath, error?.data);
            }
          },
        },
      ],
    });
  }

  function handleDelete(item: CompaniesContractDetails) {
    eifActions.pushLayoutBlock({
      title: `Confirm deletion`,
      type: "modal",
      dataPath: "",
      extraProps: { text: "Are you sure you want to delete this item?" },
      component: ConfirmationParagraph,
      actions: [
        {
          title: "No",
          action: ({ blockId }) => {
            eifActions.popLayoutBlock(blockId);
          },
        },
        {
          title: "Yes",
          async action({ blockId }) {
            try {
              await db.delete("companies_contract_details", item.id);
              companiesContractDetailsSlice.actions.delete({ id: item.id });
              eifActions.popLayoutBlock(blockId);
            } catch {
              toast.error("An error has occured 😱");
            }
          },
        },
      ],
    });
  }
</script>

<div class="flex justify-end">
  <Button on:click={handleAdd} type="primary">Add</Button>
</div>

<div>
  {#each $details as item (item.id)}
    <div
      class="flex justify-between py-2 border border-white border-b-gray-300 last:border-none"
    >
      <span>
        {item.description}
      </span>

      <div>
        <Button on:click={() => handleEdit(item)} type="primary">edit</Button>
        <Button on:click={() => handleDelete(item)} type="primary"
          >delete</Button
        >
      </div>
    </div>
  {/each}
</div>
