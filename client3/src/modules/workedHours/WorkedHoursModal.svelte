<script lang="ts">
  import { eifActions } from "../../store";
  import Button from "../common/Button.svelte";
  import type { WorkDay, WorkedHours } from "../pages/calendar/types";
  import WorkedHoursEditor from "./WorkedHoursEditor.svelte";

  export let data: WorkDay | null = null;
  export let dataPath: string;

  function onChange(workedHours: WorkedHours[]) {
    eifActions.setData(dataPath, { ...data, workedHours } as WorkDay);
  }

  function addNewItem() {
    const defaultProjectId = eifActions.getData(
      (state) => Object.keys(state.projects)[0]
    );
    const defaultDetailsId = eifActions.getData(
      (state) => Object.keys(state.workHoursDetails)[0]
    );
    eifActions.setData(dataPath, {
      ...data,
      workedHours: [
        ...data.workedHours,
        {
          hours: "0",
          projectId: defaultProjectId || "",
          detailsId: defaultDetailsId || "",
        },
      ],
    });
  }
</script>

<div class="flex w-full justify-end mb-5">
  <Button type="primary" on:click={addNewItem}>Add work hours</Button>
</div>

<WorkedHoursEditor
  data={data.workedHours || []}
  on:change={({ detail }) => onChange(detail.value)}
/>
