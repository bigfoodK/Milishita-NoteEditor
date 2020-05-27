import { store } from "~StateStore/store";
import { Mode } from "~NoteView/types";
import { CancellationToken, runAddLongNoteProcess } from "~runAddLongNoteProcess";

export class ModeSelectHandler {
  private prevMode?: Mode;
  private static longNoteProcessCancellationToken?: CancellationToken;
  private static runAddLongNoteProcessPromise?: ReturnType<typeof runAddLongNoteProcess>;
  constructor() {
    store.subscribe(() => {
      const { mode } = store.getState().modeState;
      const { prevMode } = this;
      this.prevMode = mode;
      ModeSelectHandler.onModeChanged(prevMode, mode);
    });
  }

  private static onModeChanged(previousMode: Mode | undefined, nextMode: Mode) {
    if (previousMode !== nextMode) {
      console.log(`mode changed. ${previousMode}-> ${nextMode}`);
      if (previousMode === 'longNoteEdit') {
        this.longNoteProcessCancellationToken?.cancel();
        this.runAddLongNoteProcessPromise = undefined;
      }
      if (nextMode === 'longNoteEdit' && !this.runAddLongNoteProcessPromise) {
        this.initRunAddLongNoteProcess();
      }
    }
  }

  private static initRunAddLongNoteProcess() {
    this.longNoteProcessCancellationToken = new CancellationToken();
    this.runAddLongNoteProcessPromise = runAddLongNoteProcess(this.longNoteProcessCancellationToken)
      .then(() => {
        if (store.getState().modeState.mode === 'longNoteEdit') {
          this.initRunAddLongNoteProcess();
        }
      });
  }
}