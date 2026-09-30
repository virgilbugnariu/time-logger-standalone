<script lang="ts">
  import { derived } from "svelte/store";
  import { get } from "lodash";
  import { eifActions, store } from "../../store";
  import DataFieldValidator from "../DataFieldValidator.svelte";

  export let dataPath: string;
  export let validationRules: Record<string, string> = {};
  export let component: any;
  export let extraProps: Record<string, any> = {};

  const data = derived(store, (state) => get(state.data, dataPath, null));
  const error = derived(store, () =>
    eifActions.getErrorsAtPath(dataPath)?.__self || ''
  );

  function handleChange(value: any) {
    eifActions.setData(dataPath, value)
  }
</script>

<DataFieldValidator
  {dataPath}
  validationRules={validationRules}
>
  <svelte:component
    this={component}
    dataPath={dataPath}
    value={$data}
    error={$error}
    on:change={({ detail }) => handleChange(detail.value)}
    {...extraProps}
  />
</DataFieldValidator>
