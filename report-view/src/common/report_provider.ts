import * as fs from "fs/promises";
import { join } from "path";
import { TextDocument, window, workspace, WorkspaceFolder } from 'vscode';
import { TreeDataProviderBase, TreeNode } from "./report_base";

export abstract class ReportProvider extends TreeDataProviderBase<TreeNode> {
  constructor(public readonly viewId: string, public readonly reportFile: string) {
    super();
    this.disposables.push(
      window.createTreeView(viewId, { treeDataProvider: this, showCollapseAll: true }),
      workspace.onDidSaveTextDocument((e) => this.listenReportFile(e)),
    );
    this.reportToView();
  }

  private async reportToView(): Promise<void> {
    this.parse().then(value => this.updateTreeView(value));
  }

  private async listenReportFile(textDocument: TextDocument): Promise<void> {
    if (textDocument.uri.path.endsWith(this.reportFile)) this.reportToView();
  }

  private async parse(): Promise<TreeNode | undefined> {
    const curWorkspace = workspace.workspaceFolders?.[0];
    if (!curWorkspace) return;
    const reportPath = join(curWorkspace.uri.path, this.reportFile);
    try {
      const content = await fs.readFile(reportPath, 'utf-8');
      return this.parseNode(curWorkspace, JSON.parse(content));
    } catch (e){
      console.error(e);
    }
  }

  abstract parseNode(workspace: WorkspaceFolder, obj: any): TreeNode;
}