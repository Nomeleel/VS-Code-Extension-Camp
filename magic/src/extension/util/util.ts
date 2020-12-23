import { commands, window, workspace } from "vscode";

export function activePositionText() : string | undefined {
    if (window.activeTextEditor) {
      let textEditor = window.activeTextEditor;
      let document = textEditor.document;
      return document.getText(document.getWordRangeAtPosition(textEditor.selection.active));
    }
}


export async function dartOrganizeImports(path?: string) {
  let textDocument = path ? (await workspace.openTextDocument(path)) : window.activeTextEditor?.document;
  await commands.executeCommand('_dart.organizeImports', textDocument);
}