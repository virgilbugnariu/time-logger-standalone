import dayjs from "dayjs";
import { toast } from "svelte-toastify";
import { exportBackup, importBackup } from "../../db";
import { eifActions } from "../../store";
import ConfirmationParagraph from "../common/ConfirmationParagraph.svelte";
import { pickTextFile, saveFile } from "../utils";

export async function backupData() {
  try {
    const backup = await exportBackup();
    const saved = await saveFile(
      `time-logger-backup-${dayjs().format('YYYY-MM-DD')}.json`,
      JSON.stringify(backup, null, 2),
    );

    if (saved) {
      toast.success('Backup saved');
    }
  } catch (error) {
    console.error(error);
    toast.error('Could not save the backup 😱');
  }
}

export async function restoreData() {
  let backup: unknown;
  try {
    const content = await pickTextFile('.json,application/json');
    if (content === null) {
      return;
    }
    backup = JSON.parse(content);
  } catch {
    toast.error('Could not read that file');
    return;
  }

  eifActions.pushLayoutBlock({
    title: 'Restore backup',
    type: 'modal',
    dataPath: '',
    component: ConfirmationParagraph,
    extraProps: { text: 'This replaces ALL current data with the contents of the backup. Continue?' },
    actions: [
      { title: 'no', action: (block) => eifActions.popLayoutBlock(block.blockId) },
      {
        title: 'yes',
        async action(block) {
          try {
            await importBackup(backup);
            // Reload so every slice is rebuilt from the restored data.
            window.location.reload();
          } catch (error: any) {
            eifActions.popLayoutBlock(block.blockId);
            toast.error(error?.message || 'Could not restore the backup 😱');
          }
        },
      },
    ],
  });
}
