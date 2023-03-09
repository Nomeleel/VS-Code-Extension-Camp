import { ThemeIcon, Uri } from "vscode";
import { TreeNode } from "../common/report_base";

export class DuplicateNode extends TreeNode {
  constructor(
    label: string,
  ) {
    super(label);
    this.iconPath = ThemeIcon.Folder;
  }
}

export class DuplicateItemNode extends TreeNode {
  constructor(
    label: string,
    public readonly resourceUri: Uri,
    public readonly description: string,
  ) {
    super(label);
    this.iconPath = ThemeIcon.File;
  }
}