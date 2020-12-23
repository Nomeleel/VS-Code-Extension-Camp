import * as path from "path";
import { commands, Disposable, Position, TextEdit, Uri, workspace, WorkspaceEdit } from "vscode";
import { dartOrganizeImports } from "../util/util";

export class AddInInitScriptCommand implements Disposable {
  private disposables: Disposable[] = [];

  constructor() {
    this.disposables.push(
      commands.registerCommand("magic.addInInitScript", AddInInitScriptCommand.addInInitScript, this),
    );
  }

  public static async addInInitScript(scriptPath: string) {
    if (scriptPath) {
      let currentScriptPath = AddInInitScriptCommand.currentScriptPath();
      if (currentScriptPath) {
        scriptPath = currentScriptPath;
      } else {
        return;
      }
    }

    let name = path.parse(scriptPath).name;

    let workspaceEdit = new WorkspaceEdit();
    let textEdits = Array<TextEdit>();
    
    let initScriptPath = path.resolve(scriptPath, '../InitScript.dart');
    let lineCount = await AddInInitScriptCommand.realLineCount(initScriptPath);

    textEdits.push(TextEdit.insert(new Position(lineCount - 1, 0), `  dynamicCodeMap['${name}'] = init${name};\n`));
    textEdits.push(TextEdit.insert(new Position(0, 0), `import '${name}.dart';\n`));

    workspaceEdit.set(Uri.file(initScriptPath), textEdits);
    await workspace.applyEdit(workspaceEdit);
    await workspace.saveAll();

    await dartOrganizeImports(initScriptPath);
  }

  private static currentScriptPath() : string | undefined{
    let currentScript = workspace.textDocuments.find((e) => e.languageId === 'dart');
    return currentScript?.uri.fsPath;
  }

  private static async realLineCount(path: string) : Promise<number> {
    let textDocument = await workspace.openTextDocument(path);
    let lineCount: number = textDocument.lineCount;
    console.log(lineCount);
    while(textDocument.lineAt(lineCount - 1).isEmptyOrWhitespace) {
      lineCount--;
    }
    return lineCount;
  }

  public dispose(): any {
    this.disposables.forEach((e) => e.dispose());
  }
}