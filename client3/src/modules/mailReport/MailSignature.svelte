<script lang="ts">
  import { onMount } from "svelte";
  import { toDataURL } from "./utils";

  export let src = "";

  let base64Url: Promise<string>;
  $: base64Url = toDataURL(src);
</script>

{#await base64Url then dataSrc}
  <img alt="signature" width="100px" height="100px" src={dataSrc} />
{/await}
