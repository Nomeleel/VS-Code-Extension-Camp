import { Command, ThemeIcon, Uri } from "vscode";
import { TreeNode } from "../common/report_base";
import { getIconPath } from "../util/util";

export class UnusedNode extends TreeNode {
  constructor(
    label: string,
    public readonly resourceUri: Uri,
    start?: number,
    icon?: string,
  ) {
    super(label);
    this.iconPath = icon ? getIconPath(icon) : ThemeIcon.File;
    this.command = {
      title: 'Show Text Document',
      command: 'showTextDocument',
      arguments: [resourceUri, start, label],
    } as Command;
  }
}

export class IssueNode extends UnusedNode {
  constructor(
    label: string,
    resourceUri: Uri,
    icon: string,
    offset: number,
  ) {
    super(label, resourceUri, offset, icon);
  }
}