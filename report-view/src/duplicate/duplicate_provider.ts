import { sep } from "path";
import { Command, commands, Position, Range, TextEditorRevealType, Uri, ViewColumn, window, workspace, WorkspaceFolder } from 'vscode';
import { TreeNode } from "../common/report_base";
import { ReportProvider } from "../common/report_provider";
import { Duplicate, DuplicateItem, DuplicatePosition } from './duplicate_model';
import { DuplicateItemNode, DuplicateNode } from './duplicate_node';

export class DuplicateProvider extends ReportProvider {
  constructor() {
    super('duplicate.view', 'duplicate_report.json');
    this.disposables.push(
      commands.registerCommand('showDuplicateTextDocument', this.showDuplicateTextDocument, this),
    );
  }

  async showDuplicateTextDocument(duplicate: Duplicate) : Promise<void> {
    await this.showTextDocument(duplicate.firstFile, ViewColumn.One);
    await this.showTextDocument(duplicate.secondFile, ViewColumn.Two);
  }

  async showTextDocument(item: DuplicateItem, viewColumn: ViewColumn): Promise<void> {
    const textDocument = await workspace.openTextDocument(Uri.joinPath(workspace.workspaceFolders![0].uri, item.name));
    let range = new Range(this.toPosition(item.startLoc), this.toPosition(item.endLoc));
    const activeEditor = await window.showTextDocument(textDocument!, { viewColumn: viewColumn, selection: range});
    activeEditor.setDecorations(
      window.createTextEditorDecorationType({
        fontStyle: 'oblique',
        backgroundColor: '#00a7',
        cursor: 'pointer'
      }),
      [range]
    );
    activeEditor.revealRange(range, TextEditorRevealType.InCenterIfOutsideViewport);
  }

  public parseNode(workspace: WorkspaceFolder, obj: any): TreeNode {
    const reports = obj.duplicates as Duplicate[];
    const treeNode = new TreeNode(workspace.name);

    treeNode.setChildren(
      reports.map(d => {
        const noSameIndex = this.sameDirIndexOf(d.firstFile.name, d.secondFile.name);
        const duplicate = new DuplicateNode(d.firstFile.name.substring(0, noSameIndex));
        const command = {
          title: 'Show Duplicate Text Document',
          command: 'showDuplicateTextDocument',
          arguments: [d],
        } as Command;
        duplicate.command = command;
        duplicate.setChildren(
          [d.firstFile, d.secondFile].map((i) => {
            const item = new DuplicateItemNode(
              i.name.substring(noSameIndex), 
              Uri.joinPath(workspace.uri, i.name), 
              this.toRangeString(i),
            );
            item.command = command;
            return item;
          })
        );

        return duplicate;
      })
    );
    return treeNode;
  }

  public sameDirIndexOf(a: string, b: string): number {
    const endIndex = Math.min(a.lastIndexOf(sep), b.lastIndexOf(sep)) + 1;
    for (let index = 0, lastDirIndex = 0; index < endIndex; index++) {
      if (a[index] == sep) lastDirIndex = index + 1;
      if (a[index] !== b[index]) return lastDirIndex;
    }
    return endIndex;
  }

  public toRangeString(item: DuplicateItem): string {
    return `${this.toPositionString(item.startLoc)} - ${this.toPositionString(item.endLoc)}`;
  }

  public toPositionString(position: DuplicatePosition): string {
    return `${position.line}:${position.column}`;
  }

  public toPosition(position: DuplicatePosition): Position {
    return new Position(position.line, position.column);
  }
}