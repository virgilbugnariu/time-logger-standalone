import { isTauri } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';



export function promiseDelay(timeout: number) {
  return new Promise<void>((res) => {
    setTimeout(() => {
      res();
    }, timeout)
  })
}

/**
 * Saves a file to disk. Inside the desktop app this opens a native save dialog
 * (webviews don't reliably support `<a download>`); in a browser it falls back
 * to a regular download.
 */
export async function saveFile(filename: string, data: Blob | string): Promise<boolean> {
  const blob = typeof data === 'string' ? new Blob([data], { type: 'text/plain;charset=utf-8' }) : data;

  if (isTauri()) {
    const path = await save({ defaultPath: filename });
    if (!path) {
      return false;
    }

    await writeFile(path, new Uint8Array(await blob.arrayBuffer()));
    return true;
  }

  const url = URL.createObjectURL(blob);
  const element = document.createElement('a');
  element.setAttribute('href', url);
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
  URL.revokeObjectURL(url);
  return true;
}

/** Lets the user pick a file and returns its text content, or null if cancelled. */
export function pickTextFile(accept: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      file.text().then(resolve, reject);
    });
    input.addEventListener('cancel', () => resolve(null));
    input.click();
  });
}

const PDF_OPTIONS = {
  html2canvas: {
    scale: 2,
    letterRendering: true,
  },
  pageBreak: {
    mode: ['legacy'],
  },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
};

export async function savePdf(filename: string, element: HTMLElement | null) {
  if (!element) {
    return false;
  }

  const { default: html2pdf } = await import('html2pdf.js');
  const blob: Blob = await html2pdf().set(PDF_OPTIONS).from(element).outputPdf('blob');
  return saveFile(filename, blob);
}
