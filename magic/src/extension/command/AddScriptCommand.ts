import { commands } from "vscode";
import { BaseDisposable } from "../BaseDisposable";

export class AddScriptCommand extends BaseDisposable {
	constructor() {
		super();
		this.disposables.push(
			commands.registerCommand("magic.addScript", this.addScript, this),
		);
  }

  private addScript() {

  }

}