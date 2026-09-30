<script lang="ts">
  import Cropper from "svelte-easy-crop";
  import debounce from "lodash/debounce";
  import type { Point } from "svelte-easy-crop/types";
  import { eifActions } from "../../store";
  import Input from "../common/Input.svelte";
  import DataFieldValidator from "../DataFieldValidator.svelte";
  import type { Signature } from "./types";
  import getCroppedImg from "./utils";

  export let dataPath: string;
  export let data: Omit<Signature, "id">;
  export let errors: Record<string, string> = {};

  function handleFieldChange(field: string, value: string) {
    eifActions.setData(`${dataPath}.${field}`, value);
  }

  let selectedImageSrc = "";
  function handleSelectFile(e) {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      selectedImageSrc = reader?.result.toString() || "";
    });
    reader.readAsDataURL(e.target.files[0]);
  }

  let crop: Point = { x: 0, y: 0 };
  let zoom = 1;

  const handleImageCrop = debounce((e) => {
    getCroppedImg(selectedImageSrc, e.detail.pixels).then(
      (croppedImage: string) => handleFieldChange("field", croppedImage)
    );
  }, 500);
</script>

<div class="grid grid-cols-2 items-center gap-4">
  <DataFieldValidator
    dataPath={`${dataPath}.name`}
    validationRules={{ required: "Field is required" }}
  >
    <Input
      name="name"
      label="Signature name"
      value={data?.name || ""}
      error={errors.name}
      placeholder="Signature name"
      on:change={({ detail }) => handleFieldChange("name", detail.value)}
    />
  </DataFieldValidator>

  <DataFieldValidator
    dataPath={`${dataPath}.field`}
    validationRules={{ ['file-uploaded']: "Field is required" }}
  >
    <div>
      <label for="field" class="block mb-2 text-sm font-medium"> Picture </label>
      <input
        class="form-control
              block
              w-full
              px-3
              py-1.5
              text-base
              font-normal
              text-gray-700
              bg-white bg-clip-padding
              border border-solid border-gray-300
              rounded
              transition
              ease-in-out
              m-0
              focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
        type="file"
        name="field"
        class:border-red-400={errors.field}
        on:change={handleSelectFile}
      />
      <p class="mt-2 h-5 text-sm text-red-600 dark:text-red-500">
        <span class="font-medium">{errors.field || ""}</span>
      </p>
    </div>
  </DataFieldValidator>
</div>

{#if selectedImageSrc}
  {#key selectedImageSrc}
    <div class="relative w-full h-60 mt-5">
      <Cropper
        image={selectedImageSrc}
        bind:crop
        bind:zoom
        aspect={1}
        on:cropcomplete={handleImageCrop}
      />
    </div>
  {/key}
{/if}
