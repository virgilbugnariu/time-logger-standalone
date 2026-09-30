<script lang="ts">
  import Portal from "svelte-portal/src/Portal.svelte";
  import { findLast } from "lodash";
  import { derived } from "svelte/store";
  import { store } from "../../store";
  import DynamicLayoutBlock from "../DynamicLayoutBlock.svelte";
  import LayoutPageBlockButton from "./LayoutPageBlockButton.svelte";
  import LayoutModalBLockButton from "./LayoutModalBLockButton.svelte";

  const lastPageBlock = derived(store, (state) =>
    findLast(state.layoutBlocks, (block) => block.type === "page")
  );
  const lastModalBlock = derived(store, (state) =>
    findLast(state.layoutBlocks, (block) => block.type === "modal")
  );
</script>

<nav class="fixed z-10 top-0 w-full p-4 bg-neutral-800 text-white drop-shadow-lg">
  <div class="container mx-auto flex justify-between items-center">
    <div class="font-bold">Time logger</div>

    <div class="inline-flex gap-4">
      {#if $lastPageBlock?.actions}
        {#each $lastPageBlock.actions as action}
          <LayoutPageBlockButton buttonAction={action} block={$lastPageBlock}>
            {action.title}
          </LayoutPageBlockButton>
        {/each}
      {/if}
    </div>
  </div>
</nav>

<div class="container mx-auto min-h-fit p-4 mt-16 text-white">
  {#if $lastPageBlock}
    {#key $lastPageBlock.blockId}
      <DynamicLayoutBlock block={$lastPageBlock} />
    {/key}
  {/if}
</div>

{#if $lastModalBlock}
  <Portal target="#modal">
    <div
      class="fixed z-20 top-0 bottom-0 left-0 right-0 h-full w-full bg-white/60 flex items-center justify-center"
    >
      <div class="bg-white w-full max-w-[900px] max-h-full flex flex-col">
        <div class="bg-black text-white p-4 shadow-xl font-bold">
          {$lastModalBlock.title}
        </div>

        <div class="p-5 min-h-[10rem] overflow-y-auto w-full">
          {#key $lastModalBlock.blockId}
            <DynamicLayoutBlock block={$lastModalBlock} />
          {/key}
        </div>

        <div
          class="bg-black text-white p-4 shadow-xl font-bold flex justify-end gap-4"
        >
          {#if $lastModalBlock.actions}
            {#each $lastModalBlock.actions as action}
              <LayoutModalBLockButton
                block={$lastModalBlock}
                buttonAction={action}
              />
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </Portal>
{/if}
