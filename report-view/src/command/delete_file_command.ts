import { commands, window, workspace, WorkspaceEdit } from "vscode";
import { DisposableBase } from "../common/report_base";

export class DeleteFileCommand extends DisposableBase {
  constructor() {
    super();
    this.disposables.push(
      commands.registerCommand('report-view.deleteFile', this.deleteFile, this),
    );
  }

  public deleteFile(): void {
    if (window.activeTextEditor) {
      const workspaceEdit = new WorkspaceEdit();
      workspaceEdit.deleteFile(window.activeTextEditor.document.uri);
      workspace.applyEdit(workspaceEdit);
    }
  }
}