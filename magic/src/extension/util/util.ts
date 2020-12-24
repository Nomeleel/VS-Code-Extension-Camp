import { commands, TextEdit, Uri, window, workspace, WorkspaceEdit } from "vscode";

export function activePositionText() : string | undefined {
    if (window.activeTextEditor) {
      let textEditor = window.activeTextEditor;
      let document = textEditor.document;
      return document.getText(document.getWordRangeAtPosition(textEditor.selection.active));
    }
}

export async function dartFileEdit(textEdits: Array<TextEdit>, uri?: Uri) {
  uri = uri ? uri : window.activeTextEditor?.document.uri;
  if (uri) {
    let workspaceEdit = new WorkspaceEdit();
    workspaceEdit.set(uri, textEdits);
    await workspace.applyEdit(workspaceEdit);
    await workspace.saveAll();

    await dartOrganizeImports(uri);
  }
}

export async function dartOrganizeImports(uri?: Uri) {
  let textDocument = uri ? (await workspace.openTextDocument(uri)) : window.activeTextEditor?.document;
  await commands.executeCommand('_dart.organizeImports', textDocument);
}

export async function realLineCount(uri: Uri) : Promise<number> {
  let textDocument = await workspace.openTextDocument(uri);
  let lineCount: number = textDocument.lineCount;
  while(textDocument.lineAt(lineCount - 1).isEmptyOrWhitespace) {
    lineCount--;
  }
  return lineCount;
}