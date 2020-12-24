import * as vs from "vscode";

export class AddScriptCommand implements vs.Disposable {
	private disposables: vs.Disposable[] = [];

	constructor() {
		this.disposables.push(
			vs.commands.registerCommand("magic.addScript", this.addScript, this),
		);
  }

  private addScript() {

  }

  public dispose(): any {
		this.disposables.forEach((e) => e.dispose());
	}
}