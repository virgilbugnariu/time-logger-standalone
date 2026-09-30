<script lang="ts">
  import GearSolid from "svelte-awesome-icons/GearSolid.svelte";
  import CalendarRegular from "svelte-awesome-icons/CalendarRegular.svelte";
  import NationalDaysIcon from "svelte-awesome-icons/FlagCheckeredSolid.svelte";
  import TrashCanRegular from "svelte-awesome-icons/TrashCanRegular.svelte";
  import { range } from "lodash";
  import { derived } from "svelte/store";
  import { store } from "../../../store";
  import { WEEK_DAYS } from "../../constants";
  import MonthSelector from "./MonthSelector.svelte";
  import CalendarDay from "./CalendarDay.svelte";
  import selectedMonthSlice from "./selectedMonth.slice";
  import {
    decreaseMonth,
    getDateFrom,
    getDayOfWeek,
    increaseMonth,
  } from "./utils";
  import {
    autofill,
    clearAll,
    fillInNationalDays,
    loadCalendarData,
  } from "./calendar.actions";

  const selectedMonth = derived(store, (store) => store.data.selectedMonth);
  const allNationalDays = derived(store, (state) => state.data.nationalDays);

  const info = derived(selectedMonth, (month) => {
    const currentDate = getDateFrom(1, month.month, month.year);
    return {
      prevMonth: decreaseMonth(month.month, month.year),
      nextMonth: increaseMonth(month.month, month.year),
      currentDate,
      firstDayOfMonthInCalendar: getDayOfWeek(currentDate.startOf("month")),
      lastDayOfMonthInCalendar: getDayOfWeek(currentDate.endOf("month")),
      daysInLastMonth: currentDate.subtract(1, "month").daysInMonth(),
      daysInCurrentMonth: currentDate.daysInMonth(),
    };
  });

  $: nationalDaysThisMonth =
    Object.values($allNationalDays || {}).filter(
      ({ month, year }) =>
        month === $selectedMonth.month && year === $selectedMonth.year
    ).length > 0;

  let loadDataPromise = loadCalendarData(
    $selectedMonth.month,
    $selectedMonth.year
  );

  function selectNextMonth() {
    loadDataPromise = loadCalendarData(
      $info.nextMonth.month,
      $info.nextMonth.year
    ).finally(selectedMonthSlice.actions.next);
  }

  function selectPrevMonth() {
    loadDataPromise = loadCalendarData(
      $info.prevMonth.month,
      $info.prevMonth.year
    ).finally(selectedMonthSlice.actions.prev);
  }
</script>

<div class="flex justify-between items-center w-full">
  <MonthSelector
    selectedMonth={$selectedMonth}
    on:next={selectNextMonth}
    on:prev={selectPrevMonth}
  >
    {#await loadDataPromise}
      <GearSolid size="12px" class="text-white animate-spin" />
    {/await}
  </MonthSelector>

  <div>
    {#if nationalDaysThisMonth}
      <button
        on:click={fillInNationalDays}
        class="my-national-days-btn hover:text-blue-400 mr-4"
        title="national days"
      >
        <NationalDaysIcon />
      </button>
    {/if}
    <button
      on:click={clearAll}
      class="hover:text-blue-400 mr-4"
      title="Clear all"
    >
      <TrashCanRegular />
    </button>

    <button on:click={autofill} class="hover:text-blue-400" title="Autofill">
      <CalendarRegular />
    </button>
  </div>
</div>

<div
  class="mt-10 grid grid-cols-7 border-t bordel-t-white border-l bordel-l-white"
>
  {#each range(1, 8) as wkIndex}
    <div
      class="text-gray-200 border-r border-r-white border-b border-b-white max-w-28 text-center text-ellipsis overflow-hidden py-2"
    >
      <span class="hidden md:inline">{WEEK_DAYS[wkIndex]}</span>
      <span class="inline md:hidden font-bold">{WEEK_DAYS[wkIndex][0]}</span>
    </div>
  {/each}
</div>

<div class="my-grid auto-rows-fr grid grid-cols-7 border-l bordel-l-white">
  {#each range(0, $info.firstDayOfMonthInCalendar - 1).reverse() as day}
    <CalendarDay
      greyedOut
      day={$info.daysInLastMonth - day}
      month={$info.prevMonth.month}
      year={$info.prevMonth.year}
    />
  {/each}

  {#each range(1, $info.daysInCurrentMonth + 1) as day}
    <CalendarDay
      {day}
      month={$selectedMonth.month}
      year={$selectedMonth.year}
    />
  {/each}

  {#each range(0, 7 - $info.lastDayOfMonthInCalendar) as day}
    <CalendarDay
      greyedOut
      day={day + 1}
      month={$info.nextMonth.month}
      year={$info.nextMonth.year}
    />
  {/each}
</div>

<style>
  @keyframes multicolor {
      0% {
          color: red;
      }
      50% {
          color: yellow
      }
      100% {
          color: blue
      }
  }
  .my-national-days-btn {
    animation: 5s multicolor;
    animation-iteration-count: infinite;
    animation-direction: alternate-reverse;
  }
  .my-grid {
    grid-auto-rows: minmax(0, 10rem);
  }
</style>
