import { Disposable, Position, Range, TextEditor, TreeDataProvider, TreeItem, window, workspace } from "vscode";


export class FieldOutlineProvider implements TreeDataProvider<JsonItem>, Disposable {

	protected subscriptions: Disposable[] = [];

  protected activeEditor: TextEditor | undefined;

  public getTreeItem(element: JsonItem): TreeItem {
		return element;
  }
  
  public getChildren(element: JsonItem): JsonItem[] {
		let fieldArray = this.getFieldArray();
		console.log(fieldArray);
		return this.rangesOf('type').map<JsonItem>((e) => new JsonItem(e.start.line.toString()));
	}
	
	public rangesOf(searchText: string): Range[] {
		const doc = window.activeTextEditor?.document;
		const results: Range[] = [];
		if (doc) {
			for (let index = 0; index < doc.lineCount; index++) {
				let findIndex = doc.lineAt(index).text.indexOf(searchText);
				if (findIndex !== -1) {
					results.push(new Range(new Position(index, searchText.length), new Position(index, searchText.length)));
				}
			}
		}
		return results;
	}

  public getFieldArray() : Array<string>{
    let configuration = workspace.getConfiguration();
    let fieldArray = configuration.get('magic.outline.fieldArray') as Array<string>;
    return fieldArray;
  }

	public dispose() {
		this.activeEditor = undefined;
		this.subscriptions.forEach((s) => s.dispose());
	}
}

export class JsonItem extends TreeItem {

}