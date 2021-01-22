import { Disposable, languages, Position, Range, TextEditor, TreeDataProvider, TreeItem, window } from "vscode";


export class JsonOutlineProvider implements TreeDataProvider<JsonItem>, Disposable {

	protected activeEditor: TextEditor | undefined;

	public disposables: Disposable[] = [];

	constructor() {
		this.disposables.push(window.createTreeView("outline.json", { treeDataProvider: this, showCollapseAll: true }));
	}

	public getTreeItem(element: JsonItem): TreeItem {
		return element;
	}

	public getChildren(element: JsonItem): JsonItem[] {
		//console.log(window.activeTextEditor?.document.getText());
		//console.log(window.activeTextEditor?.selections);
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

	public dispose() {
		this.activeEditor = undefined;
		this.disposables.forEach((d) => d.dispose());
	}
}

export class JsonItem extends TreeItem {

}