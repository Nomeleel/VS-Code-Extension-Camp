import { Disposable, Position, Range, TextEditor, TreeDataProvider, TreeItem, TreeItemCollapsibleState, window, workspace } from "vscode";


export class FieldOutlineProvider implements TreeDataProvider<FieldItem>, Disposable {

	protected subscriptions: Disposable[] = [];

  protected activeEditor: TextEditor | undefined;

	protected rootNode: FieldItem | undefined;

	constructor() {
		this.rootNode = new FieldItem('ABC');
		let abcFieldItem = new FieldItem('abc');
		abcFieldItem.setChildren([
			new FieldItem('a'),
			new FieldItem('b'),
			new FieldItem('c'),
		]);
		//abcFieldItem.parent = this.rootNode;
		this.rootNode.setChildren([
			abcFieldItem,
			new FieldItem('def'),
			new FieldItem('ght')
		]);
	}

  public getTreeItem(element: FieldItem): TreeItem {
		return element;
  }
  
  public getChildren(element: FieldItem): FieldItem[] {
		if (element) {
			return element.children;
		}
		if (this.rootNode) {
			return this.rootNode.children;
		}
		return [];
		//return this.rangesOf('type').map<FieldItem>((e) => new FieldItem(e.start.line.toString()));
	}
	
	// public getParent(element: FieldItem): FieldItem | undefined {
	// 	return element.parent;
	// }

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

export class FieldItem extends TreeItem {
	public parent: FieldItem | undefined;
	public children: FieldItem[] = [];

	public setChildren(children: FieldItem[]) {
		this.children = children;
		this.collapsibleState = children ? TreeItemCollapsibleState.Expanded : TreeItemCollapsibleState.None;
	}
}