<script lang="ts">
  import isEmpty from "lodash/isEmpty";
  import { onDestroy, onMount } from "svelte";
  import { eifActions } from "../store";

  export let dataPath: string = "";
  export let validationRules: Record<
    string,
    string | { message: string; [key: string]: any }
  > = {};

  onMount(() => {
    if (validationRules && !isEmpty(validationRules)) {
      eifActions.addValidationRules(dataPath, validationRules);
    }
  });

  onDestroy(() => {
    eifActions.removeValidationRules(dataPath);
  });
</script>

<slot />
