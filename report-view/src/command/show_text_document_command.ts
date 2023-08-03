import { commands, Position, Range, Selection, TextEditorRevealType, Uri, window, workspace } from "vscode";
import { DisposableBase } from "../common/report_base";

export class ShowTextDocumentCommand extends DisposableBase {
  constructor() {
    super();
    this.disposables.push(
      commands.registerCommand('showTextDocument', this.showTextDocument, this),
    );
  }

  async showTextDocument(uri: Uri, start?: number, label?: string): Promise<void> {
    const textDocument = await workspace.openTextDocument(uri);
    const activeEditor = await window.showTextDocument(textDocument!);
    let range = new Range(new Position(0, 0), new Position(0, 0));
    if (start && label) {
      for (let line = textDocument.positionAt(start).line; line <= textDocument.lineCount; line++) {
        let col = textDocument.lineAt(line).text.indexOf(label)
        if (col != -1) {
          start = textDocument.offsetAt(new Position(line, col));
          break;
        }
      }

      range = new Range(textDocument.positionAt(start), textDocument.positionAt(start + label.length));
    }
    activeEditor.selection = new Selection(range.start, range.end);
    activeEditor.setDecorations(
      window.createTextEditorDecorationType({
        fontStyle: 'oblique',
        textDecoration: 'line-through orange',
        cursor: 'pointer'
      }),
      [range]
    );
    activeEditor.revealRange(range, TextEditorRevealType.InCenterIfOutsideViewport);
  }
}