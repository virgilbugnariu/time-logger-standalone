<script lang="ts">
  import GearSolid from "svelte-awesome-icons/GearSolid.svelte";
  import { onMount } from "svelte";
  import { derived } from "svelte/store";
  import { eifActions, store } from "../../store";
  import { loadNationalDays } from "./nationalDays.api";
  import nationalDaysSlice from "./nationalDays.slice";
  import type { FillNationalDaysData, NationalDay } from "./types";
  import NoData from "../common/NoData.svelte";
  import WorkedHoursEditor from "../workedHours/WorkedHoursEditor.svelte";
  import type { WorkedHours } from "../pages/calendar/types";
  import DataFieldValidator from "../DataFieldValidator.svelte";
  import Button from "../common/Button.svelte";
  import { toKey } from "../pages/calendar/utils";

  export let dataPath: string;
  export let data = {} as FillNationalDaysData;
  export let errors: Record<string, string>;

  const selectedMonth = derived(store, (state) => state.data.selectedMonth);

  let loadingPromise: Promise<void>;
  onMount(() => {
    loadingPromise = loadNationalDays($selectedMonth.year).then((nationalDays) => {
      const dayKeys = nationalDays
        .filter(({ isDuringTheWeekend }) => !isDuringTheWeekend)
        .map(({ day, month, year }) => toKey(day, month, year));

      if (dayKeys.length > 0) {
        eifActions.setData(`${dataPath}.nationalDays`, dayKeys);
      }
    });
  });

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

  const nationalDaysMap = derived(store, (state) => state.data.nationalDays);
  $: currentYearNationalDays = Object.values($nationalDaysMap || {}).filter(
    ({ year, month }) =>
      year === $selectedMonth.year && month === $selectedMonth.month
  );
  $: currentYearNationalDaysDuringWeek = currentYearNationalDays.filter(
    ({ isDuringTheWeekend }) => !isDuringTheWeekend
  );
</script>

{#await loadingPromise}
  <div class="min-h-[10rem] flex items-center justify-center">
    <div class="text-gray-500 animate-ping">
      <GearSolid class="animate-spin" />
    </div>
  </div>
{:then}
  {#if currentYearNationalDaysDuringWeek && currentYearNationalDaysDuringWeek.length > 0}
    <p class="text-lg">
      Found <b>{currentYearNationalDays.length}</b> national day(s) this month:
      {#if currentYearNationalDaysDuringWeek.length !== currentYearNationalDays.length}
        ({currentYearNationalDays.length -
          currentYearNationalDaysDuringWeek.length} during the weekend 😥)
      {/if}
    </p>
    <div class="pl-4">
      {#each currentYearNationalDays as nationalDay}
        <div class:text-gray-400={nationalDay.isDuringTheWeekend}>
          <b>{nationalDay.formattedDate}</b>({nationalDay.weekDay}) - {nationalDay.name}
        </div>
      {/each}

      {#if currentYearNationalDaysDuringWeek.length > 0}
        <DataFieldValidator
          dataPath={`${dataPath}.workedHours`}
          validationRules={{ length: { min: 1, message: "Required" } }}
        >
          <div
            class:animate-bounce={errors?.workedHours}
            class="flex justify-end"
          >
            <Button type="primary" on:click={addNewItem}>Add work hours</Button>
          </div>
        </DataFieldValidator>

        {#if data && data.workedHours?.length > 0}
          <WorkedHoursEditor
            data={data.workedHours || []}
            on:change={({ detail }) => handleWorkedHoursChange(detail.value)}
          />
        {:else}
          <NoData>No worked hours</NoData>
        {/if}
      {/if}
    </div>
  {:else}
    Found no national days for this month 😥
  {/if}
{/await}
