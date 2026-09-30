<script lang="ts">
  import CopyIcon from "svelte-awesome-icons/CopyRegular.svelte";
  import PasteIcon from "svelte-awesome-icons/PasteRegular.svelte";
  import EraserIcon from "svelte-awesome-icons/EraserSolid.svelte";
  import { eifActions, store } from "../../../store";
  import type { WorkDay } from "./types";
  import workedHoursCopySlice from "./workedHoursCopy.slice";
  import { derived } from "svelte/store";
  import { toKey } from "./utils";
  import { apiUpdateWorkDays } from "./calendar.api";
  import GearSolid from "svelte-awesome-icons/GearSolid.svelte";

  export let day: number = 0;
  export let month: number = 0;
  export let year: number = 0;

  const copiedWorkDay = derived(store, (state) => state.data.workedHoursCopied);
  const allWorkedHours = derived(store, ({ data }) => data.calendarWorkedHours);
  $: workDay = $allWorkedHours[toKey(day, month, year)] as WorkDay;

  function copy() {
    workedHoursCopySlice.actions.copy(workDay);
  }

  let updatingPastePromise: Promise<void> | null = null;
  function paste() {
    const copied = eifActions.getData((state) => state.workedHoursCopied);

    if (!copied) return;

    updatingPastePromise = apiUpdateWorkDays([
      {
        day,
        month,
        year,
        ...workDay,
        workedHours: copied.workedHours || [],
      },
    ]);
  }

  let deletingPromise: Promise<void> | null = null;
  function erase() {
    deletingPromise = apiUpdateWorkDays([
      {
        day,
        month,
        year,
        ...workDay,
        workedHours: [],
      },
    ]);
  }
</script>

<div class="flex items-center justify-between">
  <button
    title="Copy"
    disabled={!workDay?.workedHours?.length}
    on:click|stopPropagation={copy}
    class="p-2 text-white hover:text-blue-400 disabled:text-white/50 active:text-blue-900"
  >
    <CopyIcon size="15px" />
  </button>

  {#await updatingPastePromise}
    <GearSolid size="15px" class="m-2 animate-spin pointer-events-none" />
  {:then}
    <button
      title="Paste"
      on:click|stopPropagation={paste}
      disabled={!$copiedWorkDay}
      class="p-2 text-white hover:text-blue-400 disabled:text-white/50 active:text-blue-900"
    >
      <PasteIcon size="15px" />
    </button>
  {/await}

  {#await deletingPromise}
    <GearSolid size="15px" class="m-2 animate-spin pointer-events-none" />
  {:then} 
    <button
      title="Erase"
      on:click|stopPropagation={erase}
      disabled={!workDay?.workedHours?.length}
      class="p-2 text-white hover:text-blue-400 disabled:text-white/50 active:text-blue-900"
    >
      <EraserIcon size="15px" />
    </button>
  {/await}
</div>
