import { commands, window } from "vscode";
import { BaseDisposable } from "../BaseDisposable";

export class ShowTimeCommand extends BaseDisposable {

  constructor() {
    super();
    this.disposables.push(
      commands.registerCommand('magic.showTime', async () => {
        window.showInformationMessage('Show Time ^_^');
      })
    );
  }
}