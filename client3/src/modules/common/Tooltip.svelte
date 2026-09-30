<script lang="ts">
  import CircleQuestionRegular from "svelte-awesome-icons/CircleQuestionRegular.svelte";
  import { onMount } from "svelte";
  import tippy from 'tippy.js'
  import 'tippy.js/dist/tippy.css';

  export let help: string;
  
  let buttonRef: HTMLDivElement;

  onMount(() => {
    tippy(buttonRef, { content: help });
  });

</script>

<div bind:this={buttonRef}  class="text-white inline-flex">
  <CircleQuestionRegular size="15px" class="text-blue-400 inline-flex" />
</div>

