<script lang="ts">
  import type { WorkedHours } from "../pages/calendar/types";
  import { createEventDispatcher } from "svelte";
  import ProjectsDropdown from "../projects/ProjectsDropdown.svelte";
  import Input from "../common/Input.svelte";
  import WorkedHoursDetailsDropdown from "../workedHoursDetails/WorkedHoursDetailsDropdown.svelte";
  import NoData from "../common/NoData.svelte";

  export let data: WorkedHours[] | null = null;

  const dispatch = createEventDispatcher();
  function handleChange(index: number, name: keyof WorkedHours, value: string) {
    const newWorkedHours = data?.map((wk, i) =>
      i === index
        ? {
            ...wk,
            [name]: value,
          }
        : wk
    );
    dispatch("change", {
      value: newWorkedHours,
    });
  }
  function handleRemove(index: number) {
    const newWorkedHours = data?.filter((_, i) => i !== index);
    dispatch("change", { value: newWorkedHours });
  }
</script>

{#if data?.length > 0}
  <div class="grid grid-cols-3 gap-4">
    <div><b>Hours</b></div>
    <div><b>Project</b></div>
    <div><b>Details</b></div>
  </div>

  {#each data as wk, index}
    <div
      class="grid grid-cols-1 sm:grid-cols-3 mt-[1.7rem] gap-4 border border-white border-b-gray-300 last:border-none"
    >
      <Input
        placeholder="Worked hours on project"
        name="hours"
        type="number"
        value={wk.hours}
        on:change={({ detail }) => handleChange(index, "hours", detail.value)}
      />

      <ProjectsDropdown
        value={wk.projectId}
        on:change={({ detail }) =>
          handleChange(index, "projectId", detail.value)}
      />

      <div class="flex items-start justify-center gap-4">
        <div class="first:flex-auto">
          <WorkedHoursDetailsDropdown
            value={wk.detailsId}
            on:change={({ detail }) =>
              handleChange(index, "detailsId", detail.value)}
          />
        </div>
        <button
          on:click={() => handleRemove(index)}
          class="flex-grow-0 flex-shrink-0 mt-2 cursor-pointer hover:text-blue-400"
          >X</button
        >
      </div>
    </div>
  {/each}
{:else}
  <NoData />
{/if}
