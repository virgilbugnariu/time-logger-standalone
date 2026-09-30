<script lang="ts">
  import GearSolid from "svelte-awesome-icons/GearSolid.svelte";

  export let disabled = false;
  export let loading = false;
  export let type: "default" | "primary" = "default";
</script>

<button
  {disabled}
  class:text-white={type === 'primary'}
  class:bg-blue-400={type === 'primary'}
  class:hover:bg-white={type === 'primary'}
  class:hover:text-blue-400={type === 'primary'}
  class:text-black={type === 'default'}
  class:bg-white={type === 'default'}
  class="leading-none rounded-[2px] px-4 py-2 font-normal border box-border border-white hover:border-blue-400 disabled:text-gray-400 disabled:border-white inline-flex items-center gap-2"
  on:click
>
  {#if loading}
    <GearSolid size="14px" class="animate-spin" />
  {/if}
  <slot />
</button>
