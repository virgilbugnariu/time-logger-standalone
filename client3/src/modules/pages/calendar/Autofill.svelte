<script lang="ts">
  import { eifActions } from "../../../store";
  import Button from "../../common/Button.svelte";
  import drop from "lodash/drop";
  import NoData from "../../common/NoData.svelte";
  import Tooltip from "../../common/Tooltip.svelte";
  import DataFieldValidator from "../../DataFieldValidator.svelte";
  import WorkedHoursEditor from "../../workedHours/WorkedHoursEditor.svelte";
  import type { AutofillData, WorkedHours } from "./types";
  import { WEEK_DAYS } from "../../constants";

  export let dataPath: string;
  export let data: AutofillData;
  export let errors: Record<string, string>;

  function handleWorkedHoursChange(wh: WorkedHours[]) {
    eifActions.setData(`${dataPath}.workedHours`, wh);
  }

  function addNewItem() {
    const defaultProjectId = eifActions.getData(
      (state) => Object.keys(state.projects)[0]
    );
    const defaultDetailsId = eifActions.getData(
      (state) => Object.keys(state.workHoursDetails)[0]
    );
    eifActions.setData(`${dataPath}.workedHours`, [
      ...(data?.workedHours || []),
      {
        hours: "0",
        projectId: defaultProjectId || "",
        detailsId: defaultDetailsId || "",
      },
    ]);
  }

  function selectDay(index: number) {
    const newList = [...(data?.workdays || [])];
    newList[index] = !newList[index];
    eifActions.setData(`${dataPath}.workdays`, newList);
  }
</script>

<div class="flex w-full justify-between mb-5">
  <DataFieldValidator
    dataPath={`${dataPath}.workdays`}
    validationRules={{ length: { min: 1, message: "Required" } }}
  >
    <div>
      Work days <Tooltip
        help="Select the days you want to fill workhours for"
      />
      <div class="mt-2">
        {#each drop(WEEK_DAYS, 1) as day, index}
          <button
            on:click={() => selectDay(index + 1)}
            class:animate-bounce={errors?.workdays}
            class="mr-2 inline-flex justify-center items-center w-8 aspect-square rounded-full border border-dashed border-gray-500 active:text-blue-900 active:border-blue-900 hover:text-blue-400 hover:border-blue-400"
            style:animation-delay={`${200 * index}ms`}
            class:text-blue-400={data?.workdays && data.workdays[index + 1]}
            class:border-blue-400={data?.workdays && data.workdays[index + 1]}
          >
            {day[0]}
          </button>
        {/each}
      </div>
    </div>
  </DataFieldValidator>
  <DataFieldValidator
    dataPath={`${dataPath}.workedHours`}
    validationRules={{ length: { min: 1, message: "Required" } }}
  >
    <div class:animate-bounce={errors?.workedHours}>
      <Button type="primary" on:click={addNewItem}>Add work hours</Button>
    </div>
  </DataFieldValidator>
</div>

{#if data && data.workedHours?.length > 0}
  <WorkedHoursEditor
    data={data.workedHours || []}
    on:change={({ detail }) => handleWorkedHoursChange(detail.value)}
  />
{:else}
  <NoData />
{/if}
