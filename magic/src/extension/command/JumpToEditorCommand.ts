import { commands, Disposable, Range, Selection, TextEditor, TextEditorRevealType } from "vscode";

export class JumpToEditorCommand implements Disposable {
	private disposables: Disposable[] = [];

	constructor() {
		this.disposables.push(
			commands.registerCommand("magic.jumpToEditor", this.jumpToEditor, this),
		);
  }

  private jumpToEditor(editor: TextEditor, displayRange: Range, selectionRange?: Range) {
    if (selectionRange) {
      editor.selection = new Selection(selectionRange.start, selectionRange.end);
    }

    editor.revealRange(displayRange, TextEditorRevealType.InCenterIfOutsideViewport);
  }

  public dispose(): any {
		this.disposables.forEach((e) => e.dispose());
	}
}