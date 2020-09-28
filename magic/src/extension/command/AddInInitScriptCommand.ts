import * as vs from "vscode";

export class AddInInitScriptCommand implements vs.Disposable {
	private disposables: vs.Disposable[] = [];

	constructor() {
		this.disposables.push(
			vs.commands.registerCommand("flutter.addInInitScript", this.addInInitScript, this),
		);
  }

  private addInInitScript() {
    
  }

  public dispose(): any {
		this.disposables.forEach((e) => e.dispose());
	}
}