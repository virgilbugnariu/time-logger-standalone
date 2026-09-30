<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Tooltip from "./Tooltip.svelte";

  export let label = "";
  export let disabled = false;
  export let error = "";
  export let name = "";
  export let value = false;
  export let help = "";

  const dispatch = createEventDispatcher();
  function handleChange(e) {
    dispatch("change", {
      value: e.target.checked,
    });
  }
</script>

<div>
  <div class="flex justify-center items-center mb-2 gap-2">
    <input
      checked={value}
      id={name}
      name={name}
      type="checkbox"
      class="w-4 bg-gray-50 flex-grow-0 flex-shrink-0 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      {disabled}
      on:change={handleChange}
    />
    {#if label}
      <label for={name} class="select-none flex-auto block text-sm font-medium">
        {label}
        {#if help}
          <Tooltip {help} />
        {/if}
      </label>
    {/if}
  </div>
  <p class="mt-2 h-5 text-sm text-red-600 dark:text-red-500">
    <span class="font-medium">{error || ""}</span>
  </p>
</div>
