<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Tooltip from "./Tooltip.svelte";

  export let label = "";
  export let disabled = false;
  export let error = "";
  export let placeholder = "";
  export let name = "";
  export let type = "text";
  export let value = "";
  export let autocomplete = "";
  export let help = "";

  const dispatch = createEventDispatcher();
  function handleChange(e) {
    dispatch("change", {
      value: e.target.value,
    });
  }
</script>

<div>
  {#if label}
    <label for={name} class="block mb-2 text-sm font-medium">
      {label}
      {#if help}
        <Tooltip {help} />
      {/if}
    </label>
  {/if}
  <input
    {value}
    {type}
    id={name}
    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    {disabled}
    placeholder={placeholder || label}
    on:input={handleChange}
    {autocomplete}
  />
  <p class="mt-2 h-5 text-sm text-red-600 dark:text-red-500">
    <span class="font-medium">{error || ""}</span>
  </p>
</div>
