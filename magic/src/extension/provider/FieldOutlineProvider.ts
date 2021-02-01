import * as path from "path";
import { Command, commands, Disposable, Event, EventEmitter, extensions, Position, Range, TextDocument, TextEditor, TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri, window, workspace } from "vscode";
import { getConfiguration } from "../util/util";

export class FieldOutlineProvider implements TreeDataProvider<FieldItem>, Disposable {

  protected disposables: Disposable[] = [];

  protected activeEditor: TextEditor | undefined;

  protected rootNode: FieldItem | undefined;

  // TODO(Nomeleel): 当作常量提取出去
  protected extensionPath: string = extensions.getExtension('Nomeleel.magic')!.extensionPath;

  protected onDidChangeTreeDataEmitter: EventEmitter<FieldItem | undefined> = new EventEmitter<FieldItem | undefined>();
  public readonly onDidChangeTreeData: Event<FieldItem | undefined> = this.onDidChangeTreeDataEmitter.event;

  constructor() {
    this.disposables.push(
      window.createTreeView("outline.field", { treeDataProvider: this, showCollapseAll: true })
    );

    this.disposables.push(window.onDidChangeActiveTextEditor((e) => this.listenerJsonFile(e)));
    this.disposables.push(workspace.onDidChangeTextDocument((e) => this.listenerJsonFile(window.activeTextEditor)));
    this.disposables.push(workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('magic.outline.fieldArray')) {
        this.listenerJsonFile(window.activeTextEditor);
      }
    }));

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

  public getParent(element: FieldItem): FieldItem | undefined {
    return element.parent;
  }

  public listenerJsonFile(textEditor: TextEditor | undefined) {
    this.onDidChangeTreeDataEmitter.fire(undefined);
    if (textEditor && this.isTargerJsonFile(textEditor)) {
      this.switchOutlineView(true);
      let fieldArray = this.getFieldArray();
      if (fieldArray.length > 0) {
        this.rootNode = new FieldItem('Field Outline');
        let children = new Array<FieldItem>();
        let ePlusList = fieldArray.map(e => this.parseField(e));
        const doc = textEditor.document;
        if (doc) {
          this.rangesByField(doc, ePlusList, children);
        }
        this.rootNode.setChildren(children);
      }
    } else {
      this.switchOutlineView(false);
      this.rootNode = undefined;
    }
    this.onDidChangeTreeDataEmitter.fire(this.rootNode);
  }

  private switchOutlineView(visible: boolean) {
    commands.executeCommand("setContext", 'magic.showOutline', visible);
  }

  public pagination(fieldItemArray: Array<FieldItem>, pageSize: number): Array<FieldItem> {
    if (fieldItemArray.length > pageSize) {
      let fieldItemPageArray = new Array<FieldItem>();
      let totalPage = Math.ceil(fieldItemArray.length / pageSize);
      for (let page = 1; page <= totalPage; page++) {
        let fieldItemPage = new FieldItem('', this.getUri('constant-light.svg'), `Page: ${totalPage}/${page}`);
        fieldItemPage.setChildren(fieldItemArray.slice((page - 1) * pageSize, page * pageSize));
        fieldItemPageArray.push(fieldItemPage);
      }
      return fieldItemPageArray;
    } else {
      return fieldItemArray;
    }
  }

  public getPageSize(): number {
    return getConfiguration<number>('magic.outline.pageSize') ?? 20;
  }

  public getUri(filePath: string): Uri {
    return Uri.file(path.join(this.extensionPath, 'resources', 'icons', filePath));
  }

  public parseField(field: string): { field: string, regExp: string } {
    let fieldPlus = field.split('/');
    return { field: fieldPlus[0], regExp: fieldPlus.length === 2 ? fieldPlus[1] : '' };
  }

  public jumpToCommand(range: Range): Command {
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

  public isTargerJsonFile(textEditor: TextEditor): boolean {
    let uri: Uri = textEditor.document.uri;
    return uri.scheme === "file" && path.parse(uri.fsPath).ext === ".json";
  }

  public findFieldItem(textDocument: TextDocument, lineIndex: number, search: { field: string, regExp: string }): FieldItem | undefined {
    if (textDocument) {
      let findIndex = textDocument.lineAt(lineIndex).text.indexOf(search.field);
      if (findIndex !== -1) {
        let textRange = textDocument.getWordRangeAtPosition(new Position(lineIndex, findIndex + search.field.length + 4), /([^\"]+)/g);
        if (textRange) {
          let valueText = textDocument.getText(textRange);
          if (!search.regExp || new RegExp(search.regExp).test(valueText)) {
            return new FieldItem(valueText, this.getUri('method-light.svg'),
              (textRange.start.line + 1).toString(), this.jumpToCommand(textRange));
          }
        }
      }
    }
  }

  public rangesByOrder(textDocument: TextDocument, searchArray: Array<{ field: string, regExp: string }>, children: Array<FieldItem>) {
    for (let index = 0; index < textDocument?.lineCount ?? 0; index++) {
      searchArray.forEach(e => {
        let fieldItem = this.findFieldItem(textDocument, index, e);
        if (fieldItem) {
          let last = children.length > 0 ? children[children.length - 1] : undefined;
          let parentItem = new FieldItem(e.field, this.getUri('constant-light.svg'), e.regExp);
          // 临近相同的进行合并
          if (last && last.equal(parentItem)) {
            last.children.push(fieldItem);
          } else {
            parentItem.setChildren([fieldItem]);
            children.push(parentItem);
          }
        }
      });
    }
  }

  public rangesByField(textDocument: TextDocument, searchArray: Array<{ field: string, regExp: string }>, children: Array<FieldItem>) {
    let pageSize = this.getPageSize();
    searchArray.forEach((e) => {
      let fieldItem = new FieldItem(e.field, this.getUri('constant-light.svg'), e.regExp);
      fieldItem.setChildren(this.pagination(this.rangesTo(textDocument, e), pageSize));
      children.push(fieldItem);
    });
  }

  public rangesTo(textDocument: TextDocument, search: { field: string, regExp: string }): FieldItem[] {
    const results: FieldItem[] = [];
    for (let index = 0; index < textDocument?.lineCount ?? 0; index++) {
      let fieldItem = this.findFieldItem(textDocument, index, search);
      if (fieldItem) {
        results.push(fieldItem);
      }
    }
    return results;
  }

  public getFieldArray(): Array<string> {
    return getConfiguration<Array<string>>('magic.outline.fieldArray');
  }

  public dispose() {
    this.activeEditor = undefined;
    this.disposables.forEach((d) => d.dispose());
  }
}

export class FieldItem extends TreeItem {
  public parent: FieldItem | undefined;
  public children: FieldItem[] = [];

  constructor(title: string, iconPath?: Uri, description?: string, command?: Command) {
    super(title);
    this.iconPath = iconPath;
    this.command = command;
    this.description = description;
  }

  public setChildren(children: FieldItem[]) {
    this.children = children;
    this.collapsibleState = (children && children.length > 0) ?
      TreeItemCollapsibleState.Expanded : TreeItemCollapsibleState.None;
  }

  public equal(fieldItem: FieldItem): boolean {
    return this.label === fieldItem.label && this.description === fieldItem.description;
  }
}
