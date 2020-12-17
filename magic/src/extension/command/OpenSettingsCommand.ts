import { commands, Disposable } from "vscode";

export class OpenSettingsCommand implements Disposable {
	private disposables: Disposable[] = [];

	constructor() {
		this.disposables.push(
		  commands.registerCommand("magic.openSettings", this.openSettings, this),
		);
  }

  private openSettings() {
    // TODO(Nomeleel): 当作常量提取出去
    commands.executeCommand("workbench.action.openSettings", "@ext:Nomeleel.magic fieldArray");
  }

  public dispose(): any {
		this.disposables.forEach((e) => e.dispose());
	}
}