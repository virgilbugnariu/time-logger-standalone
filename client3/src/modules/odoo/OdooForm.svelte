<script lang="ts">
  import { derived } from "svelte/store";
  import { store } from "../../store";
  import { odooCsvExport } from "./utils";

  const currentMonth = derived(store, state => state.data.selectedMonth)
  const calendar = derived(store, (state) => state.data.calendarWorkedHours);

  $: csv = odooCsvExport($calendar, $currentMonth.month, $currentMonth.year);
</script>

<pre class="whitespace-pre-wrap break-words text-xs">
  {csv}
</pre>
