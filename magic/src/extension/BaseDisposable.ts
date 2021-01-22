import * as vs from "vscode";

export class BaseDisposable implements vs.Disposable {
	public disposables: vs.Disposable[] = [];

  public dispose(): any {
		this.disposables.forEach((e) => e.dispose());
	}
}