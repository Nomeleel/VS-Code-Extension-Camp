import * as path from "path";
import { Disposable, Event, EventEmitter, Position, Range, Selection, TextEditor, TextEditorRevealType, TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri, window, workspace } from "vscode";

export class FieldOutlineProvider implements TreeDataProvider<FieldItem>, Disposable {

  protected subscriptions: Disposable[] = [];

  protected activeEditor: TextEditor | undefined;

  protected rootNode: FieldItem | undefined;

  protected onDidChangeTreeDataEmitter: EventEmitter<FieldItem | undefined> = new EventEmitter<FieldItem | undefined>();
  public readonly onDidChangeTreeData: Event<FieldItem | undefined> = this.onDidChangeTreeDataEmitter.event;

  constructor() {
    this.subscriptions.push(window.onDidChangeActiveTextEditor((e) => this.listenerJsonFile(e)));
    if (window.activeTextEditor) {
      this.listenerJsonFile(window.activeTextEditor);
    }
    //setInterval(() => this.listenerJsonFile(window.activeTextEditor), 200);
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
  }
  
  // public getParent(element: FieldItem): FieldItem | undefined {
  //   return element.parent;
  // }

  public listenerJsonFile(textEditor: TextEditor | undefined) {
    console.log('-----');
    this.onDidChangeTreeDataEmitter.fire(undefined);
    if (textEditor && this.isTargerJsonFile(textEditor)) {
      let fieldArray = this.getFieldArray();
      if (fieldArray.length > 0) {
        this.rootNode = new FieldItem('Field Outline');
        let children = new Array<FieldItem>();
        fieldArray.forEach((e) => {
          let fieldItem = new FieldItem(e);
          fieldItem.setChildren(this.rangesOf(textEditor, e).map((range) => {
            let item = new FieldItem(textEditor.document.getText(range));
            item.command = {
              command: "magic.jumpToEditor",
              arguments: [
                textEditor,
                range,
                range,
              ],
              title: "Jump To",
            };
            return item;
          }));
          children.push(fieldItem);
        });
        this.rootNode.setChildren(children);
      }
    } else {
      this.rootNode = undefined;
    }
    this.onDidChangeTreeDataEmitter.fire(this.rootNode);
  }

  public isTargerJsonFile(textEditor: TextEditor) : boolean{
    let uri: Uri = textEditor.document.uri;
    return uri.scheme === "file" && path.parse(uri.fsPath).ext === ".json";
  }

  public rangesOf(textEditor: TextEditor, searchText: string): Range[] {
    const doc = textEditor.document;
    const results: Range[] = [];
    if (doc) {
      for (let index = 0; index < doc.lineCount; index++) {
        let findIndex = doc.lineAt(index).text.indexOf(searchText);
        if (findIndex !== -1) {
          let textRange = doc.getWordRangeAtPosition(new Position(index, findIndex + searchText.length + 4), /([^\"\s]+)/g);
          if (textRange) {
            results.push(textRange);
          }
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
    this.collapsibleState = (children && children.length > 0) ? 
      TreeItemCollapsibleState.Expanded : TreeItemCollapsibleState.None;
  }
}
