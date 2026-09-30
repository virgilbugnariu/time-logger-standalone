<script lang="ts">
  import type { Signature } from "./types";
  import { getSignatureImage } from "./utils";

  export let signature: Signature;

  $: src = getSignatureImage(signature);
</script>

<div class=" flex items-center gap-4">
  <img
    class="rounded-full aspect-square"
    alt="signature"
    {src}
    width={17}
    height={17}
  />
  {signature.name}
</div>
