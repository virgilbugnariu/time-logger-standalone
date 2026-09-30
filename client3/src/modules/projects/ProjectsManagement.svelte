<script lang="ts">
  import { derived } from "svelte/store";
  import { toast } from "svelte-toastify";
  import { records as db } from "../../db";
  import { eifActions, store } from "../../store";
  import Button from "../common/Button.svelte";
  import ConfirmationParagraph from "../common/ConfirmationParagraph.svelte";
  import type { Project } from "./projects.slice";
  import projectsSlice from "./projects.slice";
  import GridRenderer from "../common/GridRenderer.svelte";
  import Input from "../common/Input.svelte";
  import type { GridRendererComponent } from "../common/types";
  import { dispatchApiValidationResponse, getUniqueId } from "../common/utils";

  const projects = derived(store, (state) =>
    Object.values(state.data.projects)
  );

  function handleEdit(project: Project) {
    eifActions.pushLayoutBlock(
      {
        title: `Edit ${project.name} project`,
        type: "modal",
        dataPath: `projects.${project.id}`,
        component: GridRenderer,
        extraProps: {
          cols: 2,
          components: [
            {
              id: getUniqueId(),
              dataPath: "odooid",
              validationRules: { required: "This field is required" },
              component: Input,
              extraProps: {
                disabled: true,
                label: "OdooID",
              },
            },
            {
              id: getUniqueId(),
              dataPath: "name",
              validationRules: { required: "This field is required" },
              component: Input,
              extraProps: {
                label: "Name",
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
              const data = eifActions.getDataAtPath(block.dataPath) as Project;

              try {
                const savedRecord = await db.update(
                  "projects",
                  data.id,
                  {
                    ...data,
                  }
                );

                projectsSlice.actions.set(savedRecord as unknown as Project);
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
      title: "Create project",
      type: "modal",
      dataPath: "project-new-dirty-data",
      component: GridRenderer,
      extraProps: {
        cols: 2,
        components: [
          {
            id: getUniqueId(),
            dataPath: "odooid",
            validationRules: { required: "This field is required" },
            component: Input,
            extraProps: {
              label: "OdooID",
            },
          },
          {
            id: getUniqueId(),
            dataPath: "name",
            validationRules: { required: "This field is required" },
            component: Input,
            extraProps: {
              label: "Name",
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
              const savedRecord = await db.create("projects", {
                ...data,
              });

              projectsSlice.actions.set(savedRecord as unknown as Project);
              eifActions.popLayoutBlock(block.blockId, "deleteDataAtPath");
            } catch (error: any) {
              dispatchApiValidationResponse(block.dataPath, error?.data);
            }
          },
        },
      ],
    });
  }

  function handleDelete(project: Project) {
    eifActions.pushLayoutBlock({
      title: `Confirm deletion of ${project.name}`,
      type: "modal",
      dataPath: "",
      extraProps: { text: "Are you sure you want to delete this project?" },
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
              await db.delete("projects", project.id);
              projectsSlice.actions.delete({ id: project.id });
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
  {#each $projects as project (project.id)}
    <div
      class="flex justify-between py-2 border border-white border-b-gray-300 last:border-none"
    >
      <span>
        OdooID(<b>{project.odooid}</b>) {project.name}
      </span>

      {#if !project.isReadonly}
        <div>
          <Button on:click={() => handleEdit(project)} type="primary"
            >edit</Button
          >
          <Button on:click={() => handleDelete(project)} type="primary"
            >delete</Button
          >
        </div>
      {/if}
    </div>
  {/each}
</div>
