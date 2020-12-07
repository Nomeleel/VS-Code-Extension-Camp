import { Disposable, TextEditor, TreeDataProvider, TreeItem, window } from "vscode";


export class JsonOutlineProvider implements TreeDataProvider<JsonItem>, Disposable {

	protected subscriptions: Disposable[] = [];

  protected activeEditor: TextEditor | undefined;

  public getTreeItem(element: JsonItem): TreeItem {
		return element;
  }
  
  public getChildren(element: JsonItem): JsonItem[] {
    console.log(window.activeTextEditor?.document.getText());
    console.log(window.activeTextEditor?.selections);
		return [new JsonItem('123'), new JsonItem('321')];
	}

	public dispose() {
		this.activeEditor = undefined;
		this.subscriptions.forEach((s) => s.dispose());
	}
}

export class JsonItem extends TreeItem {

}