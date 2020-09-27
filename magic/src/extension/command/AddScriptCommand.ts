import * as vs from "vscode";

export class AddScriptCommand implements vs.Disposable {
	private disposables: vs.Disposable[] = [];

	constructor() {
		this.disposables.push(
			vs.commands.registerCommand("flutter.openInAndroidStudio", this.addScript, this),
		);
  }

  private addScript() {
    
  }

  public dispose(): any {
		for (const command of this.disposables)
			command.dispose();
	}
}