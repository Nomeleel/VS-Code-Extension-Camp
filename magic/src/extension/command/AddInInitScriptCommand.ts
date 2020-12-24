import * as path from "path";
import { commands, Disposable, Position, TextEdit, Uri, workspace } from "vscode";
import { dartFileEdit, realLineCount } from "../util/util";

export class AddInInitScriptCommand implements Disposable {
  private disposables: Disposable[] = [];

  constructor() {
    this.disposables.push(
      commands.registerCommand("magic.addInInitScript", this.addInInitScript, this),
    );
  }

  public async addInInitScript(scriptPath: string) {
    if (scriptPath) {
      let currentScriptPath = this.currentScriptPath();
      if (currentScriptPath) {
        scriptPath = currentScriptPath;
      } else {
        return;
      }
    }

    let name = path.parse(scriptPath).name;
    let initScriptUri = Uri.file(path.resolve(scriptPath, '../InitScript.dart'));
    let lineCount = await realLineCount(initScriptUri);

    let textEdits = Array<TextEdit>();
    textEdits.push(TextEdit.insert(new Position(lineCount - 1, 0), `  dynamicCodeMap['${name}'] = init${name};\n`));
    textEdits.push(TextEdit.insert(new Position(0, 0), `import '${name}.dart';\n`));

    await dartFileEdit(textEdits, initScriptUri);
  }

  private currentScriptPath() : string | undefined{
    let currentScript = workspace.textDocuments.find((e) => e.languageId === 'dart');
    return currentScript?.uri.fsPath;
  }



  public dispose(): any {
    this.disposables.forEach((e) => e.dispose());
  }
}