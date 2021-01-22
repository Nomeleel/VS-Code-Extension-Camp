import { commands, Position, Range, Selection, TextEditor, TextEditorRevealType, window } from "vscode";
import { BaseDisposable } from "../BaseDisposable";
import { isString, openTextDocument, rangesOfOne } from "../util/util";

export class JumpToEditorCommand extends BaseDisposable  {

	constructor() {
    super();
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

    let displayRange : Range | undefined;
    
    if (target) {
      if (isString(target)) {
        console.log(target.toString());
        displayRange = rangesOfOne(editor, target.toString());
        selectionRange = displayRange;
      } else if (target instanceof Range) {
        displayRange = target;
      } else {
        // Nothing to do.
      }
    } 

    if (!displayRange) {
      displayRange = new Range(new Position(0, 0), new Position(0, 0));
    }

    if (selectionRange) {
      editor.selection = new Selection(selectionRange.start, selectionRange.end);
    }

    editor.revealRange(displayRange, TextEditorRevealType.InCenterIfOutsideViewport);
  }
}