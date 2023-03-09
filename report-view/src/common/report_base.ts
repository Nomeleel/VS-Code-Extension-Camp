import { Disposable, Event, EventEmitter, TreeDataProvider, TreeItem, TreeItemCollapsibleState } from 'vscode';

export class DisposableBase implements Disposable {
  public disposables: Disposable[] = [];

  public dispose(): any {
    this.disposables.forEach((e) => e.dispose());
  }
}

export class TreeDataProviderBase<T extends TreeNode> extends DisposableBase implements TreeDataProvider<TreeNode> {

  protected rootNode: T | undefined;

  protected onDidChangeTreeDataEmitter: EventEmitter<T | undefined | null | void> = new EventEmitter<T | undefined | null | void>();
  public readonly onDidChangeTreeData: Event<T | undefined | null | void> = this.onDidChangeTreeDataEmitter.event;

  public updateTreeView(treeNode?: T) {
    this.rootNode = treeNode;
    this.onDidChangeTreeDataEmitter.fire();
  }

  public getTreeItem(element: T): TreeNode {
    return element;
  }

  public getChildren(element?: T): TreeNode[] {
    return element ? element.children : (this.rootNode?.children || []);
  }

  public getParent(element: T): TreeNode | undefined {
    return element.parent;
  }
}

export class TreeNode extends TreeItem {
  public parent: TreeNode | undefined;
  public children: TreeNode[] = [];

  public setChildren(children: TreeNode[] | undefined) {
    this.children = children ?? [];
    this.collapsibleState = this.children.length > 0 ? TreeItemCollapsibleState.Expanded : TreeItemCollapsibleState.None;
  }
}