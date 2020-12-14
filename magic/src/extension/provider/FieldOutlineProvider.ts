import * as path from "path";
import { Command, Disposable, Event, EventEmitter, extensions, Position, Range, TextEditor, TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri, window, workspace } from "vscode";

export class FieldOutlineProvider implements TreeDataProvider<FieldItem>, Disposable {

  protected subscriptions: Disposable[] = [];

  protected activeEditor: TextEditor | undefined;

  protected rootNode: FieldItem | undefined;

  protected extensionPath : string = extensions.getExtension('Nomeleel.magic')!.extensionPath;

  protected onDidChangeTreeDataEmitter: EventEmitter<FieldItem | undefined> = new EventEmitter<FieldItem | undefined>();
  public readonly onDidChangeTreeData: Event<FieldItem | undefined> = this.onDidChangeTreeDataEmitter.event;

  constructor() {
    this.subscriptions.push(window.onDidChangeActiveTextEditor((e) => this.listenerJsonFile(e)));
    this.subscriptions.push(workspace.onDidChangeTextDocument((e) => this.listenerJsonFile(window.activeTextEditor)));
    if (window.activeTextEditor) {
      this.listenerJsonFile(window.activeTextEditor);
    }
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
    this.onDidChangeTreeDataEmitter.fire(undefined);
    if (textEditor && this.isTargerJsonFile(textEditor)) {
      let fieldArray = this.getFieldArray();
      if (fieldArray.length > 0) {
        this.rootNode = new FieldItem('Field Outline');
        let children = new Array<FieldItem>();
        fieldArray.forEach((e) => {
          let fieldItem = new FieldItem(e, this.getUri('constant-light.svg'));
          fieldItem.setChildren(this.rangesOf(textEditor, e).map((range) => {
            return new FieldItem(textEditor.document.getText(range), this.getUri('method-light.svg'), this.jumpToCommand(range));
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

  public getUri(filePath: string) : Uri {
    return Uri.file(path.join(this.extensionPath, `resources\\icons\\${filePath}`));
  }

  public jumpToCommand(range: Range) : Command {
    return {
      command: "magic.jumpToEditor",
      arguments: [
        window.activeTextEditor,
        range,
        range,
      ],
      title: "Jump To",
    };
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
          let textRange = doc.getWordRangeAtPosition(new Position(index, findIndex + searchText.length + 4), /([^\"]+)/g);
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

  constructor(title: string, iconPath?: Uri, command?: Command) {
    super(title);
    this.iconPath = iconPath;
    this.command = command;
  }

  public setChildren(children: FieldItem[]) {
    this.children = children;
    this.collapsibleState = (children && children.length > 0) ? 
      TreeItemCollapsibleState.Expanded : TreeItemCollapsibleState.None;
  }
}
