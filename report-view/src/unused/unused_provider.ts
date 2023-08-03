import { Uri, WorkspaceFolder } from 'vscode';
import { TreeNode } from "../common/report_base";
import { ReportProvider } from "../common/report_provider";
import { Unused } from "./unused_model";
import { IssueNode, UnusedNode } from "./unused_node";

export abstract class UnusedProvider extends ReportProvider {
  constructor(id: string) {
    super(`unused.${id}.view`, `unused_${id}_report.json`);
  }

  abstract unusedNode(obj: any): any;

  public parseNode(workspace: WorkspaceFolder, obj: any): TreeNode {
    const reports = this.unusedNode(obj) as Unused[];
    const treeNode = new TreeNode(workspace.name);

    treeNode.setChildren(
      reports.map(u => {
        const uri = Uri.joinPath(workspace.uri, u.path);
        const unused = new UnusedNode(u.path, uri);
        unused.setChildren(
          u.issues?.map(i => {
            return new IssueNode(i.declarationName, uri, i.declarationType, i.offset);
          })
        );

        return unused;
      })
    );
    return treeNode;
  }
}