<script lang="ts">
  import { eifActions } from "../../store";
  import Input from "../common/Input.svelte";
  import CompaniesContractDetailsDropdown from "../contractDetails/CompaniesContractDetailsDropdown.svelte";
  import DataFieldValidator from "../DataFieldValidator.svelte";
  import type { InvoceAutofillData } from "./types";

  export let dataPath: string;
  export let data: InvoceAutofillData;
  export let errors: Record<string, string>;

  function handleFieldChange(fieldName: string, value: any) {
    eifActions.setData(`${dataPath}.${fieldName}`, value);
  }
</script>

<div class="grid grid-cols-2 gap-8">
  <DataFieldValidator
    dataPath={`${dataPath}.euroToLeu`}
    validationRules={{ required: "Field is required" }}
  >
    <Input
      name="euroToLeu"
      label="Euro"
      value={data?.euroToLeu || ""}
      placeholder="4.51"
      error={errors?.euroToLeu}
      type="number"
      on:change={({ detail }) => handleFieldChange("euroToLeu", detail.value)}
    />
  </DataFieldValidator>

  <DataFieldValidator
    dataPath={`${dataPath}.pricePerDay`}
    validationRules={{ required: "Field is required" }}
  >
    <Input
      name="pricePerDay"
      label="Price per day(💶 EURO)"
      value={data?.pricePerDay || ""}
      placeholder="100"
      error={errors?.pricePerDay}
      type="number"
      on:change={({ detail }) => handleFieldChange("pricePerDay", detail.value)}
    />
  </DataFieldValidator>

  <DataFieldValidator
    dataPath={`${dataPath}.descriptionId`}
    validationRules={{ required: "Field is required" }}
  >
    <CompaniesContractDetailsDropdown
      label="Denumirea produselor sau a serviciilor"
      value={data?.descriptionId || ""}
      error={errors?.descriptionId}
      on:change={({ detail }) =>
        handleFieldChange("descriptionId", detail.value)}
    />
  </DataFieldValidator>
</div>
