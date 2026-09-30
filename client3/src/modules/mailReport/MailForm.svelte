<script lang="ts">
  import flatten from "lodash/flatten";
  import { derived, writable } from "svelte/store";
  import { eifActions, store } from "../../store";
  import Input from "../common/Input.svelte";
  import CompaniesDropdown from "../companies/CompaniesDropdown.svelte";
  import DataFieldValidator from "../DataFieldValidator.svelte";
  import { fromKey, getDateFrom } from "../pages/calendar/utils";
  import SignaturesDropdown from "../signatures/SignaturesDropdown.svelte";
  import { getSignatureImage } from "../signatures/utils";
  import MailSignature from "./MailSignature.svelte";
  import type { MailReportForm } from "./types";
  import {
    getCurrentMonthWk,
    getTotalWorkedHoursPerMonth,
    splitIntoChunks,
  } from "./utils";

  export let dataPath: string;
  export let errors: Record<string, string>;
  export let data: Partial<MailReportForm> = {};
  type ProjectId = string;

  function handleFieldChange(name: string, value: string) {
    eifActions.setData(`${dataPath}.${name}`, value);
  }

  let projects = derived(store, (state) => state.data.projects);
  let details = derived(store, (state) => state.data.workHoursDetails);
  let currentMonth = derived(store, (state) => state.data.selectedMonth);
  let companies = derived(store, (state) => state.data.companies);
  let signatures = derived(store, (state) => state.data.signatures);
  let calendar = derived(store, (state) => state.data.calendarWorkedHours);

  $: fromCompany = $companies[data?.fromCompanyId];
  $: toCompany = $companies[data?.toCompanyId];
  $: signature = $signatures[data?.signatureId];


  let hiddenProjects = writable<Record<ProjectId, boolean>>({});

  let totalWorkedHours = derived([calendar, currentMonth, hiddenProjects], ([$calendar, $currentMonth, $hiddenProjects]) => getTotalWorkedHoursPerMonth(
    $calendar,
    $currentMonth.month,
    $currentMonth.year,
    $hiddenProjects,
  ));

  let today = getDateFrom(1, $currentMonth.month, $currentMonth.year);

  let chunksToRender = derived([calendar, currentMonth, details, hiddenProjects], ([$calendar, $currentMonth, $details, $hiddenProjects]) => splitIntoChunks(
    flatten(
      getCurrentMonthWk($calendar, $currentMonth.month, $currentMonth.year).map(
        (key) => {
          const { day, month, year } = fromKey(key);
          const date = getDateFrom(day, month, year);
          const wkHoursPerDay = $calendar[key];

          return wkHoursPerDay?.workedHours
            ?.filter((wk) => $details[wk.detailsId]?.isThisWork)
            ?.filter((wk) => !$hiddenProjects[wk.projectId])
            .map((wk) => ({ wk, date, key }));
        },
      ),
    ),
    [27, 35],
  ));

  let workedDaysCounter = derived(store, ($state) => {
    const currentMonth = $state.data.selectedMonth;

    let counter: Record<ProjectId, number> = {};

    getCurrentMonthWk($state.data.calendarWorkedHours, currentMonth.month, currentMonth.year)
      .forEach((key) => {
          const wkHoursPerDay = $state.data.calendarWorkedHours[key];

          const details = $state.data.workHoursDetails;

          wkHoursPerDay?.workedHours
            ?.filter((wk) => details[wk.detailsId]?.isThisWork)
            .forEach((wk) => {
              counter[wk.projectId] = counter[wk.projectId] || 0;

              counter[wk.projectId] = counter[wk.projectId] + Number(wk.hours);
            });
      });

    return counter;
  });

  function toggleHidden(projectId: ProjectId) {
    hiddenProjects.update((value) => {
      value[projectId] = !value[projectId];
      return value;
    });
  }
</script>

<div class="grid grid-cols-2 gap-4">
  <DataFieldValidator
    dataPath={`${dataPath}.invoiceName`}
    validationRules={{ required: "Field is required" }}
  >
    <Input
      name="invoiceName"
      value={data?.invoiceName || ""}
      placeholder="BG 000X"
      label="Invoice name"
      error={errors.invoiceName}
      on:change={({ detail }) => handleFieldChange("invoiceName", detail.value)}
    />
  </DataFieldValidator>

  <DataFieldValidator
    dataPath={`${dataPath}.signatureId`}
    validationRules={{ required: "Field is required" }}
  >
    <SignaturesDropdown
      value={data?.signatureId || ""}
      label="Signature"
      placeholder="Signature"
      error={errors.signatureId}
      on:change={({ detail }) => handleFieldChange("signatureId", detail.value)}
    />
  </DataFieldValidator>

  <DataFieldValidator
    dataPath={`${dataPath}.fromCompanyId`}
    validationRules={{ required: "Field is required" }}
  >
    <CompaniesDropdown
      label="From Company"
      value={data?.fromCompanyId}
      error={errors.fromCompanyId}
      on:change={({ detail }) =>
        handleFieldChange("fromCompanyId", detail.value)}
    />
  </DataFieldValidator>

  <DataFieldValidator
    dataPath={`${dataPath}.toCompanyId`}
    validationRules={{ required: "Field is required" }}
  >
    <CompaniesDropdown
      label="To Company"
      value={data?.toCompanyId}
      error={errors.toCompanyId}
      on:change={({ detail }) => handleFieldChange("toCompanyId", detail.value)}
    />
  </DataFieldValidator>

  <div>
    Numar ore lucrate:
    <div class="ml-4">
      {#each Object.keys($workedDaysCounter) as key}
        <button
          class="mr-4"
          class:line-through={!!$hiddenProjects[key]}
          on:click={() => toggleHidden(key)}
        >
          {$projects[key].name} <b>({$workedDaysCounter[key]}h / {$workedDaysCounter[key] / 8.0} zile)</b>
        </button>
      {/each}
    </div>
  </div>
</div>

<div id="to-pdf" class="text-xs leading-none m-24">
  <div class="mb-8 font-bold text-center text-xl">Raport de activitate</div>

  <div class="mb-2">
    <b>Firma prestatoare:</b>
    {fromCompany?.name || ""}
  </div>
  <div class="mb-2">
    <b>Catre:</b>
    {toCompany?.name || ""}
  </div>
  <div class="mb-2">
    <b>Referitor la factura numarul:</b>
    {#if data?.invoiceName}
      {data.invoiceName} - {today.format("MMM YYYY")}
    {/if}
  </div>

  <div class="mt-8 text-center">
    <span class="inline-block logger-bg-yellow px-4 py-1">
      <b>Raport de ore lucrate</b>
    </span>
  </div>

  {#each $chunksToRender as wkChunk, chunkIndex}
    {#if chunkIndex > 0}
      <div class="html2pdf__page-break"></div>
      <div class="mt-24" />
    {/if}
    <table class="logger-table w-full">
      <thead class="text-white logger-bg-header">
        <tr class="font-bold">
          <td class="">Data</td>
          <td class="">Proiect</td>
          <td class="">Descriere</td>
          <td class="">Ore lucrate</td>
        </tr>
      </thead>
      <tbody>
        {#each wkChunk as item}
          <tr>
            <td class="logger-bg-light-blue"
              >{item.date.format("DD-MMM-YYYY")}</td
            >
            <td>
              {#if $projects[item.wk.projectId]}
                {$projects[item.wk.projectId].name}
              {:else}
                ❌❌❌❌
              {/if}
            </td>
            <td>
              {#if $details[item.wk.detailsId]}
                {$details[item.wk.detailsId].details}
              {:else}
                ❌❌❌❌
              {/if}
            </td>
            <td class="logger-bg-light-blue">{item.wk.hours}</td>
          </tr>
        {/each}
        {#if chunkIndex === $chunksToRender.length - 1}
          <tr class="logger-bg-light-blue">
            <td />
            <td />
            <td />
            <td>{$totalWorkedHours}</td>
          </tr>
        {/if}
      </tbody>
    </table>
  {/each}
  <div class="flex w-full justify-between mt-8">
    <div>
      <b>Semnatura Prestator,</b>
      {#if signature}
        <MailSignature src={getSignatureImage(signature)} />
      {/if}
    </div>
    <div>
      <b>Semnatura Beneficiar,</b>
    </div>
  </div>
</div>

<style>
  .logger-bg-yellow {
    background: #ff0;
  }
  .logger-bg-header {
    background: #1f3864;
  }
  .logger-table {
    border-top: 1px solid black;
    border-left: 1px solid black;
  }
  .logger-table td {
    border-bottom: 1px solid black;
    border-right: 1px solid black;
    line-height: 17px;
    text-align: center;
  }
  .logger-bg-light-blue {
    background: #d9e2f3;
  }
</style>
