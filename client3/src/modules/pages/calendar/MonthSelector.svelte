<script lang="ts">
  import ChevronLeftSolid from "svelte-awesome-icons/ChevronLeftSolid.svelte";
  import ChevronRightSolid from "svelte-awesome-icons/ChevronRightSolid.svelte";
  import { MONTHS } from "../../constants";
  import { createEventDispatcher } from "svelte";
  import type { SelectedMonth } from "./selectedMonth.slice";

  export let selectedMonth: SelectedMonth;

  const dispatch = createEventDispatcher();
  function next() {
    dispatch("next");
  }
  function prev() {
    dispatch("prev");
  }
</script>

<div class="flex gap-x-3 items-center">
  <button
    on:click={prev}
    class="inline-block bg-white text-black rounded-full p-1"
  >
    <ChevronLeftSolid
      size="20px"
      class="text-black cursor-pointer hover:text-blue-500"
    />
  </button>
  <button
    on:click={next}
    class="inline-block bg-white text-black rounded-full p-1"
  >
    <ChevronRightSolid
      size="20px"
      class="text-black cursor-pointer hover:text-blue-500"
    />
  </button>
  <div class="text-lg font-bold">
    {MONTHS[selectedMonth.month]}
    {selectedMonth.year}
  </div>
  <slot />
</div>
