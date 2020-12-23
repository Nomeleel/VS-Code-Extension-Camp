import { commands, Disposable, Position, TextEdit, Uri, window, workspace, WorkspaceEdit} from "vscode";
import { activePositionText, dartOrganizeImports } from "../util/util";

export class AddImportCommand implements Disposable {
  private disposables: Disposable[] = [];

  constructor() {
    this.disposables.push(
      commands.registerCommand("magic.addImport", this.addImport, this),
    );
  }

  public async addImport() {
    let activeText = activePositionText();
    if (activeText) {
      let importText = this.findImport(activeText);
      if (importText) {
        this.addImportToDoc(importText);
      } else {
        commands.executeCommand(`magic.openCustomizeImportArraySettings`);
        window.showInformationMessage('No suggest import found, please add it yourself');
      }
    }
  }
  
  public getImportArray() : Array<string> {
    return workspace.getConfiguration('magic.customize').get('importArray') as Array<string>;
  }

  public findImport(text: string) : string | undefined {
    let importArray = this.getImportArray();
    if (importArray.length > 0) {
      return importArray.find((e) => e.match(new RegExp(text, 'i')));
    }
  }

  public async addImportToDoc(importText: string) {
    if (window.activeTextEditor) {
      let workspaceEdit = new WorkspaceEdit();
      let textEdits = Array<TextEdit>();
  
      textEdits.push(TextEdit.insert(new Position(0, 0), `import 'package:${importText}.dart';\n`));
  
      workspaceEdit.set(window.activeTextEditor.document.uri, textEdits);
      await workspace.applyEdit(workspaceEdit);
      await workspace.saveAll();
  
      await dartOrganizeImports();
    }
  }

  public dispose(): any {
    this.disposables.forEach((e) => e.dispose());
  }
}