<script lang="ts">
  import GearSolid from "svelte-awesome-icons/GearSolid.svelte";
  import { appInit } from "./app.init";
</script>

{#await appInit()}
  <div class="container mx-auto min-h-screen flex items-center justify-center">
    <div class="text-white animate-ping">
      <GearSolid class="animate-spin" />
    </div>
  </div>
{:then}
  <slot />
{:catch error}
  <div class="container mx-auto min-h-screen flex items-center justify-center text-white">
    Could not open the local database: {error?.message || error}
  </div>
{/await}
