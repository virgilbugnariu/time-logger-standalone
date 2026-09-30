<script lang="ts">
  import { createEventDispatcher, onDestroy } from "svelte";
  import PenToSquareRegular from "svelte-awesome-icons/PenToSquareRegular.svelte";
  import Portal from "svelte-portal/src/Portal.svelte";
  import { onMount } from "svelte";
  import clickOutside from "./click-outside";
  import Tooltip from "./Tooltip.svelte";

  export let label = "";
  export let error = "";
  export let placeholder = "";
  export let name = "";
  export let value = "";
  export let help = "";
  export let showMore = false;
  export let options: Array<{
    name?: string;
    value: string;
    component?: any;
    extraProps?: any;
  }> = [];

  let buttonRef: HTMLButtonElement;
  $: selectedOption = options.find((o) => o.value === value);

  const dispatch = createEventDispatcher();

  let opened = false;
  function toggleMenu() {
    opened = !opened;
  }
  function close() {
    opened = false;
  }
  function change(value: string) {
    dispatch("change", { value });
    close();
  }
  function handleShowMore() {
    dispatch("show-more", { value });
    close();
  }

  onMount(() => {
    window.addEventListener('resize', close);
  });

  onDestroy(() => {
    window.removeEventListener('resize', close)
  });
</script>

<div class="relative hover:cursor-pointer" use:clickOutside on:outclick={close}>
  {#if label}
    <label for={name} class="block mb-2 text-sm font-medium">
      {label}
      {#if help}
        <Tooltip {help} />
      {/if}
    </label>
  {/if}

  <button
    bind:this={buttonRef}
    class="text-start box-border text-ellipsis overflow-hidden relative bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  block w-full p-2.5 pr-5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    on:click={toggleMenu}
  >
    {#if !value}
      <span class="text-gray-400">{placeholder}</span>
    {:else if selectedOption.name}
      {selectedOption.name}
    {:else if selectedOption.component}
      <svelte:component
        this={selectedOption.component}
        {...selectedOption.extraProps}
      />
    {/if}

    <span class="absolute top-3 right-2 text-gray-900">▼</span>
  </button>

  {#if opened}
    <Portal target="#dropdown">
      <div
        style:top={`${buttonRef.getBoundingClientRect().bottom}px`}
        style:left={`${buttonRef.getBoundingClientRect().x}px`}
        style:width={`${buttonRef.getBoundingClientRect().width}px`}
        class="optionsContainer z-20 border border-t-gray-50 border-gray-300 rounded-br-lg rounded-bl-lg overflow-x-hidden w-full max-h-48 absolute  bg-gray-50 text-black pt-4"
      >
        {#each options as option (option.value)}
          <button
            on:click={() => change(option.value)}
            class="block w-full text-start pl-4 py-2 hover:bg-blue-400 hover:text-white"
          >
            {#if option.name}
              {option.name}
            {:else if option.component}
              <svelte:component
                this={option.component}
                {...option.extraProps}
              />
            {/if}
          </button>
        {/each}

        {#if showMore}
          <button
            on:click={handleShowMore}
            class="border border-t-gray-300 hover:text-blue-400 gap-2 py-3 w-full flex items-center text-gray-800 justify-center"
          >
            <PenToSquareRegular size="16px" />
            More?
          </button>
        {/if}
      </div>
    </Portal>
  {/if}

  <p class="mt-2 h-5 text-sm text-red-600 dark:text-red-500">
    <span class="font-medium">{error || ""}</span>
  </p>
</div>

<style>
  .optionsContainer {
    left: 10px;
    margin-top: -6px;
  }
</style>
