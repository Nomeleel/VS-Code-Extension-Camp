import { commands, Position, TextEdit, window, workspace} from "vscode";
import { BaseDisposable } from "../BaseDisposable";
import { activePositionText, dartFileEdit, getConfiguration} from "../util/util";

export class AddImportCommand extends BaseDisposable {

  constructor() {
    super();
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
    return getConfiguration<Array<string>>('magic.customize.importArray');
  }

  public findImport(text: string) : string | undefined {
    let importArray = this.getImportArray();
    if (importArray.length > 0) {
      return importArray.find((e) => e.match(new RegExp(text, 'i')));
    }
  }

  public async addImportToDoc(importText: string) {
    if (window.activeTextEditor) {
      let textEdits = Array<TextEdit>();
      textEdits.push(TextEdit.insert(new Position(0, 0), `import 'package:${importText}.dart';\n`));
      await dartFileEdit(textEdits);
    }
  }
}