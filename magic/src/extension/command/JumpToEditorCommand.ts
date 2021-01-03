import { commands, Disposable, Position, Range, Selection, TextEditor, TextEditorRevealType, window } from "vscode";
import { isString, openTextDocument, rangesOfOne } from "../util/util";

export class JumpToEditorCommand implements Disposable {
	private disposables: Disposable[] = [];

	constructor() {
		this.disposables.push(
			commands.registerCommand("magic.jumpToEditor", JumpToEditorCommand.jumpToEditor, this),
		);
  }

  static async jumpToEditor(editor?: TextEditor, target?: String | Range, selectionRange?: Range) {
    if (!editor) {
      editor = window.activeTextEditor!;
    } else {
      await openTextDocument(editor.document.uri.fsPath);
    }

    let displayRange;
    
    if (target && isString(target)) {
      console.log(target.toString());
      displayRange = rangesOfOne(editor, target.toString());
      console.log(displayRange);
      console.log(displayRange);
      selectionRange = displayRange;
    }

    if (!displayRange) {
      displayRange = new Range(new Position(0, 0), new Position(0, 0));
    }

    if (selectionRange) {
      editor.selection = new Selection(selectionRange.start, selectionRange.end);
    }

    editor.revealRange(displayRange, TextEditorRevealType.InCenterIfOutsideViewport);
  }

  public dispose(): any {
		this.disposables.forEach((e) => e.dispose());
	}
}