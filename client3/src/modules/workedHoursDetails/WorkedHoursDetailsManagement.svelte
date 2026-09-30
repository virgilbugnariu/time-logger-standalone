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
  import type { WorkedHoursDetails } from "./workedHoursDetails.slice";
  import workedHoursDetailsSlice from "./workedHoursDetails.slice";
  import Checkbox from "../common/Checkbox.svelte";

  const details = derived(store, (state) =>
    Object.values(state.data.workHoursDetails)
  );

  function handleEdit(detailsItem: WorkedHoursDetails) {
    eifActions.pushLayoutBlock(
      {
        title: `Edit ${detailsItem.details}`,
        type: "modal",
        dataPath: `workHoursDetails.${detailsItem.id}`,
        component: GridRenderer,
        extraProps: {
          cols: 1,
          components: [
            {
              id: getUniqueId(),
              dataPath: "short",
              validationRules: { required: "This field is required" },
              component: Input,
              extraProps: {
                help: "Used inside calendar day cell. \n Use emojis like 🔧",
                label: "Short",
              },
            },
            {
              id: getUniqueId(),
              dataPath: "details",
              validationRules: { required: "This field is required" },
              component: Input,
              extraProps: {
                label: "Details",
              },
            },
            {
              id: getUniqueId(),
              dataPath: "isThisWork",
              component: Checkbox,
              extraProps: {
                label: 'Is this work?',
                name: 'isThisWork',
                help: "Work hours will be included in the final invoice & Mail report",
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
              ) as WorkedHoursDetails;

              try {
                const savedRecord = await db.update(
                  "workhour_details",
                  data.id,
                  {
                    ...data,
                  }
                );

                workedHoursDetailsSlice.actions.set(
                  savedRecord as unknown as WorkedHoursDetails
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
      dataPath: "worked-hours-details-new-dirty-data",
      component: GridRenderer,
      extraProps: {
        cols: 1,
        components: [
          {
            id: getUniqueId(),
            dataPath: "short",
            validationRules: { required: "This field is required" },
            component: Input,
            extraProps: {
              help: "Used inside calendar day cell. Use emojis like 🔧",
              label: "Short",
            },
          },
          {
            id: getUniqueId(),
            dataPath: "details",
            validationRules: { required: "This field is required" },
            component: Input,
            extraProps: {
              label: "Details",
            },
          },
          {
            id: getUniqueId(),
            dataPath: "isThisWork",
            component: Checkbox,
            extraProps: {
              name: 'isThisWork',
              label: 'Is this work?',
              help: "Work hours will be included in the final invoice & Mail report",
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
              const savedRecord = await db.create("workhour_details", {
                ...data,
              });

              workedHoursDetailsSlice.actions.set(
                savedRecord as unknown as WorkedHoursDetails
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

  function handleDelete(item: WorkedHoursDetails) {
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
              await db.delete("workhour_details", item.id);
              workedHoursDetailsSlice.actions.delete({ id: item.id });
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
        Short({item.short}) - {item.details}
        {#if item.isThisWork}
          - considered work
        {/if}
      </span>

      {#if !item.isReadonly}
        <div>
          <Button on:click={() => handleEdit(item)} type="primary">edit</Button>
          <Button on:click={() => handleDelete(item)} type="primary"
            >delete</Button
          >
        </div>
      {/if}
    </div>
  {/each}
</div>
