<script lang="ts">
  import { toast } from "svelte-toastify";
  import { derived } from "svelte/store";
  import { eifActions, store } from "../../store";
  import Button from "../common/Button.svelte";
  import GridRenderer from "../common/GridRenderer.svelte";
  import SectionName from "../common/SectionName.svelte";
  import Input from "../common/Input.svelte";
  import type { GridRendererComponent } from "../common/types";
  import { dispatchApiValidationResponse, getUniqueId } from "../common/utils";
  import type { Company } from "./types";
  import { records as db } from "../../db";
  import companiesSlice from "./companies.slice";
    import ConfirmationParagraph from "../common/ConfirmationParagraph.svelte";

  const companies = derived(store, (state) =>
    Object.values(state.data.companies)
  );

  const COMPANIES_FORM = [
    {
      id: getUniqueId(),
      dataPath: "name",
      validationRules: { required: "This field is required" },
      component: Input,
      extraProps: { label: "Nume" },
    },
    {
      id: getUniqueId(),
      dataPath: "nrRegCom",
      validationRules: { required: "This field is required" },
      component: Input,
      extraProps: { label: "Nr. Reg. Com." },
    },
    {
      id: getUniqueId(),
      dataPath: "sediu",
      validationRules: { required: "This field is required" },
      component: Input,
      extraProps: { label: "Sediu" },
    },
    {
      id: getUniqueId(),
      dataPath: "cui",
      validationRules: { required: "This field is required" },
      component: Input,
      extraProps: { label: "C.U.I." },
    },
    {
      id: getUniqueId(),
      dataPath: "judet",
      validationRules: { required: "This field is required" },
      component: Input,
      extraProps: { label: "Judet" },
    },
    {
      id: getUniqueId(),
      dataPath: "iban",
      validationRules: { required: "This field is required" },
      component: Input,
      extraProps: { label: "Contul IBAN" },
    },
    {
      id: getUniqueId(),
      dataPath: "bankName",
      validationRules: { required: "This field is required" },
      component: Input,
      extraProps: { label: "Banca" },
    },
    {
      id: getUniqueId(),
      dataPath: "capitalSocial",
      validationRules: { required: "This field is required" },
      component: Input,
      extraProps: { label: "Capital social" },
    },
    {
      id: getUniqueId(),
      dataPath: "",
      component: SectionName,
      extraProps: { title: "Delegat CI" },
    },
    {
      id: getUniqueId(),
      dataPath: "delegat_nume",
      component: Input,
      extraProps: { label: "Nume" },
    },
    {
      id: getUniqueId(),
      dataPath: "delegat_cnp",
      component: Input,
      extraProps: { label: "CNP" },
    },
    {
      id: getUniqueId(),
      dataPath: "delegat_ciSerie",
      component: Input,
      extraProps: { label: "CI serie" },
    },
    {
      id: getUniqueId(),
      dataPath: "delegat_ciNr",
      component: Input,
      extraProps: { label: "CI numar" },
    },
    {
      id: getUniqueId(),
      dataPath: "delegat_eliberatDe",
      component: Input,
      extraProps: { label: "CI eliberat de" },
    },
  ] as Array<GridRendererComponent>;

  function handleAdd() {
    eifActions.pushLayoutBlock({
      type: "modal",
      title: "Create company",
      dataPath: "company-new-dirty-data",
      component: GridRenderer,
      extraProps: {
        cols: 1,
        components: COMPANIES_FORM,
      },
      actions: [
        {
          title: "cancel",
          action: (block) =>
            eifActions.popLayoutBlock(block.blockId, "deleteDataAtPath"),
        },
        {
          title: "add",
          async action(block) {
            const company = eifActions.getDataAtPath<Company>(block.dataPath);

            try {
              if (company) {
                const savedRecord = await db.create("companies", {
                  ...company,
                });
                companiesSlice.actions.set(savedRecord as unknown as Company);
              }
              eifActions.popLayoutBlock(block.blockId, "deleteDataAtPath");
            } catch (error: any) {
              dispatchApiValidationResponse(block.dataPath, error?.data);
            }
          },
        },
      ],
    });
  }
  function handleEdit(company: Company) {
    eifActions.pushLayoutBlock(
      {
        type: "modal",
        title: "Edit company",
        dataPath: `companies.${company.id}`,
        component: GridRenderer,
        extraProps: {
          cols: 1,
          components: COMPANIES_FORM,
        },
        actions: [
          {
            title: "cancel",
            action: (block) =>
              eifActions.popLayoutBlock(block.blockId, "deleteDataAtPath"),
          },
          {
            title: "save",
            action: async (block) => {
              const company = eifActions.getDataAtPath<Company>(block.dataPath);

              try {
                if (company) {
                  const savedRecord = await db.update(
                    "companies",
                    company.id,
                    {
                      ...company,
                    }
                  );
                  companiesSlice.actions.set(savedRecord as unknown as Company);
                }
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
  function handleDelete(company: Company) {
    eifActions.pushLayoutBlock({
      title: `Confirm deletion of ${company.name}`,
      type: "modal",
      dataPath: "",
      extraProps: { text: "Are you sure you want to delete this company?" },
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
              await db.delete("companies", company.id);
              companiesSlice.actions.delete({ id: company.id });
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
  {#each $companies as item (item.id)}
    <div
      class="grid grid-cols-3 justify-between py-2 border border-white border-b-gray-300 last:border-none"
    >
      {item.name} <span title="C.U.I.">{item.cui}</span>

      <div class="justify-self-end">
        {#if !item.isReadonly}
          <Button on:click={() => handleEdit(item)} type="primary">edit</Button>
          <Button on:click={() => handleDelete(item)} type="primary"
            >delete</Button
          >
        {/if}
      </div>
    </div>
  {/each}
</div>
