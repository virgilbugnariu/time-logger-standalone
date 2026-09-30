<script lang="ts">
  import { derived } from "svelte/store";
  import { eifActions, store } from "../../../store";
  import { dispatchApiValidationResponse } from "../../common/utils";
  import WorkedHoursModal from "../../workedHours/WorkedHoursModal.svelte";
  import { apiUpdateWorkDays } from "./calendar.api";
  import DayActionsBar from "./DayActionsBar.svelte";
  import type { WorkDay } from "./types";
  import { getDateFrom, NOW, toKey } from "./utils";

  export let day: number = 0;
  export let month: number = 0;
  export let year: number = 0;
  export let greyedOut = false;

  const allWorkedHours = derived(store, ({ data }) => data.calendarWorkedHours);
  const projects = derived(store, (store) => store.data.projects);
  const details = derived(store, (store) => store.data.workHoursDetails);
  const allNationalDays = derived(store, state => state.data.nationalDays)

  $: date = getDateFrom(day, month, year);
  $: workDay = $allWorkedHours[toKey(day, month, year)] as WorkDay;
  $: isToday = day === NOW.day && month === NOW.month && year === NOW.year;
  $: nationalDay = $allNationalDays ? $allNationalDays[toKey(day, month, year)] : null;

  function openEditModal() {
    const key = toKey(day, month, year);
    const dataPath = `calendarWorkedHours[${key}]`;
    const data = eifActions.getData((state) => state.calendarWorkedHours[key]);
    if (!data) {
      eifActions.setData(dataPath, {
        day,
        month,
        year,
        workedHours: [],
      } as WorkDay);
    }
    eifActions.pushLayoutBlock(
      {
        type: "modal",
        title: `${data ? "Edit" : "Add"} worked hours for ${date.format(
          "DD-MM-YYYY"
        )}`,
        dataPath,
        component: WorkedHoursModal,
        actions: [
          {
            title: "cancel",
            action({ blockId }) {
              eifActions.popLayoutBlock(blockId, "deleteDataAtPath");
            },
          },
          {
            title: "save",
            validateBeforeExecute: true,
            async action(block) {
              const dirtyData = eifActions.getDataAtPath<WorkDay>(
                block.dataPath
              );
              try {
                if (dirtyData) {
                  await apiUpdateWorkDays([dirtyData]);
                  eifActions.popLayoutBlock(
                    block.blockId,
                    "overrideOriginalWithClone"
                  );
                }
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
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="group relative cursor-pointer hover:bg-white/25 overflow-hidden flex flex-col text-white border-r border-r-white border-b border-b-white shadow-white/80"
  class:shadow-inner={nationalDay}
  on:click={openEditModal}
  title={nationalDay?.name}
>
  <div class="absolute top-0 left-0 right-0 hidden group-hover:md:block bg-neutral-900 border border-b-gray-400">
    <DayActionsBar {day} {month} {year} />
  </div>

  <div
    class="text-center align-middle py-1 md:py-2 text-xs md:text-base leading-none"
    class:text-gray-500={greyedOut}
  >
    <span
      class="aspect-square inline-flex rounded-full items-center justify-center leading-none"
      class:bg-white={isToday}
      class:text-black={isToday}
      class:min-w-[24px]={isToday}
    >
      {day}
    </span>
    <span class="hidden md:inline">
      {#if greyedOut}
        {date.format("MMM")}
      {/if}
    </span>
  </div>

  {#if workDay?.workedHours?.length > 0}
    <div
      class:opacity-20={greyedOut}
      class="sm:px-1 md:px-2 text-xs sm:text-base grow w-full flex flex-wrap sm:flex-col items-center justify-center"
    >
      {#each workDay.workedHours as projectHours}
        <div
          class="flex w-full items-center justify-center sm:justify-between items"
        >
          <span class="hidden sm:inline sm:mr-2">{projectHours.hours}h</span>
          <span
            class="hidden md:inline text-xs md:text-base text-ellipsis overflow-hidden"
          >
            {$projects[projectHours.projectId]?.name || "❌"}
          </span>
          <span class="text-xs sm:text-base"
            >{$details[projectHours.detailsId]?.short || "❌"}</span
          >
        </div>
      {/each}
    </div>
  {/if}
</div>
