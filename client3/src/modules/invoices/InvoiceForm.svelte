<script lang="ts">
  import dayjs from "dayjs";
  import { derived } from "svelte/store";
  import trimEnd from 'lodash/trimEnd';
  import { eifActions, store } from "../../store";
  import Button from "../common/Button.svelte";
  import Input from "../common/Input.svelte";
  import CompaniesDropdown from "../companies/CompaniesDropdown.svelte";
  import DataFieldValidator from "../DataFieldValidator.svelte";
  import InvoiceAutofillForm from "./InvoiceAutofillForm.svelte";
  import type { InvoceAutofillData, InvoiceFormData, InvoiceProduct } from "./types";
  import {
    getProductTotal,
    getProductTVA,
    getTotal,
    getTotalTVA,
    getTotalWithoutTVA,
    getWorkedHoursPerProjectPerMonth,
  } from "./utils";

  export let dataPath: string;
  export let data: InvoiceFormData;
  export let errors: Record<string, string>;
  export let editable: boolean = true;

  let companies = derived(store, (state) => state.data.companies);

  $: fromCompany = $companies[data?.fromCompanyId];
  $: toCompany = $companies[data?.toCompanyId];
  $: products = data?.invoiceProducts || [];

  function handleFieldChange(fieldName: string, value: any) {
    eifActions.setData(`${dataPath}.${fieldName}`, value);
  }

  let tableRef: HTMLDivElement | null;
  let fakeHeightDivRef: HTMLDivElement | null;

  $: {
    if (fakeHeightDivRef && tableRef) {
      console.log(data);

      const heights = Array.from(
        tableRef.querySelectorAll(".fakeHeightHelper") || []
      ).map((helper: HTMLDivElement) => {
        const { height } = helper.getBoundingClientRect();
        return height;
      });

      const bodyHeight = heights.reduce((sum, item) => sum + item, 0);
      const fakeHeight = 430 - bodyHeight;
      if (fakeHeight > 0) {
        fakeHeightDivRef.style.height = `${fakeHeight}px`;
      }
    }
  }

  function addProduct() {
    handleFieldChange("invoiceProducts", [
      ...products,
      {
        description: "",
        um: "",
        quantity: "",
        pricePerUnit: 0,
      },
    ] as InvoiceProduct[]);
  }

  function removeProduct(index: number) {
    handleFieldChange(
      "invoiceProducts",
      products.filter((_p, i) => i !== index)
    );
  }

  function autofillData() {
    eifActions.pushLayoutBlock({
      type: "modal",
      title: "Autofill invoice",
      component: InvoiceAutofillForm,
      dataPath: "invoice-autofill-data",
      actions: [
        {
          title: "cancel",
          action: ({ blockId }) =>
            eifActions.popLayoutBlock(blockId, "deleteDataAtPath"),
        },
        {
          title: "autofill",
          validateBeforeExecute: true,
          action: (block) => {
            const data = eifActions.getDataAtPath<InvoceAutofillData>(
              block.dataPath
            );

            let euroToLeu = parseFloat(data.euroToLeu);
            if (!euroToLeu) {
              eifActions.setError(
                `${block.dataPath}.euroToLeu`,
                "Field is not a number"
              );
              return;
            }
            let pricePerDay = parseFloat(data.pricePerDay);
            if (!pricePerDay) {
              eifActions.setError(
                `${block.dataPath}.pricePerDay`,
                "Field is not a number"
              );
              return;
            }

            const calendarWorkedHours = eifActions.getData(
              (state) => state.calendarWorkedHours
            );
            const { month, year } = eifActions.getData(
              (state) => state.selectedMonth
            );
            const workedHoursPerProject = getWorkedHoursPerProjectPerMonth(
              calendarWorkedHours,
              month,
              year
            );

            const contractDetails = eifActions.getData(state => state.companiesContractDetails);
            const projects = eifActions.getData(state => state.projects);

            const newProducts = [] as InvoiceProduct[];
            Object.keys(workedHoursPerProject).forEach((projectId) => {
              const daysPerMonth = workedHoursPerProject[projectId] / 8;
              const pricePerUnit = pricePerDay * euroToLeu;

              newProducts.push({
                description: (contractDetails[data.descriptionId]?.description || '').replace('{project}', projects[projectId].name),
                um: "Zile",
                quantity: daysPerMonth,
                pricePerUnit,
              });
            });
            handleFieldChange("invoiceProducts", newProducts);

            eifActions.setData(
              `${dataPath}.euroToLeu`,
              data.euroToLeu.toLocaleString()
            );
            eifActions.popLayoutBlock(block.blockId, "deleteDataAtPath");
          },
        },
      ],
    });
  }

  function format(n: number | string): string {
    // Uglyest hack ever
    if (typeof n === "string") {
      n = parseFloat(n);
    }

    return n.toLocaleString("ro-RO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })
  }
</script>

{#if editable}
  <div class="grid grid-cols-2 gap-4 border border-white border-b-gray-300">
    <DataFieldValidator
      dataPath={`${dataPath}.name`}
      validationRules={{ required: "Field is required" }}
    >
      <Input
        name="name"
        label="Nume factura"
        value={data?.name || ""}
        error={errors.name}
        placeholder="<serie> <numar>"
        on:change={({ detail }) => handleFieldChange("name", detail.value)}
      />
    </DataFieldValidator>

    <DataFieldValidator
      dataPath={`${dataPath}.date`}
      validationRules={{ required: "Field is required" }}
    >
      <Input
        name="date"
        label="Data"
        value={data?.date || ""}
        placeholder="Select date"
        error={errors.date}
        type="date"
        on:change={({ detail }) => handleFieldChange("date", detail.value)}
      />
    </DataFieldValidator>

    <DataFieldValidator
      dataPath={`${dataPath}.fromCompanyId`}
      validationRules={{ required: "Field is required" }}
    >
      <CompaniesDropdown
        label="Furnizor"
        value={data?.fromCompanyId || ""}
        error={errors?.fromCompanyId}
        on:change={({ detail }) =>
          handleFieldChange("fromCompanyId", detail.value)}
      />
    </DataFieldValidator>

    <DataFieldValidator
      dataPath={`${dataPath}.toCompanyId`}
      validationRules={{ required: "Field is required" }}
    >
      <CompaniesDropdown
        label="Cumparator"
        value={data?.toCompanyId || ""}
        error={errors?.toCompanyId}
        on:change={({ detail }) =>
          handleFieldChange("toCompanyId", detail.value)}
      />
    </DataFieldValidator>

    <div class="mb-10 flex w-full justify-end col-span-2">
      <Button on:click={autofillData} type="primary">Autofill invoice</Button>
    </div>
  </div>
{/if}

<div id="to-pdf" class="text-[10px] leading-none m-24">
  <div class="flex w-full justify-between">
    <table>
      <tr>
        <td class="pb-1"> Furnizor: </td>
        <td> <b>{fromCompany?.name}</b> </td>
      </tr>
      <tr>
        <td class="pb-1"> Nr.Reg.Com.: </td>
        <td> {fromCompany?.nrRegCom} </td>
      </tr>
      <tr>
        <td class="pb-1"> C.U.I.: </td>
        <td> {fromCompany?.cui} </td>
      </tr>
      <tr>
        <td class="pb-1"> Sediu: </td>
        <td class="w-52"> {fromCompany?.sediu} </td>
      </tr>
      <tr>
        <td class="pb-1"> Judet: </td>
        <td> {fromCompany?.judet} </td>
      </tr>
      <tr>
        <td class="pb-1"> Contul: </td>
        <td> {fromCompany?.iban} </td>
      </tr>
      <tr>
        <td class="pb-1"> Banca: </td>
        <td> {fromCompany?.bankName} </td>
      </tr>
      <tr>
        <td class="pb-1"> Capital social: </td>
        <td> {fromCompany?.capitalSocial} </td>
      </tr>
    </table>
    <table class="w-[250px]">
      <tr>
        <td class="pb-1"> Cumparator: </td>
        <td> <b>{toCompany?.name}</b> </td>
      </tr>
      <tr>
        <td class="pb-1"> Nr.Reg.Com.: </td>
        <td> {toCompany?.nrRegCom} </td>
      </tr>
      <tr>
        <td class="pb-1"> C.U.I.: </td>
        <td> {toCompany?.cui} </td>
      </tr>
      <tr>
        <td class="pb-1"> Sediu: </td>
        <td class="w-52"> {toCompany?.sediu} </td>
      </tr>
      <tr>
        <td class="pb-1"> Contul: </td>
        <td> {toCompany?.iban} </td>
      </tr>
      <tr>
        <td class="pb-1"> Banca: </td>
        <td> {toCompany?.bankName} </td>
      </tr>
    </table>
  </div>

  <div class="mt-4 flex items-center justify-center w-full">
    <div class="border border-black px-36 py-4">
      <b>FACTURA FISCALA</b>
    </div>
  </div>
  <div class:text-red-600={!data?.name} class="mt-2 flex w-full justify-center">
    <div class="inline-grid grid-cols-2 gap-2 items-center justify-center">
      <span class="text-right">Serie:</span>
      <span>{data?.name?.split(" ")[0]}</span>
      <span class="text-right">Nr. factura:</span>
      <span>{data?.name?.split(" ")[1]}</span>
      <span class="text-right">Data:</span>
      <span>
        {#if data?.date}
          {dayjs(data?.date).format("DD-MM-YYYY")}
        {/if}
      </span>
    </div>
  </div>

  <div class="mt-4 text-[10px]">
    <div class="invoice">
      <div bind:this={tableRef} class="invoice-row">
        <div>Nr. ctr.</div>
        <div>Denumirea produselor sau a serviciilor</div>
        <div>U.M.</div>
        <div>Cantitatea</div>
        <div>Pretul unitar</div>
        <div>Valoarea</div>
        <div>Valoarea TVA</div>

        <div>0</div>
        <div>1</div>
        <div>2</div>
        <div>3</div>
        <div>4</div>
        <div>5 (3*4)</div>
        <div>6 (5*19%)</div>

        {#if editable}
          <div class="invoice-editable-cell">
            {#each products as product, index}
              <div>
                <button on:click={() => removeProduct(index)}
                  >{index + 1}</button
                >
              </div>
            {/each}

            {#if products.length <= 5}
              <Button type="primary" on:click={addProduct}>+</Button>
            {/if}
          </div>
          <div class="invoice-editable-cell">
            {#each products as product, index}
              <div>
                <textarea
                  rows="3"
                  class="w-full px-1 border border-gray-400"
                  placeholder="type description"
                  value={product.description}
                  on:input={(e) =>
                    handleFieldChange(
                      `invoiceProducts[${index}].description`,
                      e.target.value
                    )}
                />
              </div>
            {/each}
            {#if data?.euroToLeu > 0}
              <div class="logger-align-left">Curs euro: {data.euroToLeu}</div>
            {/if}
          </div>
          <div class="invoice-editable-cell">
            {#each products as product, index}
              <div>
                <input
                  class="w-full px-1"
                  placeholder="type um"
                  value={product.um}
                  on:input={(e) =>
                    handleFieldChange(
                      `invoiceProducts[${index}].um`,
                      e.target.value
                    )}
                />
              </div>
            {/each}
          </div>
          <div class="invoice-editable-cell">
            {#each products as product, index}
              <div>
                <input
                  class="w-full px-1"
                  placeholder="type quantity"
                  value={product.quantity}
                  type="number"
                  on:input={(e) =>
                    handleFieldChange(
                      `invoiceProducts[${index}].quantity`,
                      e.target.value
                    )}
                />
              </div>
            {/each}
          </div>
          <div class="invoice-editable-cell">
            {#each products as product, index}
              <div>
                <input
                  class="w-full px-1"
                  placeholder="type pricePerUnit"
                  type="number"
                  value={product.pricePerUnit}
                  on:input={(e) =>
                    handleFieldChange(
                      `invoiceProducts[${index}].pricePerUnit`,
                      e.target.value
                    )}
                />
              </div>
            {/each}
          </div>
          <div class="invoice-editable-cell">
            {#each products as product}
              <div>
                {format(getProductTotal(product))} RON
              </div>
            {/each}
          </div>
          <div class="invoice-editable-cell">
            {#each products as product}
              <div>
                {format(getProductTVA(product))} RON
              </div>
            {/each}
          </div>
        {:else}
          {#each products as product, index}
            <div class="invoice-readonly-cell">{index + 1}</div>
            <div
              class="fakeHeightHelper invoice-readonly-cell logger-align-left"
            >
              {product.description}
            </div>
            <div class="invoice-readonly-cell">{product.um}</div>
            <div class="invoice-readonly-cell">{product.quantity}</div>
            <div class="invoice-readonly-cell">{format(product.pricePerUnit)} RON</div>
            <div class="invoice-readonly-cell">
              {format(getProductTotal(product))} RON
            </div>
            <div class="invoice-readonly-cell">
              {format(getProductTVA(product))} RON
            </div>
          {/each}

          <div class="invoice-readonly-cell" />
          <div class="invoice-readonly-cell">
            {#if data?.euroToLeu > 0}
              <div class="mt-4 logger-align-left">
                Curs euro: {data.euroToLeu}
              </div>
            {/if}
          </div>
          <div class="invoice-readonly-cell" />
          <div class="invoice-readonly-cell" />
          <div class="invoice-readonly-cell" />
          <div class="invoice-readonly-cell" />
          <div class="invoice-readonly-cell" />

          <div bind:this={fakeHeightDivRef} />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
        {/if}

        <div class="invoice-stamp logger-align-left">
          Sumnatura si stampila furnizorului
        </div>
        <div class="inovice-delegate-info-cell logger-align-left">
          <div>Date privind expeditia:</div>
          <div>Numele delegatului: {fromCompany?.delegat_nume}</div>
          <div>CNP: {fromCompany?.delegat_cnp}</div>
          <div>
            B.I./C.I. seria {fromCompany?.delegat_ciSerie} nr {fromCompany?.delegat_ciNr}
            eliberat(a) {fromCompany?.delegat_eliberatDe}
          </div>
          <div>Mijloc de transport <span class="mx-10" /> nr.</div>
          <div>Expeditia s-a facut in prezenta noastra la</div>
          <div>data de {dayjs(data?.date).format("DD-MM-YYYY")}</div>
          <div>Semnaturile:</div>
          <div class="text-red-600">
            Factura valabila fara semnatura si stampila cf. art. 319 alin(29)
          </div>
        </div>
        <div class="logger-align-left">
          <div>Total</div>
        </div>
        <div>{format(getTotalWithoutTVA(data))} RON</div>
        <div>{format(getTotalTVA(data))} RON</div>
        <div class="logger-align-left">din care, accize</div>
        <div class="invoice-accize logger-align-left" />
        <div class="logger-align-left">
          <div>Semnatura</div>
          <div>de primire:</div>
        </div>
        <div class="invoice-total">
          <div class="flex justify-center items-center h-full">
            <b>Total {getTotal(data).toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} RON</b>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .invoice {
    width: 100%;
    text-align: center;
    line-height: 20px;
    border-top: 1px solid black;
    border-left: 1px solid black;
  }

  .invoice .invoice-row > div {
    border-bottom: 1px solid black;
    border-right: 1px solid black;
    padding-top: 5px;
  }

  .invoice-row {
    display: grid;
    grid-template-columns: 65px auto 50px 50px auto minmax(90px, auto) minmax(
        90px,
        auto
      );
  }

  .invoice-stamp {
    grid-row: 3 span;
  }

  .invoice-accize {
    grid-column: 2 span;
  }

  .invoice-total {
    grid-column: 2 span;
    width: 100%;
    height: 100%;
  }

  .invoice-readonly-cell {
    border-bottom: 0 !important;
  }

  .invoice-editable-cell {
    height: 450px;
  }

  .invoice-editable-cell > div {
    height: 70px;
  }

  .inovice-delegate-info-cell {
    line-height: 12px;
    grid-column: 3 span;
    grid-row: 3 span;
  }

  .logger-align-left {
    padding: 5px;
    padding-top: 0;
    text-align: left;
    line-height: 12px;
  }

  table td {
    vertical-align: top;
  }

  input {
    border: 1px solid gray;
  }
</style>
