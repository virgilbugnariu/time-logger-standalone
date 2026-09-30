<script lang="ts">
  import BeerMugEmptySolid from "svelte-awesome-icons/BeerMugEmptySolid.svelte";
</script>

<div class="flex justify-center items-center min-h-[10rem]">
  <div class="inline-flex flex-col justify-center items-center text-gray-300 text-2xl">
    <BeerMugEmptySolid size="50px" />
    <slot>No Data</slot>
  </div>
</div>
