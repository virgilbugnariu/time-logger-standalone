<script lang="ts">
  import { toast } from "svelte-toastify";
  import { derived } from "svelte/store";
  import { records as db } from "../../db";
  import { eifActions, store } from "../../store";
  import Button from "../common/Button.svelte";
  import ConfirmationParagraph from "../common/ConfirmationParagraph.svelte";
  import { dispatchApiValidationResponse } from "../common/utils";
  import SignatureAddForm from "./SignatureAddForm.svelte";
  import signaturesSlice from "./signatures.slice";
  import type { Signature } from "./types";
  import { blobToDataURL, getSignatureImage } from "./utils";

  const signatures = derived(store, (state) =>
    Object.values(state.data.signatures)
  );

  function handleAdd() {
    eifActions.pushLayoutBlock({
      title: `Add new signature`,
      type: "modal",
      dataPath: "signature-new-form",
      component: SignatureAddForm,
      actions: [
        {
          title: "cancel",
          action: ({ blockId }) => {
            eifActions.popLayoutBlock(blockId, "deleteDataAtPath");
          },
        },
        {
          title: "add",
          validateBeforeExecute: true,
          async action(block) {
            const data = eifActions.getDataAtPath<Signature>(block.dataPath);

            try {
              const signature = await db.create("signatures", {
                name: data.name,
                field: data.field instanceof Blob ? await blobToDataURL(data.field) : "",
              });

              signaturesSlice.actions.set(signature as unknown as Signature);

              eifActions.popLayoutBlock(block.blockId, "deleteDataAtPath");
            } catch (error) {
              dispatchApiValidationResponse(block.dataPath, error?.data);
            }
          },
        },
      ],
    });
  }
  function handleDelete(item: Signature) {
    eifActions.pushLayoutBlock({
      title: `Confirm deletion`,
      type: "modal",
      dataPath: `signatures.${item.id}`,
      extraProps: { text: "Are you sure you want to delete this signature?" },
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
            const data = eifActions.getData(
              (state) => state.signatures[item.id]
            );

            try {
              if (data) {
                await db.delete("signatures", data.id);
                eifActions.popLayoutBlock(blockId, "deleteDataAtPath");
              }
            } catch {
              toast.error("An error has occured 😱");
            }
          },
        },
      ],
    });
  }
</script>

<div class="flex justify-end mb-4">
  <Button on:click={handleAdd} type="primary">Add</Button>
</div>

<div>
  {#each $signatures as item (item.id)}
    <div
      class="flex justify-between py-2 border border-white border-b-gray-300 last:border-none"
    >
      <div class="flex items-center gap-4 text-gray-800">
        <img
          class="rounded-full aspect-square"
          alt="signature"
          src={getSignatureImage(item)}
          width={17}
          height={17}
        />
        {item.name}
      </div>

      <div>
        <Button on:click={() => handleDelete(item)} type="primary"
          >delete</Button
        >
      </div>
    </div>
  {/each}
</div>
